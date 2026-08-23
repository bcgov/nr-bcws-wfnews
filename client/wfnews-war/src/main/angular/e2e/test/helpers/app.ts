import { PKG, shell } from './adb';

export const LOCATION_PERMISSIONS = [
  'android.permission.ACCESS_FINE_LOCATION',
  'android.permission.ACCESS_COARSE_LOCATION',
];

/** Runs `fn` inside the WebView context, then always returns to NATIVE_APP. */
export async function inWebview<T>(fn: () => Promise<T>): Promise<T> {
  const contexts = (await driver.getContexts()) as unknown as string[];
  const webview = contexts.find((c) => String(c).startsWith('WEBVIEW_'));
  if (!webview) {
    throw new Error(`No WebView context. Contexts: ${contexts.join(', ')}. See the chromedriver note in README.md.`);
  }
  await driver.switchContext(webview);
  try {
    return await fn();
  } finally {
    await driver.switchContext('NATIVE_APP');
  }
}

export async function revokeLocation(): Promise<void> {
  await driver.execute('mobile: changePermissions', {
    permissions: LOCATION_PERMISSIONS,
    appPackage: PKG,
    action: 'revoke',
  });
}

export async function grantLocation(): Promise<void> {
  await driver.execute('mobile: changePermissions', {
    permissions: LOCATION_PERMISSIONS,
    appPackage: PKG,
    action: 'grant',
  });
}

export async function grantedPermissions(): Promise<string[]> {
  return (await driver.execute('mobile: getPermissions', {
    type: 'granted',
    appPackage: PKG,
  })) as string[];
}

/** A cold start. `mobile: terminateApp` is a real stop, unlike backgrounding. */
export async function restartApp(): Promise<void> {
  // `pm clear` already stopped the app, and terminating a stopped app is an error.
  try {
    await driver.execute('mobile: terminateApp', { appId: PKG });
  } catch {
    /* it was not running */
  }
  await driver.execute('mobile: activateApp', { appId: PKG });
}

/**
 * The Angular app takes a long time to draw on an old device, and the splash hides it.
 * Wait for the WebView context to hold a rendered body, not just for the activity.
 */
export async function waitForWebApp(timeout = 180_000): Promise<number> {
  const started = Date.now();
  await driver.waitUntil(
    async () => {
      const contexts = (await driver.getContexts()) as unknown as string[];
      if (!contexts.some((c) => String(c).startsWith('WEBVIEW_'))) return false;
      return inWebview(async () => {
        const ready = await driver.execute(
          () => document.readyState === 'complete' && document.body && document.body.innerText.trim().length > 0,
        );
        return Boolean(ready);
      });
    },
    { timeout, interval: 2000, timeoutMsg: `The web app did not draw inside ${timeout} ms` },
  );
  return Date.now() - started;
}

/** Clears logcat so a test reads only its own output. */
export function clearLog(): void {
  shell('logcat -c');
}
