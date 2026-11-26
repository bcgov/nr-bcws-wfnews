import * as P from 'piexifjs';
import { OfflineReport, OfflineReportQueueService } from './offline-report-queue.service';
import { ReportOfFireService } from './report-of-fire-service';
import { FakeIonicStorage, ionicStorageOver, rejectionOf } from './testing/fake-ionic-storage';

/**
 * Regression coverage for the EXIF handling that Report of Fire photos pass through.
 *
 * These specs pin the contract between the web layer and the native camera plugin.
 * The plugin physically rotates picked images and resets their Orientation tag to 1
 * (ImageUtils.correctOrientation calls exif.resetOrientation() before transforming the
 * bitmap). checkExifGPS then rewrites the EXIF block via piexifjs P.insert(), which
 * replaces the whole block with only the GPS dict and therefore drops Orientation.
 *
 * That combination is only safe while the native layer keeps normalising orientation.
 * If a Capacitor upgrade changes that, the "orientation survives" expectations below
 * are what should be re-read before shipping.
 */

const TEST_LATITUDE = 49.2827;
const TEST_LONGITUDE = -123.1207;

/** Builds a small, valid baseline JPEG with no EXIF block. */
function makeJpeg(width: number, height: number): string {
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');
  // Asymmetric content so a rotation would be detectable in the decoded pixels.
  ctx.fillStyle = '#ff0000';
  ctx.fillRect(0, 0, width, height);
  ctx.fillStyle = '#0000ff';
  ctx.fillRect(0, 0, Math.floor(width / 2), Math.floor(height / 2));
  return canvas.toDataURL('image/jpeg', 0.92);
}

/** Re-writes the EXIF block of a JPEG data URL with the given Orientation and optional GPS. */
function withExif(
  dataUrl: string,
  options: { orientation?: number; gps?: boolean },
): string {
  const zeroth = {};
  if (options.orientation !== undefined) {
    zeroth[P.ImageIFD.Orientation] = options.orientation;
  }

  const gps = {};
  if (options.gps) {
    gps[P.GPSIFD.GPSLatitudeRef] = 'N';
    gps[P.GPSIFD.GPSLatitude] = P.GPSHelper.degToDmsRational(TEST_LATITUDE);
    gps[P.GPSIFD.GPSLongitudeRef] = 'W';
    gps[P.GPSIFD.GPSLongitude] = P.GPSHelper.degToDmsRational(TEST_LONGITUDE);
  }

  return P.insert(P.dump({ '0th': zeroth, GPS: gps }), dataUrl);
}

function readOrientation(dataUrl: string): number | undefined {
  return P.load(dataUrl)['0th'][P.ImageIFD.Orientation];
}

function hasGps(dataUrl: string): boolean {
  const gps = P.load(dataUrl)['GPS'];
  return !!(gps && gps[P.GPSIFD.GPSLatitude] && gps[P.GPSIFD.GPSLongitude]);
}

function decode(dataUrl: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error('image failed to decode'));
    img.src = dataUrl;
  });
}

/** A ReportOfFireService over an in-memory Ionic Storage and localStorage. */
/** A NativeReportSenderService that records calls; `pending` and `sent` set its answers. */
function fakeNativeSender() {
  return {
    pendingIds: [] as string[],
    sentIds: [] as string[],
    enqueue: jasmine.createSpy('enqueue').and.callFake(async () => undefined),
    cancel: jasmine.createSpy('cancel').and.callFake(async () => undefined),
    async pending() {
      return this.pendingIds;
    },
    async takeSent() {
      const sent = this.sentIds;
      this.sentIds = [];
      return sent;
    },
  };
}

function makeService(online = { value: true }) {
  const storage = new FakeIonicStorage();
  const queue = new OfflineReportQueueService(ionicStorageOver(storage));
  const local = new Map<string, string>();
  const native = fakeNativeSender();
  const service = new ReportOfFireService(
    { getConfig: () => ({ rest: { 'fire-report-api': 'https://rof.test/submit' } }) } as any,
    { checkOnlineStatus: () => Promise.resolve(online.value) } as any,
    queue,
    {
      getData: (key: string) => local.get(key) ?? null,
      saveData: (key: string, value: string) => local.set(key, value),
    } as any,
    native as any,
  );
  return { service, storage, queue, local, online, native };
}

function queued(submissionID: string, submittedTimestamp = String(Date.now())): OfflineReport {
  return {
    submissionID,
    queuedTimestamp: Number(submittedTimestamp),
    syncAttempts: 0,
    resource: JSON.stringify({ submissionID, submittedTimestamp }),
  };
}

function sentSubmissionId(call: { args: any[] }): string {
  const body = call.args[1].body as FormData;
  return JSON.parse(body.get('resource') as string).submissionID;
}

