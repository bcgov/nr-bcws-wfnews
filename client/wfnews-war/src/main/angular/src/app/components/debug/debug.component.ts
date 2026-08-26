import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Device } from '@capacitor/device';
import { PushNotifications } from '@capacitor/push-notifications';
import { NotificationSettings } from '@app/services/notification-settings.plugin';
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

/**
 * The first read. On a slow link this is the whole test, and it is accurate there:
 * when the pipe is the limit, a small read already runs at the pipe speed.
 */
const PROBE_BYTES = 512 * 1024;

/**
 * The second read, on a link that proved it is quick. TCP starts slow and speeds
 * up, so a small read never reaches full speed. Measured on this device over one
 * Wi-Fi: 512 kB reported 4 Mbit/s where 4 MB reported 27 Mbit/s.
 */
const FULL_BYTES = 4 * 1024 * 1024;

/**
 * Read more only when the first read was this quick. Above that speed the 4 MB
 * read takes about ten seconds; below it a user waits minutes for a number they
 * already have.
 */
const ESCALATE_UNDER_MS = 1500;

/** Probes for the loss test. Ten is the plugin default and takes too long on 2G. */
const LOSS_PROBES = 6;

/** A value that has not been read yet. The row is there from the start, so the page does not jump. */
const NOT_YET = '—';

