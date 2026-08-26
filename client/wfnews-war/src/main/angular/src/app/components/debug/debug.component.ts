import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Device } from '@capacitor/device';
import { NetworkDiagnostics } from '@capgo/capacitor-network-diagnostics';
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

/** A read that takes longer than this is worth saying out loud. */
const SLOW_MS = 2000;

/** Enough bytes to measure a speed, few enough to be fair on a metered link. */
const DOWNLOAD_LIMIT_BYTES = 512 * 1024;

/** Probes for the loss test. Ten is the plugin default and takes too long on 2G. */
const LOSS_PROBES = 6;

/**
 * The diagnostics screen. Ten taps on the version label open it.
 *
 * It answers the question that a support call cannot answer today: was it the
 * network, the API, or the app. Nothing here runs on a timer, because a test
 * spends the connection that it measures.
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
  public deep: Row[] = [];
  public issues: string[] = [];
  public testing = false;
  public deepTesting = false;
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

  /** The map service, which needs no key and returns a large body. */
  private capabilitiesUrl(): string {
    // The rest of the code reaches mapServices this way: it is not on the typed config.
    const base = this.appConfig.getConfig()['mapServices']?.['openmapsBaseUrl'];
    return base ? `${base}?service=WMS&request=GetCapabilities` : '';
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
   * The native status is the one to trust. `internetReachable` is the Android
   * validated flag: it means the path was tested and it goes somewhere. That is
   * the answer `navigator.onLine` cannot give, and it is what makes a captive
   * portal visible.
   */
  private async readNetwork(): Promise<Row[]> {
    const rows: Row[] = [];
    try {
      const status = await NetworkDiagnostics.getNetworkStatus();
      rows.push({ label: 'Connected', value: status.connected ? 'yes' : 'no' });
      rows.push({ label: 'Connection', value: status.connectionType });
      rows.push({
        label: 'Reaches the internet',
        value: status.internetReachable ? 'yes, validated by the OS' : 'no',
      });
      if (status.captivePortal) rows.push({ label: 'Captive portal', value: 'yes — a sign-in page is in the way' });
      if (status.expensive) rows.push({ label: 'Metered', value: 'yes — the user pays for these bytes' });
      if (status.constrained) rows.push({ label: 'Low data mode', value: 'on' });
    } catch (error) {
      rows.push({ label: 'Native status', value: `could not be read: ${error}` });
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

  /** One small read of the API through the WebView, timed. This carries the key. */
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

  /**
   * The native test. It measures the path that `CapacitorHttp` uses, which no
   * measurement inside the WebView can see, and it is the only way this app can
   * learn its own throughput: the API sends no `Timing-Allow-Origin`, so the
   * WebView reports every response as zero bytes.
   */
  async testDeep(): Promise<void> {
    this.deepTesting = true;
    this.deep = [];
    this.issues = [];
    const api = this.appConfig.getConfig().rest['wfnews'];
    const capabilities = this.capabilitiesUrl();

    try {
      const result = await NetworkDiagnostics.runDiagnostics({
        // Only the API. The native path carries no key, so a 401 here is the
        // answer we want: the host was reached. The map service is not probed with
        // HEAD, because GeoServer answers 404 to a HEAD on GetCapabilities. The
        // download and the loss test below already prove that host answers.
        urls: [{ url: api, method: 'HEAD', timeoutMs: 15000 }],
        ...(capabilities
          ? {
              download: { url: capabilities, maxBytes: DOWNLOAD_LIMIT_BYTES, timeoutMs: 30000 },
              packetLoss: { mode: 'http', url: capabilities, count: LOSS_PROBES, timeoutMs: 5000 },
            }
          : {}),
      });

      const rows: Row[] = [];
      for (const url of result.urls || []) {
        rows.push({
          label: `Native reach ${this.hostOf(url.url)}`,
          // A 401 is an answer. The server was reached and it refused, which is
          // not the same as a server that could not be reached at all.
          value: url.reachable
            ? `answered ${url.statusCode ?? ''} in ${url.durationMs} ms`
            : `no answer — ${url.errorCode || url.errorMessage || 'unknown'}`,
        });
      }

      if (result.download) {
        const d = result.download;
        rows.push({
          label: 'Download',
          value: d.ok
            ? `${Math.round(d.bytesDownloaded / 1024)} kB in ${d.durationMs} ms — ${d.mbps.toFixed(2)} Mbit/s`
            : `failed — ${d.errorCode || d.errorMessage || 'unknown'}`,
        });
      }

      if (result.packetLoss) {
        const p = result.packetLoss;
        rows.push({
          label: 'Packet loss',
          value:
            `${p.lossPercent}% (${p.lost} of ${p.sent} lost)` +
            (p.averageLatencyMs !== undefined ? `, average ${Math.round(p.averageLatencyMs)} ms` : ''),
        });
      }

      this.deep = rows;
      // A 401 from the API is the expected answer here, because the native test
      // sends no key. Reporting it as a fault would teach a support person to
      // ignore this list, and then it is worth nothing when it is right.
      const expected401 = (result.urls || []).some((u) => u.url === api && u.statusCode === 401);
      this.issues = (result.issues || []).filter(
        (issue) => !(expected401 && issue.includes(api)),
      );
    } catch (error) {
      this.deep = [{ label: 'Native test', value: `failed: ${error}` }];
    } finally {
      this.deepTesting = false;
      this.network = await this.readNetwork();
    }
  }

  /** All of it as text, so a user can paste it into a support message. */
  async copy(): Promise<void> {
    const sections: Array<[string, Row[]]> = [
      ['App', this.app],
      ['Device', this.device],
      ['Network', this.network],
      ['Reachability', this.reach],
      ['Native test', this.deep],
    ];

    let block = sections
      .filter(([, rows]) => rows.length)
      .map(([title, rows]) => `${title}\n` + rows.map((r) => `  ${r.label}: ${r.value}`).join('\n'))
      .join('\n\n');

    if (this.issues.length) {
      block += `\n\nIssues\n` + this.issues.map((i) => `  ${i}`).join('\n');
    }

    try {
      await navigator.clipboard.writeText(block);
      this.copied = true;
      setTimeout(() => (this.copied = false), 3000);
    } catch (error) {
      console.error('Could not copy the diagnostics', error);
    }
  }
}
