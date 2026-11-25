import { IonicStorageService } from './ionic-storage.service';
import {
  LEGACY_OFFLINE_REPORT_KEY,
  OFFLINE_REPORT_QUEUE_KEY,
  OfflineReport,
  OfflineReportQueueService,
} from './offline-report-queue.service';
import { FakeIonicStorage, ionicStorageOver, rejectionOf } from './testing/fake-ionic-storage';

function item(submissionID: string): OfflineReport {
  return {
    submissionID,
    queuedTimestamp: 1,
    syncAttempts: 0,
    resource: JSON.stringify({ submissionID, otherInfo: 'smoke' }),
    image1: 'data:image/jpeg;base64,AAAA',
  };
}

describe('IonicStorageService', () => {
  it('writes a value that is set before storage is ready', async () => {
    let open: () => void;
    const fake = new FakeIonicStorage(new Promise<void>((resolve) => (open = resolve)));
    const storage = new IonicStorageService(fake as any);

    const write = storage.set('key', 'value');
    open();
    await write;

    expect(fake.data.get('key')).toBe('value');
  });
});

describe('OfflineReportQueueService', () => {
  let fake: FakeIonicStorage;
  let queue: OfflineReportQueueService;

  beforeEach(() => {
    fake = new FakeIonicStorage();
    queue = new OfflineReportQueueService(ionicStorageOver(fake));
  });

  it('keeps two reports', async () => {
    await queue.add(item('a'));
    await queue.add(item('b'));

    expect((await queue.list()).map((report) => report.submissionID)).toEqual(['a', 'b']);
  });

  it('keeps one report when the same Submission ID is added twice', async () => {
    await queue.add(item('a'));
    await queue.add(item('a'));

    expect((await queue.list()).length).toBe(1);
  });

  it('keeps both reports when two adds start together', async () => {
    await Promise.all([queue.add(item('a')), queue.add(item('b'))]);

    expect((await queue.list()).length).toBe(2);
  });

  it('removes one report only', async () => {
    await queue.add(item('a'));
    await queue.add(item('b'));

    await queue.remove('a');

    expect((await queue.list()).map((report) => report.submissionID)).toEqual(['b']);
  });

  it('counts a Sync attempt on one report', async () => {
    await queue.add(item('a'));
    await queue.add(item('b'));

    await queue.markAttempt('b');

    const reports = await queue.list();
    expect(reports.find((report) => report.submissionID === 'a').syncAttempts).toBe(0);
    expect(reports.find((report) => report.submissionID === 'b').syncAttempts).toBe(1);
  });

  it('moves an old offlineReportData value into the list', async () => {
    const resource = JSON.stringify({ submissionID: 'old', submittedTimestamp: '1700000000000' });
    fake.data.set(
      LEGACY_OFFLINE_REPORT_KEY,
      JSON.stringify({ resource, image1: 'data:image/jpeg;base64,BBBB' }),
    );

    const reports = await queue.list();

    expect(reports.length).toBe(1);
    expect(reports[0]).toEqual(jasmine.objectContaining({
      submissionID: 'old',
      queuedTimestamp: 1700000000000,
      resource,
      image1: 'data:image/jpeg;base64,BBBB',
    }));
    expect(fake.data.has(LEGACY_OFFLINE_REPORT_KEY)).toBe(false);
    expect(fake.data.get(OFFLINE_REPORT_QUEUE_KEY)).toEqual(reports);
  });

  it('drops an unreadable old value and still works', async () => {
    fake.data.set(LEGACY_OFFLINE_REPORT_KEY, '{not json');

    await queue.add(item('a'));

    expect((await queue.list()).map((report) => report.submissionID)).toEqual(['a']);
    expect(fake.data.has(LEGACY_OFFLINE_REPORT_KEY)).toBe(false);
  });

  it('lets a write error go to the caller', async () => {
    spyOn(fake, 'set').and.callFake(() => Promise.reject(new Error('QuotaExceededError')));

    expect((await rejectionOf(queue.add(item('a')))).message).toBe('QuotaExceededError');
  });
});
