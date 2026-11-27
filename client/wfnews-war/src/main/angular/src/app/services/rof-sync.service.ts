import { Injectable, NgZone } from '@angular/core';
import { App } from '@capacitor/app';
import { Capacitor } from '@capacitor/core';
import { Network } from '@capacitor/network';
import { BackgroundTask } from '@capawesome/capacitor-background-task';
import { ConnectivityService } from './connectivity.service';
import { OfflineReportQueueService } from './offline-report-queue.service';
import { ReportOfFireService } from './report-of-fire-service';

export const SYNC_INTERVAL_MS = 60_000;

// Capacitor plugins are proxies that a spec cannot spy on, so they come in through here.
@Injectable({
  providedIn: 'root',
})
export class RofSyncPlugins {
  readonly app = App;
  readonly network = Network;
  readonly backgroundTask = BackgroundTask;

  isNativePlatform(): boolean {
    return Capacitor.isNativePlatform();
  }
}

/**
 * Sends the Offline Queue from every screen: at start, on resume, on reconnect and on a timer.
 * With the app closed, the native uploader sends it (NativeReportSenderService).
 */
@Injectable({
  providedIn: 'root',
})
export class RofSyncService {
  private started = false;
  private foreground = true;
  private running: Promise<void> | null = null;
  private timer: ReturnType<typeof setInterval> | null = null;

  constructor(
    private reportOfFireService: ReportOfFireService,
    private connectivityService: ConnectivityService,
    private queue: OfflineReportQueueService,
    private plugins: RofSyncPlugins,
    private zone: NgZone,
  ) {}

  async start(): Promise<void> {
    if (this.started) {
      return;
    }
    this.started = true;

    try {
      await this.plugins.app.addListener('resume', () => {
        this.foreground = true;
        return this.sync();
      });
      await this.plugins.app.addListener('appStateChange', ({ isActive }) =>
        this.onAppStateChange(isActive),
      );
      await this.plugins.network.addListener('networkStatusChange', ({ connected }) =>
        connected ? this.sync() : undefined,
      );
    } catch (error) {
      console.error('Sync listeners failed:', error);
    }
    this.queue.added.subscribe(() => this.updateTimer(true));

    await this.sync();
    await this.reportOfFireService
      .handQueueToNative()
      .catch((error) => console.error('Native hand-over failed:', error));
  }

  sync(): Promise<void> {
    // A trigger during a Sync joins it, so two triggers send one ping.
    if (!this.running) {
      this.running = this.runSync().finally(() => (this.running = null));
    }
    return this.running;
  }

  private async runSync(): Promise<void> {
    try {
      await this.reportOfFireService.removeInvalidOfflineRoF();
      await this.reportOfFireService.removeNativeSent();
      if (!(await this.hasItems())) {
        this.stopTimer();
        return;
      }
      // A network event can report a hotel login page as connected.
      if (await this.connectivityService.checkOnlineStatus()) {
        await this.reportOfFireService.syncDataWithServer();
      }
      this.updateTimer(await this.hasItems());
    } catch (error) {
      console.error('Sync failed:', error);
    }
  }

  private async onAppStateChange(isActive: boolean): Promise<void> {
    this.foreground = isActive;
    if (isActive) {
      return;
    }
    this.stopTimer();
    if (!this.plugins.isNativePlatform() || !(await this.hasItems())) {
      return;
    }
    const taskId = await this.plugins.backgroundTask.beforeExit(async () => {
      try {
        await this.sync();
      } finally {
        this.plugins.backgroundTask.finish({ taskId });
      }
    });
  }

  private async hasItems(): Promise<boolean> {
    return (await this.queue.list()).length > 0;
  }

  private updateTimer(hasItems: boolean): void {
    if (hasItems && this.foreground) {
      this.startTimer();
    } else {
      this.stopTimer();
    }
  }

  private startTimer(): void {
    if (this.timer) {
      return;
    }
    // Outside the Angular zone, so a waiting timer does not keep the app unstable.
    this.zone.runOutsideAngular(() => {
      this.timer = setInterval(() => this.sync(), SYNC_INTERVAL_MS);
    });
  }

  private stopTimer(): void {
    if (this.timer) {
      clearInterval(this.timer);
      this.timer = null;
    }
  }
}
