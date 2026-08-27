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

/** The work in one processor run. About 40 ms on a new phone, about 400 ms on an old one. */
const CPU_ITERATIONS = 3000000;

/** Processor runs. One run alone reports the core that the scheduler gave it. */
const CPU_RUNS = 3;

/**
 * A fixed canvas and a fixed load, so two devices report numbers that compare.
 * The load must stay above the cost of the read that times it: on a Pixel XL the
 * read alone is about 3 ms, and this load is about 16 ms.
 */
const BENCH_SIZE = 512;
const DRAWS_PER_FRAME = 16;

/** Frames in the graphics test, and the first frames that hold the shader compile. */
const FRAME_COUNT = 24;
const WARMUP_FRAMES = 6;

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
  public graphics: Row[] = [];
  public graphicsIssue = '';
  public speed: Row[] = [
    { label: 'Processor', value: NOT_YET },
    { label: 'Graphics', value: NOT_YET },
  ];
  public issues: string[] = [];
  public testing = false;
  public speedTesting = false;
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
    this.graphics = this.readGraphics();
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
      const rows: Row[] = [
        { label: 'Model', value: `${info.manufacturer || ''} ${info.model || ''}`.trim() },
        { label: 'Platform', value: `${info.platform} ${info.osVersion || ''}`.trim() },
        { label: 'WebView', value: info.webViewVersion || 'unknown' },
      ];

      if (info.androidSDKVersion) {
        rows.push({ label: 'Android level', value: String(info.androidSDKVersion) });
      }
      if (info.isVirtual) rows.push({ label: 'Emulator', value: 'yes' });

      rows.push({ label: 'Processor cores', value: String(navigator.hardwareConcurrency || 'unknown') });
      // navigator.deviceMemory is Chromium only, so on iOS the row can only be empty.
      if (!this.capacitorService.isIOSPlatform) {
        rows.push({ label: 'Memory', value: this.memoryText() });
      }
      rows.push({ label: 'Screen', value: this.screenText() });

      if (info.memUsed) {
        rows.push({ label: 'App memory', value: `${Math.round(info.memUsed / 1048576)} MB` });
      }
      // The WebView stops the app when the heap reaches this. A small limit and a
      // large Payload give the white screen that no error explains.
      const limit = (performance as any).memory?.jsHeapSizeLimit;
      if (limit) {
        rows.push({ label: 'Memory limit', value: `${Math.round(limit / 1048576)} MB` });
      }

      rows.push({ label: 'Device id', value: id.identifier });
      rows.push({ label: 'Location permission', value: permission });
      return rows;
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

    // The plugin has an Android half only. On iOS the permission row above already
    // holds the true answer, because iOS reads it from the notification centre.
    if (!this.capacitorService.isIOSPlatform) {
      try {
        const enabled = await NotificationSettings.areEnabled();
        rows.push({ label: 'Turned on', value: enabled.enabled ? 'yes' : 'no' });
      } catch {
        rows.push({ label: 'Turned on', value: 'unknown' });
      }
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
      // iOS copies `connected` into internetReachable, and it sends no captivePortal
      // at all. Both rows would then answer without a look.
      if (!this.capacitorService.isIOSPlatform) {
        rows.push({ label: 'Internet reachable', value: status.internetReachable ? 'yes' : 'no' });
        rows.push({ label: 'Captive portal', value: status.captivePortal ? 'yes' : 'no' });
      }
      rows.push({ label: 'Metered', value: status.expensive ? 'yes' : 'no' });
      rows.push({ label: 'Low data mode', value: status.constrained ? 'on' : 'off' });
    } catch {
      rows.push({ label: 'Connected', value: 'unknown' });
    }

    rows.push({ label: 'Browser online', value: navigator.onLine ? 'yes' : 'no' });

    // Labelled "estimated" on purpose. On Android these follow the radio and not the
    // path, so they can read 4g on a link that takes two seconds for one read. Test 2
    // gives the measured figure, and iOS gives none of it: the API is Chromium only.
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

  /**
   * Chromium rounds this down to a power of two and stops at 8, so 8 means
   * "8 or more".
   */
  private memoryText(): string {
    const gb = (navigator as any).deviceMemory;
    if (!gb) return 'not reported';
    return gb >= 8 ? '8 GB or more' : `about ${gb} GB`;
  }

  /** The pixels the GPU paints for one frame. This limits the map more than the GPU name does. */
  private screenText(): string {
    const ratio = window.devicePixelRatio || 1;
    return `${Math.round(screen.width * ratio)} × ${Math.round(screen.height * ratio)} at ${ratio}×`;
  }

  /**
   * The Active Wildfire Map draws its basemap with WebGL. No WebGL means no
   * basemap, and software rendering means a map that a user watches redraw.
   */
  private readGraphics(): Row[] {
    this.graphicsIssue = '';
    const canvas = document.createElement('canvas');
    const gl: WebGLRenderingContext =
      (canvas.getContext('webgl2') as any) || (canvas.getContext('webgl') as any);
    if (!gl) {
      this.graphicsIssue = 'This device gives no WebGL. The map cannot draw its basemap.';
      return [{ label: 'WebGL', value: 'none' }];
    }

    const two = (window as any).WebGL2RenderingContext
      ? gl instanceof (window as any).WebGL2RenderingContext
      : false;
    // Chromium can refuse this extension. Then the name is hidden, and no test
    // here can tell a GPU from a fallback.
    const names = gl.getExtension('WEBGL_debug_renderer_info');
    const renderer = names ? String(gl.getParameter(names.UNMASKED_RENDERER_WEBGL)) : 'hidden';

    const rows: Row[] = [
      { label: 'WebGL', value: two ? 'WebGL 2' : 'WebGL 1' },
      // WebKit always refuses the extension, so on iOS the row can only say "hidden".
      ...(this.capacitorService.isIOSPlatform
        ? []
        : [{ label: 'Renderer', value: renderer }]),
      { label: 'Driver', value: String(gl.getParameter(gl.VERSION)) },
      { label: 'Largest texture', value: `${gl.getParameter(gl.MAX_TEXTURE_SIZE)} px` },
    ];

    // Chromium draws with the processor when it cannot use the GPU. The name is
    // the only signal, and it is the most important line on this screen.
    if (/swiftshader|llvmpipe|software/i.test(renderer)) {
      this.graphicsIssue = 'This device draws with the processor, not with the GPU. The map will be slow.';
    }

    gl.getExtension('WEBGL_lose_context')?.loseContext();
    return rows;
  }

  private median(values: number[]): number {
    const sorted = [...values].sort((a, b) => a - b);
    return sorted[Math.floor(sorted.length / 2)];
  }

  /** Fixed work, timed. The result is read, or the engine removes the loop. */
  private cpuRun(): number {
    const started = performance.now();
    let total = 0;
    for (let i = 1; i <= CPU_ITERATIONS; i++) total += Math.sqrt(i) * Math.sin(i);
    const ms = performance.now() - started;
    if (!isFinite(total)) console.log(total);
    return ms;
  }

  /**
   * Two numbers for the device itself. Both tests spend what they measure, so a
   * button starts them. A number means something only next to a Baseline.
   */
  async testSpeed(): Promise<void> {
    this.speedTesting = true;
    for (const row of this.speed) row.value = NOT_YET;
    try {
      const runs: number[] = [];
      for (let i = 0; i < CPU_RUNS; i++) {
        // The loop blocks the screen. Give the page a turn between the runs.
        await this.pause(0);
        runs.push(this.cpuRun());
      }
      this.set(this.speed, 'Processor', `${Math.round(this.median(runs))} ms`);

      const frame = await this.measureFrame();
      this.set(
        this.speed,
        'Graphics',
        frame === null ? 'no WebGL' : `${frame.toFixed(1)} ms for each frame`,
      );
    } finally {
      this.speedTesting = false;
    }
  }

  /**
   * Draws a fixed load, then reads one pixel back. The read is the timer: it waits
   * for the GPU. `finish` does not wait in this WebView. Measured on a Pixel XL,
   * `finish` reported 0.4 ms for every load, and the read reported 6 ms and 58 ms
   * for loads that differed by 16 times.
   */
  private measureFrame(): Promise<number | null> {
    const canvas = document.createElement('canvas');
    canvas.width = BENCH_SIZE;
    canvas.height = BENCH_SIZE;
    const gl = canvas.getContext('webgl') as WebGLRenderingContext;
    if (!gl) return Promise.resolve(null);

    const vertex = 'attribute vec2 p; void main() { gl_Position = vec4(p, 0.0, 1.0); }';
    // The loop is the load. GLSL ES 1.0 needs a constant bound, and the uniform
    // keeps the driver from answering with the frame it drew before.
    const fragment = `
      precision mediump float;
      uniform float seed;
      void main() {
        float v = seed;
        for (int i = 0; i < 60; i++) v = fract(sin(v * 12.9898 + float(i)) * 43758.5453);
        gl_FragColor = vec4(v, v, v, 1.0);
      }`;

    const compile = (type: number, source: string): WebGLShader => {
      const shader = gl.createShader(type);
      gl.shaderSource(shader, source);
      gl.compileShader(shader);
      return shader;
    };

    const program = gl.createProgram();
    gl.attachShader(program, compile(gl.VERTEX_SHADER, vertex));
    gl.attachShader(program, compile(gl.FRAGMENT_SHADER, fragment));
    gl.linkProgram(program);
    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) return Promise.resolve(null);
    gl.useProgram(program);

    // One triangle that covers the canvas.
    gl.bindBuffer(gl.ARRAY_BUFFER, gl.createBuffer());
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
    const position = gl.getAttribLocation(program, 'p');
    gl.enableVertexAttribArray(position);
    gl.vertexAttribPointer(position, 2, gl.FLOAT, false, 0, 0);
    const seed = gl.getUniformLocation(program, 'seed');

    const pixel = new Uint8Array(4);
    return new Promise((resolve) => {
      const times: number[] = [];
      let frame = 0;
      const draw = () => {
        const started = performance.now();
        gl.uniform1f(seed, frame / FRAME_COUNT);
        for (let i = 0; i < DRAWS_PER_FRAME; i++) gl.drawArrays(gl.TRIANGLES, 0, 3);
        gl.readPixels(0, 0, 1, 1, gl.RGBA, gl.UNSIGNED_BYTE, pixel);
        if (frame >= WARMUP_FRAMES) times.push(performance.now() - started);
        frame++;
        if (frame < FRAME_COUNT) {
          requestAnimationFrame(draw);
        } else {
          gl.getExtension('WEBGL_lose_context')?.loseContext();
          resolve(times.length ? this.median(times) : null);
        }
      };
      requestAnimationFrame(draw);
    });
  }

  /** All of it as text, so a user can paste it into a support message. */
  async copy(): Promise<void> {
    const sections: Array<[string, Row[]]> = [
      ['App', this.app],
      ['Device', this.device],
      ['Graphics', this.graphics],
      ['Network', this.network],
      ['Reachability', this.reach],
      ['Native test', this.deep],
      ['Device speed', this.speed],
    ];

    let block = sections
      .filter(([, rows]) => rows.length)
      .map(([title, rows]) => `${title}\n` + rows.map((r) => `  ${r.label}: ${r.value}`).join('\n'))
      .join('\n\n');

    if (this.graphicsIssue) {
      block += `

Graphics issue
  ${this.graphicsIssue}`;
    }

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
