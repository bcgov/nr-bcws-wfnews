import {
  NativeReportSenderService,
  OFFLINE_REPORT_MAX_AGE_MS,
  RofUploaderBridge,
} from './native-report-sender.service';
import { OfflineReport } from './offline-report-queue.service';

const REPORT: OfflineReport = {
  submissionID: 'abc123',
  queuedTimestamp: 5,
  syncAttempts: 0,
  resource: '{"submissionID":"abc123"}',
  image1: 'data:image/jpeg;base64,AAAA',
};

describe('NativeReportSenderService', () => {
  let native: boolean;
  let plugin: {
    enqueue: jasmine.Spy;
    pending: jasmine.Spy;
    takeSent: jasmine.Spy;
    cancel: jasmine.Spy;
  };
  let sender: NativeReportSenderService;

  beforeEach(() => {
    native = true;
    plugin = {
      enqueue: jasmine.createSpy('enqueue').and.callFake(async () => undefined),
      pending: jasmine.createSpy('pending').and.callFake(async () => ({ submissionIDs: ['p'] })),
      takeSent: jasmine.createSpy('takeSent').and.callFake(async () => ({ submissionIDs: ['s'] })),
      cancel: jasmine.createSpy('cancel').and.callFake(async () => undefined),
    };
    const bridge = { plugin, isNativePlatform: () => native } as unknown as RofUploaderBridge;
    const config = {
      getConfig: () => ({ rest: { 'fire-report-api': 'https://wfnews-int.bcwildfireservices.com/notifications-api/rof' } }),
    };
    sender = new NativeReportSenderService(config as any, bridge);
  });

  it('gives the report, the API address and the expiry time to the plugin', async () => {
    await sender.enqueue(REPORT, 1000);

    expect(plugin.enqueue).toHaveBeenCalledWith({
      submissionID: 'abc123',
      url: 'https://wfnews-int.bcwildfireservices.com/notifications-api/rof',
      expiresAt: 1000 + OFFLINE_REPORT_MAX_AGE_MS,
      resource: REPORT.resource,
      image1: REPORT.image1,
      image2: undefined,
      image3: undefined,
    });
  });

  it('returns the Submission IDs from the plugin', async () => {
    expect(await sender.pending()).toEqual(['p']);
    expect(await sender.takeSent()).toEqual(['s']);
  });

  it('does nothing on the web', async () => {
    native = false;

    await sender.enqueue(REPORT, 1000);
    await sender.cancel('abc123');

    expect(await sender.pending()).toEqual([]);
    expect(await sender.takeSent()).toEqual([]);
    expect(plugin.enqueue).not.toHaveBeenCalled();
    expect(plugin.cancel).not.toHaveBeenCalled();
  });

  it('keeps a plugin error from the caller', async () => {
    spyOn(console, 'error');
    plugin.enqueue.and.callFake(async () => Promise.reject(new Error('no space')));
    plugin.takeSent.and.callFake(async () => Promise.reject(new Error('unreadable')));

    await sender.enqueue(REPORT, 1000);

    expect(await sender.takeSent()).toEqual([]);
    expect(console.error).toHaveBeenCalledTimes(2);
  });
});