describe('ReportOfFireService.saveReportOfFire', () => {
  let service: ReportOfFireService;
  let queue: OfflineReportQueueService;
  let online: { value: boolean };
  let native: ReturnType<typeof fakeNativeSender>;
  let fetchSpy: jasmine.Spy;

  beforeEach(() => {
    ({ service, queue, online, native } = makeService());
    fetchSpy = spyOn(window, 'fetch').and.returnValue(Promise.resolve(new Response('{}', { status: 200 })));
  });

  async function submit(submissionID: string) {
    return service.saveReportOfFire(
      { submissionID, fireLocation: [TEST_LATITUDE, TEST_LONGITUDE] },
      null,
      null,
      null,
    );
  }

  it('queues an offline report and does not send it', async () => {
    online.value = false;

    await submit('a');

    expect(fetchSpy).not.toHaveBeenCalled();
    expect((await queue.list()).map((item) => item.submissionID)).toEqual(['a']);
  });

  it('gives an offline report to the native uploader with its submitted time', async () => {
    online.value = false;

    await service.saveReportOfFire({ submissionID: 'a', submittedTimestamp: '1000' }, null, null, null);

    expect(native.enqueue).toHaveBeenCalledTimes(1);
    const [item, submitted] = native.enqueue.calls.mostRecent().args;
    expect(item.submissionID).toBe('a');
    expect(submitted).toBe(1000);
  });

  it('keeps two offline reports', async () => {
    online.value = false;

    await submit('a');
    await submit('b');

    expect((await queue.list()).map((item) => item.submissionID)).toEqual(['a', 'b']);
  });

  it('sends an online report after an offline one in the same session', async () => {
    online.value = false;
    await submit('a');

    online.value = true;
    await submit('b');

    expect(fetchSpy).toHaveBeenCalledTimes(1);
    expect(sentSubmissionId(fetchSpy.calls.mostRecent())).toBe('b');
  });

  it('queues a report when the send throws', async () => {
    fetchSpy.and.callFake(() => Promise.reject(new TypeError('Failed to fetch')));

    const result = await submit('a');

    expect(result).toEqual(jasmine.objectContaining({ success: false }));
    expect((await queue.list()).length).toBe(1);
  });

  it('queues a report when the server answers 500', async () => {
    fetchSpy.and.returnValue(Promise.resolve(new Response('{}', { status: 500 })));

    await submit('a');

    expect((await queue.list()).length).toBe(1);
  });

  it('removes the queued copy when the same report is then sent', async () => {
    await queue.add(queued('a'));

    await submit('a');

    expect(await queue.list()).toEqual([]);
  });

  it('rejects when the queue write fails', async () => {
    online.value = false;
    spyOn(queue, 'add').and.callFake(() => Promise.reject(new Error('QuotaExceededError')));

    expect((await rejectionOf(submit('a'))).message).toBe('QuotaExceededError');
  });

  // Ordinary words that the old SQL word filter stopped with no send and no save.
  for (const otherInfo of ['please update me', 'The fire may drop to the road.']) {
    it(`sends a report with "${otherInfo}" in otherInfo`, async () => {
      const result = await service.saveReportOfFire(
        { otherInfo, fireLocation: [TEST_LATITUDE, TEST_LONGITUDE] },
        null,
        null,
        null,
      );

      expect(fetchSpy).toHaveBeenCalledTimes(1);
      const body = fetchSpy.calls.mostRecent().args[1].body as FormData;
      expect(JSON.parse(body.get('resource') as string).otherInfo).toBe(otherInfo);
      expect(result).toEqual(jasmine.objectContaining({ success: true }));
    });
  }
});

