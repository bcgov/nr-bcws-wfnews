import { execFileSync } from 'node:child_process';
import { existsSync } from 'node:fs';
import { join } from 'node:path';

export const PKG = 'ca.bc.gov.WildfireInformation';
export const ACTIVITY = '.MainActivity';

/** Appium refuses to start a session without this, and it is not set on an NRS workstation. */
export function ensureAndroidHome(): string {
  const existing = process.env.ANDROID_HOME || process.env.ANDROID_SDK_ROOT;
  if (existing && existsSync(existing)) return existing;
  const localAppData = process.env.LOCALAPPDATA;
  const guess = localAppData ? join(localAppData, 'Android', 'Sdk') : '';
  if (!guess || !existsSync(guess)) {
    throw new Error('Set ANDROID_HOME to the Android SDK directory. It was not found at the default location.');
  }
  process.env.ANDROID_HOME = guess;
  process.env.ANDROID_SDK_ROOT = guess;
  return guess;
}

// adb is not on PATH on an NRS workstation, so fall back to the SDK location.
function adbPath(): string {
  if (process.env.ADB && existsSync(process.env.ADB)) return process.env.ADB;
  const localAppData = process.env.LOCALAPPDATA;
  if (localAppData) {
    const sdk = join(localAppData, 'Android', 'Sdk', 'platform-tools', 'adb.exe');
    if (existsSync(sdk)) return sdk;
  }
  return 'adb';
}

function run(args: string[]): string {
  return execFileSync(adbPath(), args, { encoding: 'utf8', maxBuffer: 32 * 1024 * 1024 }).trim();
}

function firstDevice(): string {
  const lines = run(['devices']).split('\n').slice(1);
  const ready = lines.map((l) => l.trim().split(/\s+/)).filter((p) => p[1] === 'device');
  if (ready.length === 0) throw new Error('No Android device is attached. Run: adb devices');
  if (ready.length > 1 && !process.env.WFNEWS_UDID) {
    throw new Error(`More than one device is attached. Set WFNEWS_UDID to one of: ${ready.map((p) => p[0]).join(', ')}`);
  }
  return ready[0][0];
}

export const UDID = process.env.WFNEWS_UDID || firstDevice();

export function adb(...args: string[]): string {
  return run(['-s', UDID, ...args]);
}

export function shell(command: string): string {
  return adb('shell', command);
}

export function getProp(name: string): string {
  return shell(`getprop ${name}`);
}

/** Names the screenshot folder, so a Pixel XL image is never compared against an emulator image. */
export function deviceTag(): string {
  const model = getProp('ro.product.model').replace(/\s+/g, '-').toLowerCase();
  const size = shell('wm size').replace(/.*:\s*/, '');
  const density = shell('wm density').replace(/.*:\s*/, '');
  return `${model}-${size}-${density}dpi`;
}

/** True when the device is past the lock screen. App data is unreadable before the first unlock. */
export function isUnlocked(): boolean {
  return !/mDreamingLockscreen=true/.test(adb('shell', 'dumpsys window'));
}

export function setLocationServices(on: boolean): void {
  // Android 10 accepts `cmd location` and then ignores it, so verify after each attempt.
  const attempts = [
    () => shell(`settings put secure location_mode ${on ? 3 : 0}`),
    () => shell(`cmd location set-location-enabled ${on}`),
  ];
  for (const attempt of attempts) {
    try {
      attempt();
    } catch {
      continue;
    }
    if (locationServicesOn() === on) return;
  }
  throw new Error(
    `Could not turn location services ${on ? 'on' : 'off'}. location_mode is ${shell('settings get secure location_mode')}.`,
  );
}

/**
 * Clears app data. This is the only way to clear the "denied always" flag, so each
 * permission test starts from a true first run and does not inherit the last one.
 */
export function clearAppData(): void {
  shell(`pm clear ${PKG}`);
}

export function locationServicesOn(): boolean {
  return shell('settings get secure location_mode') !== '0';
}
