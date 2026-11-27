import { Injectable } from '@angular/core';
import { Capacitor } from '@capacitor/core';
import { AppConfigService } from '@wf1/core-ui';
import { OfflineReport } from './offline-report-queue.service';
import { RofUploader, RofUploaderPlugin } from './rof-uploader.plugin';

export const OFFLINE_REPORT_MAX_AGE_MS = 24 * 60 * 60 * 1000;

// The plugin is a Capacitor proxy that a spec cannot spy on, so it comes in through here.
@Injectable({
  providedIn: 'root',
})
export class RofUploaderBridge {
  readonly plugin: RofUploaderPlugin = RofUploader;

  isNativePlatform(): boolean {
    return Capacitor.isNativePlatform();
  }
}

/**
 * Gives each queued report to the native uploader, so the OS sends it with the app closed.
 * The Offline Queue and Sync stay the record; a native error only logs.
 */
@Injectable({
  providedIn: 'root',
})
export class NativeReportSenderService {
  constructor(
    private appConfigService: AppConfigService,
    private bridge: RofUploaderBridge,
  ) {}

  isAvailable(): boolean {
    return this.bridge.isNativePlatform();
  }

  async enqueue(report: OfflineReport, submittedTimestamp: number): Promise<void> {
    if (!this.bridge.isNativePlatform()) {
      return;
    }
    try {
      await this.bridge.plugin.enqueue({
        submissionID: report.submissionID,
        url: this.appConfigService.getConfig().rest['fire-report-api'],
        expiresAt: submittedTimestamp + OFFLINE_REPORT_MAX_AGE_MS,
        resource: report.resource,
        image1: report.image1,
        image2: report.image2,
        image3: report.image3,
      });
    } catch (error) {
      console.error('Native report sender: enqueue failed', error);
    }
  }

  async pending(): Promise<string[]> {
    return this.ids(() => this.bridge.plugin.pending(), 'pending');
  }

  async takeSent(): Promise<string[]> {
    return this.ids(() => this.bridge.plugin.takeSent(), 'takeSent');
  }

  async cancel(submissionID: string): Promise<void> {
    if (!this.bridge.isNativePlatform()) {
      return;
    }
    try {
      await this.bridge.plugin.cancel({ submissionID });
    } catch (error) {
      console.error('Native report sender: cancel failed', error);
    }
  }

  private async ids(
    call: () => Promise<{ submissionIDs: string[] }>,
    name: string,
  ): Promise<string[]> {
    if (!this.bridge.isNativePlatform()) {
      return [];
    }
    try {
      return (await call()).submissionIDs ?? [];
    } catch (error) {
      console.error(`Native report sender: ${name} failed`, error);
      return [];
    }
  }
}
