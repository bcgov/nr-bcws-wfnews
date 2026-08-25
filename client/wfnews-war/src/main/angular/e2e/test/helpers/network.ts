/**
 * Network Profiles, and the device wiring that applies one.
 *
 * The device sends its traffic to `127.0.0.1:<port>`. `adb reverse` carries that
 * port back to the workstation over USB, where the ThrottleProxy waits. USB is
 * the point: the proxy needs no LAN address and no firewall rule, and the Wi-Fi
 * can go down without the session going down with it.
 */
import { ThrottleProxy } from './throttle-proxy';
import { adb, shell } from './adb';

export interface NetworkProfile {
  name: string;
  /** One line for the report. */
  label: string;
  downKbps: number;
  upKbps: number;
  latencyMs: number;
  stallRate: number;
  /** True means no network at all. The Wi-Fi goes off and the proxy is not used. */
  offline: boolean;
  /**
   * Multiplies the step budgets of a Journey. A slower Network Profile needs more
   * time. The `offline` profile needs less, because nothing will ever arrive and
   * a user gives up long before a 2 minute wait ends.
   */
  budgetScale: number;
}

/**
 * The speeds follow the Chrome DevTools presets, so that a number here can be
 * compared against a number from a desktop measurement.
 */
export const PROFILES: Record<string, NetworkProfile> = {
  wifi: {
    name: 'wifi',
    label: 'Wi-Fi, no limit. This is the Baseline.',
    downKbps: 0,
    upKbps: 0,
    latencyMs: 0,
    stallRate: 0,
    offline: false,
    budgetScale: 1,
  },
  lte: {
    name: 'lte',
    label: 'A weak LTE signal. 4 Mbit/s down, 80 ms.',
    downKbps: 4000,
    upKbps: 2000,
    latencyMs: 80,
    stallRate: 0,
    offline: false,
    budgetScale: 1,
  },
  '3g': {
    name: '3g',
    label: 'Fast 3G. 1.6 Mbit/s down, 300 ms.',
    downKbps: 1600,
    upKbps: 750,
    latencyMs: 300,
    stallRate: 0,
    offline: false,
    budgetScale: 1,
  },
  'slow-3g': {
    name: 'slow-3g',
    label: 'Slow 3G. 400 kbit/s down, 800 ms.',
    downKbps: 400,
    upKbps: 400,
    latencyMs: 800,
    stallRate: 0,
    offline: false,
    budgetScale: 1.5,
  },
  '2g': {
    name: '2g',
    label: 'EDGE. 240 kbit/s down, 1200 ms. This is a remote valley.',
    downKbps: 240,
    upKbps: 120,
    latencyMs: 1200,
    stallRate: 0,
    offline: false,
    budgetScale: 2,
  },
  lossy: {
    name: 'lossy',
    label: 'Fast 3G, and 1 connection in 5 dies in the middle.',
    downKbps: 1600,
    upKbps: 750,
    latencyMs: 300,
    stallRate: 0.2,
    offline: false,
    budgetScale: 1.5,
  },
  offline: {
    name: 'offline',
    label: 'The Wi-Fi is off. There is no network.',
    downKbps: 0,
    upKbps: 0,
    latencyMs: 0,
    stallRate: 0,
    offline: true,
    budgetScale: 0.25,
  },
};

export const PROFILE_ORDER = ['wifi', 'lte', '3g', 'slow-3g', '2g', 'lossy', 'offline'];

export function profileByName(name: string): NetworkProfile {
  const profile = PROFILES[name];
  if (!profile) {
    throw new Error(`No Network Profile is named "${name}". Use one of: ${PROFILE_ORDER.join(', ')}`);
  }
  return profile;
}

export const PROXY_PORT = Number(process.env.WFNEWS_PROXY_PORT || 8888);

/** A blocking wait. These helpers are synchronous, because the restore guards are. */
function sleepSync(ms: number): void {
  Atomics.wait(new Int32Array(new SharedArrayBuffer(4)), 0, 0, ms);
}

function wifiIsOn(): boolean {
  return /Wi-Fi is enabled/i.test(shell('dumpsys wifi'));
}

function setWifi(on: boolean): void {
  if (wifiIsOn() === on) return;
  shell(`svc wifi ${on ? 'enable' : 'disable'}`);
  const deadline = Date.now() + 30_000;
  while (Date.now() < deadline) {
    sleepSync(1000);
    if (wifiIsOn() === on) {
      // The radio reports the new state before the link is usable.
      if (on) sleepSync(5000);
      return;
    }
  }
  throw new Error(`Could not turn the Wi-Fi ${on ? 'on' : 'off'}.`);
}

function setDeviceProxy(hostPort: string): void {
  shell(`settings put global http_proxy ${hostPort}`);
  const readBack = shell('settings get global http_proxy');
  if (readBack !== hostPort) {
    throw new Error(`The device proxy did not take. It reads "${readBack}", not "${hostPort}".`);
  }
}

function clearDeviceProxy(): void {
  // `:0` is the value that Android itself writes for "no proxy". A delete alone
  // leaves some processes with the old value until they restart.
  try {
    shell('settings put global http_proxy :0');
    shell('settings delete global http_proxy');
  } catch {
    /* the device is already clean, or gone */
  }
}

/**
 * Puts the device back the way a user needs it: no proxy, Wi-Fi on, no reverse
 * port. This must run even after Ctrl-C, or the phone is left with a proxy that
 * points at a program that is not running, and then nothing on it can reach the
 * network.
 */
export function restoreDevice(): void {
  clearDeviceProxy();
  try {
    adb('reverse', '--remove-all');
  } catch {
    /* nothing was forwarded */
  }
  try {
    setWifi(true);
  } catch {
    /* the device is gone */
  }
}

let guardsInstalled = false;

function installRestoreGuards(): void {
  if (guardsInstalled) return;
  guardsInstalled = true;
  const restore = () => restoreDevice();
  process.on('exit', restore);
  for (const signal of ['SIGINT', 'SIGTERM', 'SIGBREAK'] as const) {
    process.on(signal, () => {
      restore();
      process.exit(130);
    });
  }
  process.on('uncaughtException', (error) => {
    restore();
    throw error;
  });
}

export class NetworkControl {
  readonly proxy = new ThrottleProxy();
  private started = false;

  /** Starts the proxy and points the device at it. Not used by the offline profile. */
  async start(): Promise<void> {
    installRestoreGuards();
    if (this.started) return;
    await this.proxy.listen(PROXY_PORT);
    adb('reverse', `tcp:${PROXY_PORT}`, `tcp:${PROXY_PORT}`);
    setDeviceProxy(`127.0.0.1:${PROXY_PORT}`);
    this.started = true;
  }

  async apply(profile: NetworkProfile): Promise<void> {
    installRestoreGuards();
    if (profile.offline) {
      // Clear the proxy first. `adb reverse` works over USB, so a device with the
      // Wi-Fi off but the proxy still set would keep a working network. That
      // would give a green offline test that proves nothing.
      await this.stop();
      setWifi(false);
      return;
    }
    setWifi(true);
    await this.start();
    this.proxy.setShape({
      downKbps: profile.downKbps,
      upKbps: profile.upKbps,
      latencyMs: profile.latencyMs,
      stallRate: profile.stallRate,
    });
    this.proxy.reset();
  }

  async stop(): Promise<void> {
    if (this.started) {
      clearDeviceProxy();
      try {
        adb('reverse', '--remove-all');
      } catch {
        /* nothing was forwarded */
      }
      await this.proxy.close();
      this.started = false;
    }
  }

  async finish(): Promise<void> {
    await this.stop();
    setWifi(true);
  }
}
