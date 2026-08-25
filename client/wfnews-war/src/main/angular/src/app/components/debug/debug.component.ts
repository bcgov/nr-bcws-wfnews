import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Device } from '@capacitor/device';
import { Network } from '@capacitor/network';
import { CapacitorService } from '@app/services/capacitor-service';
import { CommonUtilityService } from '@app/services/common-utility.service';
import { DebugAccessService } from '@app/services/debug-access.service';
import { ResourcesRoutes } from '@app/utils';
import { AppConfigService } from '@wf1/core-ui';
import { BUILD_NUMBER } from '../../../environments/build-info';

interface Row {
  label: string;
  value: string;
}

/** A reachability test that takes longer than this is worth saying out loud. */
const SLOW_MS = 2000;

/**
 * The diagnostics screen. Ten taps on the version label open it.
 *
 * It answers the question that a support call cannot answer today: was it the
 * network, the API, or the app. Everything on it is read on demand. Nothing here
 * runs on a timer, because a test spends the connection that it measures.
 */
@Component({
  selector: 'wfnews-debug',
  templateUrl: './debug.component.html',
  styleUrls: ['./debug.component.scss'],
})
export class DebugComponent implements OnInit {
  public app: Row[] = [];
  public device: Row[] = [];
  public network: Row[] = [];
  public reach: Row[] = [];
  public testing = false;
  public copied = false;

  constructor(
    private router: Router,
    private appConfig: AppConfigService,
    private capacitorService: CapacitorService,
    private commonUtilityService: CommonUtilityService,
    private access: DebugAccessService,
  ) {}

  async ngOnInit(): Promise<void> {
    await this.read();
  }

  back(): void {
    this.router.navigate([ResourcesRoutes.MORE]);
  }

  /** Closes the screen for this session. The taps open it again. */
  close(): void {
    this.access.lock();
    this.router.navigate([ResourcesRoutes.MORE]);
  }

  async read(): Promise<void> {
    const config = this.appConfig.getConfig();

    this.app = [
      { label: 'Version', value: config.application.version || 'unknown' },
      { label: 'Build', value: BUILD_NUMBER || 'unknown' },
      { label: 'API', value: this.hostOf(config.rest['wfnews']) },
      { label: 'Notifications API', value: this.hostOf(config.rest['notification-api']) },
    ];

    this.device = await this.readDevice();
    this.network = await this.readNetwork();
  }

  private hostOf(url: string): string {
    try {
      return new URL(url).host;
    } catch {
      return url || 'not set';
    }
  }

  private async readDevice(): Promise<Row[]> {
    try {
      const info = await Device.getInfo();
      const id = await Device.getId();
      const permission = await this.capacitorService.refreshLocationPermission();
      return [
        { label: 'Model', value: `${info.manufacturer || ''} ${info.model || ''}`.trim() },
        { label: 'Platform', value: `${info.platform} ${info.osVersion || ''}`.trim() },
        { label: 'WebView', value: info.webViewVersion || 'unknown' },
        { label: 'Device id', value: id.identifier },
        { label: 'Location permission', value: permission },
      ];
    } catch (error) {
      return [{ label: 'Device', value: `could not be read: ${error}` }];
    }
  }

  /**
   * The connection type is true. The speed and the round trip are what the WebView
   * believes, and on Android they follow the radio and not the path, so they can
   * say 4G on a link that takes two seconds for one small read.
   */
  private async readNetwork(): Promise<Row[]> {
    const rows: Row[] = [];
    try {
      const status = await Network.getStatus();
      rows.push({ label: 'Connected', value: status.connected ? 'yes' : 'no' });
      rows.push({ label: 'Connection', value: status.connectionType });
    } catch (error) {
      rows.push({ label: 'Connection', value: `could not be read: ${error}` });
    }

    const estimate = (navigator as any).connection;
    rows.push({ label: 'Browser says online', value: navigator.onLine ? 'yes' : 'no' });
    if (estimate) {
      rows.push({
        label: 'WebView estimate',
        value: `${estimate.effectiveType}, ${estimate.downlink} Mbit/s, ${estimate.rtt} ms — follows the radio, not the path`,
      });
      rows.push({ label: 'Data saver', value: estimate.saveData ? 'on' : 'off' });
    }
    return rows;
  }

  /** One small read of the API, timed. This is the only honest speed signal here. */
  async testReachability(): Promise<void> {
    this.testing = true;
    this.reach = [];
    const started = Date.now();
    try {
      await this.commonUtilityService.pingService().toPromise();
      const ms = Date.now() - started;
      this.reach = [
        { label: 'API reachable', value: 'yes' },
        { label: 'Time', value: `${ms} ms${ms > SLOW_MS ? ' — slow' : ''}` },
      ];
    } catch (error) {
      this.reach = [
        { label: 'API reachable', value: 'no' },
        { label: 'Time', value: `${Date.now() - started} ms` },
        { label: 'Error', value: String(error?.status ?? error).slice(0, 120) },
      ];
    } finally {
      this.testing = false;
      this.network = await this.readNetwork();
    }
  }

  /** All of it as text, so a user can paste it into a support message. */
  async copy(): Promise<void> {
    const block = [
      ['App', this.app],
      ['Device', this.device],
      ['Network', this.network],
      ['Reachability', this.reach],
    ]
      .filter(([, rows]) => (rows as Row[]).length)
      .map(
        ([title, rows]) =>
          `${title}\n` + (rows as Row[]).map((r) => `  ${r.label}: ${r.value}`).join('\n'),
      )
      .join('\n\n');

    try {
      await navigator.clipboard.writeText(block);
      this.copied = true;
      setTimeout(() => (this.copied = false), 3000);
    } catch (error) {
      console.error('Could not copy the diagnostics', error);
    }
  }
}