describe('ReportOfFireService Sync', () => {
  let service: ReportOfFireService;
  let queue: OfflineReportQueueService;
  let storage: FakeIonicStorage;
  let local: Map<string, string>;
  let native: ReturnType<typeof fakeNativeSender>;
  let fetchSpy: jasmine.Spy;
  const failing = new Set<string>();

  beforeEach(() => {
    ({ service, queue, storage, local, native } = makeService());
    failing.clear();
    fetchSpy = spyOn(window, 'fetch').and.callFake(async (_url, init) => {
      const id = JSON.parse((init.body as FormData).get('resource') as string).submissionID;
      return new Response('{}', { status: failing.has(id) ? 500 : 200 });
    });
  });

  it('keeps only the report that fails', async () => {
    await queue.add(queued('a'));
    await queue.add(queued('b'));
    failing.add('b');

    await service.syncDataWithServer();

    const left = await queue.list();
    expect(left.map((item) => item.submissionID)).toEqual(['b']);
    expect(left[0].syncAttempts).toBe(1);
    expect(JSON.parse(local.get('submissionIDList'))).toEqual(['a']);
  });

  it('sends every report and empties the queue', async () => {
    await queue.add(queued('a'));
    await queue.add(queued('b'));

    await service.syncDataWithServer();

    expect(fetchSpy).toHaveBeenCalledTimes(2);
    expect(await queue.list()).toEqual([]);
  });

  it('keeps other Ionic Storage keys', async () => {
    storage.data.set('otherFeature', 'keep me');
    await queue.add(queued('a'));

    await service.syncDataWithServer();

    expect(storage.data.get('otherFeature')).toBe('keep me');
  });

  it('compares whole Submission IDs in the old comma-separated list', async () => {
    local.set('submissionIDList', 'abc123, def456');
    await queue.add(queued('abc123'));
    await queue.add(queued('abc'));

    await service.syncDataWithServer();

    // abc123 was sent before, so only abc goes; it is a part of abc123, not equal to it.
    expect(fetchSpy.calls.all().map(sentSubmissionId)).toEqual(['abc']);
    expect(await queue.list()).toEqual([]);
  });

  it('removes only the reports older than 24 hours', async () => {
    const twoDaysAgo = String(Date.now() - 2 * 24 * 60 * 60 * 1000);
    await queue.add(queued('old', twoDaysAgo));
    await queue.add(queued('new'));

    await service.removeInvalidOfflineRoF();

    expect((await queue.list()).map((item) => item.submissionID)).toEqual(['new']);
    expect(native.cancel.calls.allArgs()).toEqual([['old']]);
  });

  it('cancels the native copy of a report that Sync sent', async () => {
    await queue.add(queued('a'));
    failing.add('b');
    await queue.add(queued('b'));

    await service.syncDataWithServer();

    expect(native.cancel.calls.allArgs()).toEqual([['a']]);
  });

  it('records the reports the native uploader sent and removes them', async () => {
    await queue.add(queued('a'));
    await queue.add(queued('b'));
    native.sentIds = ['a'];

    await service.removeNativeSent();

    expect((await queue.list()).map((item) => item.submissionID)).toEqual(['b']);
    expect(JSON.parse(local.get('submissionIDList'))).toEqual(['a']);
    await service.syncDataWithServer();
    expect(fetchSpy.calls.all().map(sentSubmissionId)).toEqual(['b']);
  });

  it('gives the native uploader only the reports it does not hold', async () => {
    await queue.add(queued('a'));
    await queue.add(queued('b'));
    native.pendingIds = ['a'];

    await service.handQueueToNative();

    expect(native.enqueue.calls.allArgs().map(([item]) => item.submissionID)).toEqual(['b']);
  });
});

describe('ReportOfFireService EXIF handling', () => {
  let service: ReportOfFireService;

  beforeEach(() => {
    // checkExifGPS only reads this.latitude / this.longitude, so the injected
    // collaborators are not exercised here.
    service = new ReportOfFireService(
      null as any,
      null as any,
      null as any,
      null as any,
      null as any,
    );
    service.latitude = TEST_LATITUDE;
    service.longitude = TEST_LONGITUDE;
  });

  it('builds fixtures that actually carry the EXIF under test', () => {
    const fixture = withExif(makeJpeg(40, 20), { orientation: 6, gps: true });
    expect(readOrientation(fixture)).toBe(6);
    expect(hasGps(fixture)).toBe(true);
  });

  describe('when the image already carries GPS', () => {
    it('returns it byte-identical', async () => {
      const fixture = withExif(makeJpeg(40, 20), { orientation: 1, gps: true });

      const result = await service.checkExifGPS(fixture);

      expect(result).toBe(fixture);
    });

    it('leaves a non-default Orientation tag intact', async () => {
      // The plugin normally resets Orientation to 1 before this point. If a future
      // change stops it doing so, the tag survives here and any consumer honouring
      // EXIF would rotate already-upright pixels a second time.
      const fixture = withExif(makeJpeg(40, 20), { orientation: 6, gps: true });

      const result = await service.checkExifGPS(fixture);

      expect(readOrientation(result)).toBe(6);
    });
  });

  describe('when the image has no GPS', () => {
    it('stamps the reported location', async () => {
      const fixture = withExif(makeJpeg(40, 20), { orientation: 1 });
      expect(hasGps(fixture)).toBe(false);

      const result = await service.checkExifGPS(fixture);

      expect(hasGps(result)).toBe(true);
    });

    it('leaves the image decodable at unchanged dimensions', async () => {
      const fixture = withExif(makeJpeg(40, 20), { orientation: 1 });

      const result = await service.checkExifGPS(fixture);
      const decoded = await decode(result);

      expect(decoded.naturalWidth).toBe(40);
      expect(decoded.naturalHeight).toBe(20);
    });

    it('drops the Orientation tag when rewriting EXIF', async () => {
      // P.insert() replaces the entire EXIF block with only the GPS dict. This is
      // safe *only* because the native plugin has already rotated the pixels and
      // reset Orientation to 1. Documented here so the coupling is explicit.
      const fixture = withExif(makeJpeg(40, 20), { orientation: 6 });
      expect(readOrientation(fixture)).toBe(6);

      const result = await service.checkExifGPS(fixture);

      expect(readOrientation(result)).toBeUndefined();
    });
  });
});
