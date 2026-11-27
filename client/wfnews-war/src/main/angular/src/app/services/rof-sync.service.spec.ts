import { NgZone } from '@angular/core';
import { discardPeriodicTasks, fakeAsync, flushMicrotasks, tick } from '@angular/core/testing';
import { ConnectivityService } from './connectivity.service';
import { OfflineReport, OfflineReportQueueService } from './offline-report-queue.service';
import { ReportOfFireService } from './report-of-fire-service';
import { RofSyncPlugins, RofSyncService, SYNC_INTERVAL_MS } from './rof-sync.service';
import { FakeIonicStorage, ionicStorageOver } from './testing/fake-ionic-storage';

function queued(submissionID: string): OfflineReport {
  return {
    submissionID,
    queuedTimestamp: Date.now(),
    syncAttempts: 0,
    resource: JSON.stringify({ submissionID }),
  };
}

class FakePlugins {
  native = true;
  readonly listeners = new Map<string, (event?: any) => any>();
  readonly app = { addListener: this.listen() };
  readonly network = { addListener: this.listen() };
  readonly backgroundTask = {
    exitTask: null as () => Promise<void>,
    beforeExit: jasmine.createSpy('beforeExit').and.callFake(async (task) => {
      this.backgroundTask.exitTask = task;
      return 'task-1';
    }),
    finish: jasmine.createSpy('finish'),
  };

  isNativePlatform() {
    return this.native;
  }

  fire(event: string, payload?: any) {
    this.listeners.get(event)(payload);
  }

  private listen() {
    return async (event: string, handler: (event?: any) => any) => {
      this.listeners.set(event, handler);
      return { remove: async () => undefined };
    };
  }
}

