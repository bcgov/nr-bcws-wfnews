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

/**
 * Closes the BC Wildfire Service Disclaimer and remembers the choice.
 *
 * `pm clear` wipes the stored choice before each test, and every navigation is a
 * full reload, so without this the Disclaimer covers each screen that a test wants
 * to read. A test must measure the screen, and not the modal on top of it.
 */
export async function dismissDisclaimer(): Promise<boolean> {
  const closed = await inWebview(async () =>
    Boolean(
      await driver.execute(() => {
        const dialog = document.querySelector('mat-dialog-container, .cdk-overlay-pane');
        if (!dialog) return false;

        // Tick "Don't show again" through its real input, so Angular's change handler
        // runs. Writing localStorage directly does not work: app.component removes the
        // key on load whenever the box was not ticked.
        const box = dialog.querySelector(
          'bc-checkbox input[type="checkbox"]',
        ) as HTMLInputElement | null;
        if (box && !box.checked) box.click();

        const ok = Array.from(dialog.querySelectorAll('button')).find((b) =>
          /^\s*ok\s*$/i.test(b.textContent || ''),
        );
        if (!ok) return false;
        (ok as HTMLElement).click();
        return true;
      }),
    ),
  );
  await browser.pause(2000);
  return closed;
}

/** A cold start, drawn and clear of the Disclaimer. This is what a test wants. */
export async function openApp(): Promise<void> {
  await restartApp();
  await waitForWebApp();
  await dismissDisclaimer();
}

/** Goes to an Angular route. The names come from ResourcesRoutes in src/app/utils. */
export async function goTo(route: string): Promise<void> {
  await inWebview(async () => {
    await driver.execute((path: string) => {
      window.location.href = `${window.location.origin}/${path}`;
    }, route);
  });
  await browser.pause(4000);
  await waitForWebApp();

  // Wait for the router to actually arrive. A stale read of the previous screen is
  // the way this suite lies to you.
  await driver.waitUntil(
    async () =>
      inWebview(async () =>
        Boolean(
          await driver.execute(
            (path: string) => window.location.pathname.replace(/^\//, '') === path,
            route,
          ),
        ),
      ),
    { timeout: 60_000, interval: 1000, timeoutMsg: `The app did not reach /${route}` },
  );
  await dismissDisclaimer();
  await browser.pause(4000);
}

/** Taps Start on the Report of Fire title page. This is the gate that asks. */
export async function tapStart(): Promise<void> {
  await inWebview(async () => {
    await driver.execute(() => {
      const start = Array.from(document.querySelectorAll('button')).find((b) =>
        /^\s*start\s*$/i.test((b.textContent || '').trim()),
      );
      if (start) (start as HTMLElement).click();
    });
  });
  await browser.pause(3000);
}

export async function currentRoute(): Promise<string> {
  return inWebview(async () => String(await driver.execute(() => window.location.pathname)));
}

/**
 * True when a permission banner is on the screen and a user could see it.
 *
 * Every banner is read, not the first one. The Report of Fire wizard builds all
 * its pages up front, so more than one banner is in the document at a time and
 * only one of them is visible.
 */
export async function bannerIsShowing(): Promise<boolean> {
  return inWebview(async () =>
    Boolean(
      await driver.execute(() => {
        return Array.from(document.querySelectorAll('permission-banner')).some((banner) => {
          const rect = banner.getBoundingClientRect();
          const style = window.getComputedStyle(banner);
          return (
            rect.width > 0 &&
            rect.height > 0 &&
            style.visibility !== 'hidden' &&
            style.display !== 'none'
          );
        });
      }),
    ),
  );
}

export async function bannerText(): Promise<string> {
  return inWebview(async () =>
    String(
      (await driver.execute(() => {
        const banner = Array.from(document.querySelectorAll('permission-banner')).find(
          (el) => el.getBoundingClientRect().height > 0,
        );
        return banner ? (banner as HTMLElement).innerText : '';
      })) || '',
    ),
  );
}

/** Taps the action of the banner that the user can see. False when there is none. */
export async function tapBanner(): Promise<boolean> {
  const tapped = await inWebview(async () =>
    driver.execute(() => {
      const banner = Array.from(document.querySelectorAll('permission-banner')).find(
        (el) => el.getBoundingClientRect().height > 0,
      );
      const button = banner?.querySelector('.banner-button');
      if (!button) return false;
      (button as HTMLElement).click();
      return true;
    }),
  );
  return Boolean(tapped);
}