/** A read takes about 100 ms. Hold the button state long enough for a person to see it. */
const MIN_FEEDBACK_MS = 400;

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
  public notifications: Row[] = [];
  // The test rows exist before the test runs, so a result fills a row instead of
  // adding one. The page keeps its shape.
  public reach: Row[] = [
    { label: 'API answers', value: NOT_YET },
    { label: 'Time', value: NOT_YET },
  ];
  public deep: Row[] = [
    { label: 'API answers', value: NOT_YET },
    { label: 'Download', value: NOT_YET },
    { label: 'Packet loss', value: NOT_YET },
    { label: 'Connect time', value: NOT_YET },
  ];
  public issues: string[] = [];
  public testing = false;
  public deepTesting = false;
  public refreshing = false;
  public readAt = '';
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

  /** Writes a value into a row that is already on the screen. */
  private set(rows: Row[], label: string, value: string): void {
    const row = rows.find((r) => r.label === label);
    if (row) row.value = value;
  }

  private pause(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  /** The button for this is `Refresh diagnostics`. It runs no test. */
  async refresh(): Promise<void> {
    this.refreshing = true;
    const started = Date.now();
    try {
      await this.read();
    } finally {
      const left = MIN_FEEDBACK_MS - (Date.now() - started);
      if (left > 0) await this.pause(left);
      this.refreshing = false;
    }
  }

  /**
   * Exit leaves and locks. There is one way out on purpose: a second button that
   * also left, but did not lock, was the same action with a hidden difference.
   * The ten taps open the screen again.
   */
  back(): void {
    this.access.lock();
    this.router.navigate([ResourcesRoutes.MORE]);
  }

  async read(): Promise<void> {
    const config = this.appConfig.getConfig();

    const api = this.hostOf(config.rest['wfnews']);
    const notifyApi = this.hostOf(config.rest['notification-api']);

    this.app = [
      { label: 'Version', value: config.application.version || 'unknown' },
      { label: 'Build', value: BUILD_NUMBER || 'unknown' },
      // Two Environment variables fill these, so they can point at different hosts.
      // One row while they agree; two rows the moment they do not.
      ...(api === notifyApi
        ? [{ label: 'API host', value: api }]
        : [
            { label: 'API host', value: api },
            { label: 'Notifications host', value: notifyApi },
          ]),
    ];

    this.device = await this.readDevice();
    this.notifications = await this.readNotifications();
    this.network = await this.readNetwork();
    this.readAt = new Date().toLocaleTimeString();
  }

  private hostOf(url: string): string {
    try {
      return new URL(url).host;
    } catch {
      return url || 'not set';
    }
  }

  /**
   * The map service, which needs no key and returns a body of several megabytes.
   *
   * The cache buster is not optional. This endpoint sends `stale-while-revalidate`,
   * so a repeat read comes from the cache and the test reports a speed the network
   * never did: 5 MB in 57 ms, which is 735 Mbit/s over Wi-Fi.
   */
  private capabilitiesUrl(): string {
    // The rest of the code reaches mapServices this way: it is not on the typed config.
    const base = this.appConfig.getConfig()['mapServices']?.['openmapsBaseUrl'];
    if (!base) return '';
    return `${base}?service=WMS&request=GetCapabilities&cacheBust=${Date.now()}`;
  }

  /** The host, for a TCP probe that no cache can answer. */
  private apiHost(): string {
    return this.hostOf(this.appConfig.getConfig().rest['wfnews']);
  }

  /**
   * Reads once, and reads again only when the first read was quick. A timed-out
   * read reports zero bytes, so the big read is never the only read.
   */
  private async measureDownload(): Promise<string> {
    const probe = await NetworkDiagnostics.testDownloadSpeed({
      url: this.capabilitiesUrl(),
      maxBytes: PROBE_BYTES,
      timeoutMs: 30000,
    });
    if (!probe.ok) return 'failed';

    const enough = probe.durationMs <= ESCALATE_UNDER_MS;
    const best = enough
      ? await NetworkDiagnostics.testDownloadSpeed({
          url: this.capabilitiesUrl(),
          maxBytes: FULL_BYTES,
          timeoutMs: 30000,
        })
      : probe;

    const use = best.ok ? best : probe;
    return `${use.mbps.toFixed(2)} Mbit/s (${Math.round(use.bytesDownloaded / 1024)} kB)`;
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
   * Why a push does not arrive has three answers, and they need three different
   * fixes: the device has no Device Token, the user turned notifications off, or
   * the permission was never given.
   */
  private async readNotifications(): Promise<Row[]> {
    const rows: Row[] = [];

    try {
      const state = await PushNotifications.checkPermissions();
      rows.push({ label: 'Permission', value: state.receive });
    } catch {
      rows.push({ label: 'Permission', value: 'unknown' });
    }

    try {
      const enabled = await NotificationSettings.areEnabled();
      rows.push({ label: 'Turned on', value: enabled.enabled ? 'yes' : 'no' });
    } catch {
      // The Android half is the only half. iOS and web reject, and that is expected.
      rows.push({ label: 'Turned on', value: 'Android only' });
    }

    const token = this.capacitorService.notificationToken;
    rows.push({
      label: 'Device Token',
      value: token ? `…${String(token).slice(-8)}` : 'none',
    });
    return rows;
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
      rows.push({ label: 'Internet reachable', value: status.internetReachable ? 'yes' : 'no' });
      rows.push({ label: 'Captive portal', value: status.captivePortal ? 'yes' : 'no' });
      rows.push({ label: 'Metered', value: status.expensive ? 'yes' : 'no' });
      rows.push({ label: 'Low data mode', value: status.constrained ? 'on' : 'off' });
    } catch {
      rows.push({ label: 'Connected', value: 'unknown' });
    }

    rows.push({ label: 'Browser online', value: navigator.onLine ? 'yes' : 'no' });

    // Labelled "estimated" on purpose. On Android these follow the radio and not
    // the path, so they can read 4g on a link that takes two seconds for one read.
    // Test 2 gives the measured figure.
    const estimate = (navigator as any).connection;
    if (estimate) {
      rows.push({ label: 'Estimated type', value: String(estimate.effectiveType) });
      rows.push({ label: 'Estimated speed', value: `${estimate.downlink} Mbit/s` });
      rows.push({ label: 'Estimated round trip', value: `${estimate.rtt} ms` });
      rows.push({ label: 'Data saver', value: estimate.saveData ? 'on' : 'off' });
    }
    return rows;
  }

  /** One small read of the API through the WebView, timed. This carries the key. */
  async testReachability(): Promise<void> {
    this.testing = true;
    this.set(this.reach, 'API answers', NOT_YET);
    this.set(this.reach, 'Time', NOT_YET);
    const started = Date.now();
    try {
      await this.commonUtilityService.pingService().toPromise();
      const ms = Date.now() - started;
      this.set(this.reach, 'API answers', 'yes');
      this.set(this.reach, 'Time', `${ms} ms${ms > SLOW_MS ? ' (slow)' : ''}`);
    } catch (error) {
      this.set(this.reach, 'API answers', `no (${error?.status ?? 'error'})`);
      this.set(this.reach, 'Time', `${Date.now() - started} ms`);
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
    for (const row of this.deep) row.value = NOT_YET;
    this.issues = [];
    const api = this.appConfig.getConfig().rest['wfnews'];

    try {
      // A HEAD on the API. The native path carries no key, so a 401 is the answer
      // we want: the host was reached.
      const url = await NetworkDiagnostics.testUrl({ url: api, method: 'HEAD', timeoutMs: 15000 });
      this.set(
        this.deep,
        'API answers',
        url.reachable ? `${url.statusCode ?? 'yes'} in ${url.durationMs} ms` : 'no answer',
      );

      this.set(this.deep, 'Download', await this.measureDownload());

      // A TCP probe, not an HTTP one. An HTTP probe repeats one URL, and after the
      // first answer the cache serves the rest, which makes the loss and the time
      // meaningless. Opening a socket cannot be cached.
      const loss = await NetworkDiagnostics.testPacketLoss({
        mode: 'tcp',
        host: this.apiHost(),
        port: 443,
        count: LOSS_PROBES,
        timeoutMs: 5000,
      });
      this.set(this.deep, 'Packet loss', `${loss.lossPercent}% (${loss.lost} of ${loss.sent})`);
      this.set(
        this.deep,
        'Connect time',
        loss.averageLatencyMs !== undefined ? `${Math.round(loss.averageLatencyMs)} ms` : NOT_YET,
      );
    } catch (error) {
      this.set(this.deep, 'API answers', `test failed: ${error}`);
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