describe('RofSyncService', () => {
  let queue: OfflineReportQueueService;
  let rof: { removeInvalidOfflineRoF: jasmine.Spy; syncDataWithServer: jasmine.Spy };
  let connectivity: { checkOnlineStatus: jasmine.Spy };
  let plugins: FakePlugins;
  let service: RofSyncService;

  const sendAll = async () => {
    for (const item of await queue.list()) {
      await queue.remove(item.submissionID);
    }
  };

  const add = (submissionID: string) => {
    queue.add(queued(submissionID));
    flushMicrotasks();
  };

  const start = () => {
    service.start();
    flushMicrotasks();
  };

  // Outside fakeAsync, storage.create() settles on the real microtask queue, which no flush reaches.
  beforeEach(fakeAsync(() => {
    queue = new OfflineReportQueueService(ionicStorageOver(new FakeIonicStorage()));
    rof = jasmine.createSpyObj('ReportOfFireService', ['removeInvalidOfflineRoF', 'syncDataWithServer']);
    // resolveTo gives a native Promise, which flushMicrotasks does not flush.
    rof.removeInvalidOfflineRoF.and.callFake(async () => undefined);
    rof.syncDataWithServer.and.callFake(sendAll);
    connectivity = jasmine.createSpyObj('ConnectivityService', ['checkOnlineStatus']);
    connectivity.checkOnlineStatus.and.callFake(async () => true);
    plugins = new FakePlugins();
    const zone = { runOutsideAngular: (fn: () => unknown) => fn() } as NgZone;
    service = new RofSyncService(
      rof as unknown as ReportOfFireService,
      connectivity as unknown as ConnectivityService,
      queue,
      plugins as unknown as RofSyncPlugins,
      zone,
    );
    flushMicrotasks();
  }));

  it('syncs one time at start', fakeAsync(() => {
    add('a');

    start();

    expect(rof.syncDataWithServer).toHaveBeenCalledTimes(1);
    expect(rof.removeInvalidOfflineRoF).toHaveBeenCalledTimes(1);
  }));

  it('syncs one time on resume', fakeAsync(() => {
    start();
    add('a');

    plugins.fire('resume');
    flushMicrotasks();

    expect(rof.syncDataWithServer).toHaveBeenCalledTimes(1);
  }));

  it('syncs one time when the network comes back', fakeAsync(() => {
    start();
    add('a');

    plugins.fire('networkStatusChange', { connected: false });
    flushMicrotasks();
    expect(rof.syncDataWithServer).not.toHaveBeenCalled();

    plugins.fire('networkStatusChange', { connected: true });
    flushMicrotasks();
    expect(rof.syncDataWithServer).toHaveBeenCalledTimes(1);
  }));

  it('sends no ping when the queue is empty', fakeAsync(() => {
    start();
    plugins.fire('resume');
    flushMicrotasks();

    expect(rof.removeInvalidOfflineRoF).toHaveBeenCalledTimes(2);
    expect(connectivity.checkOnlineStatus).not.toHaveBeenCalled();
    expect(rof.syncDataWithServer).not.toHaveBeenCalled();
  }));

  it('does not sync when the API does not answer', fakeAsync(() => {
    connectivity.checkOnlineStatus.and.callFake(async () => false);
    add('a');

    start();

    expect(connectivity.checkOnlineStatus).toHaveBeenCalledTimes(1);
    expect(rof.syncDataWithServer).not.toHaveBeenCalled();
    discardPeriodicTasks();
  }));

  it('gives one Sync for two triggers at the same time', fakeAsync(() => {
    start();
    add('a');

    plugins.fire('resume');
    plugins.fire('networkStatusChange', { connected: true });
    flushMicrotasks();

    expect(connectivity.checkOnlineStatus).toHaveBeenCalledTimes(1);
    expect(rof.syncDataWithServer).toHaveBeenCalledTimes(1);
  }));

  // fakeAsync fails a spec that leaves an interval running, so each one here proves the stop.
  it('syncs on the timer and stops it when the queue is empty', fakeAsync(() => {
    let calls = 0;
    rof.syncDataWithServer.and.callFake(async () => {
      if (++calls > 1) {
        await sendAll();
      }
    });
    add('a');
    start();
    expect(rof.syncDataWithServer).toHaveBeenCalledTimes(1);

    tick(SYNC_INTERVAL_MS);
    expect(rof.syncDataWithServer).toHaveBeenCalledTimes(2);

    tick(3 * SYNC_INTERVAL_MS);
    expect(rof.syncDataWithServer).toHaveBeenCalledTimes(2);
  }));

  it('starts the timer when a report is queued', fakeAsync(() => {
    start();
    add('a');
    expect(rof.syncDataWithServer).not.toHaveBeenCalled();

    tick(SYNC_INTERVAL_MS);

    expect(rof.syncDataWithServer).toHaveBeenCalledTimes(1);
  }));

  it('stops the timer in the background', fakeAsync(() => {
    plugins.native = false;
    rof.syncDataWithServer.and.callFake(async () => undefined);
    add('a');
    start();

    plugins.fire('appStateChange', { isActive: false });
    flushMicrotasks();
    tick(3 * SYNC_INTERVAL_MS);

    expect(rof.syncDataWithServer).toHaveBeenCalledTimes(1);
  }));

  it('finishes the background task after its Sync', fakeAsync(() => {
    const order: string[] = [];
    rof.syncDataWithServer.and.callFake(async () => {
      order.push('sync');
      await sendAll();
    });
    plugins.backgroundTask.finish.and.callFake(() => order.push('finish'));
    start();
    add('a');

    plugins.fire('appStateChange', { isActive: false });
    flushMicrotasks();
    plugins.backgroundTask.exitTask();
    flushMicrotasks();

    expect(order).toEqual(['sync', 'finish']);
    expect(plugins.backgroundTask.finish).toHaveBeenCalledWith({ taskId: 'task-1' });
  }));

  it('starts no background task on the web', fakeAsync(() => {
    plugins.native = false;
    start();
    add('a');

    plugins.fire('appStateChange', { isActive: false });
    flushMicrotasks();

    expect(plugins.backgroundTask.beforeExit).not.toHaveBeenCalled();
  }));

  it('starts no background task when the queue is empty', fakeAsync(() => {
    start();

    plugins.fire('appStateChange', { isActive: false });
    flushMicrotasks();

    expect(plugins.backgroundTask.beforeExit).not.toHaveBeenCalled();
  }));
});
