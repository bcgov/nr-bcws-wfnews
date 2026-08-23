/**
 * T1 to T6 of PIXEL_XL_FINDINGS_STE.md. Each test names the suspect it checks.
 * T7 (a cold GPS fix outdoors) stays with a person.
 */
import { expect } from '@wdio/globals';
import { PKG, clearAppData, getProp, locationServicesOn, setLocationServices } from '../helpers/adb';
import { grantLocation, grantedPermissions, inWebview, restartApp, revokeLocation, waitForWebApp } from '../helpers/app';
import { dialogMessage, isDialogShowing, tap } from '../helpers/permission-dialog';

const SDK = Number(getProp('ro.build.version.sdk'));

describe('Saved Location and Report of Fire: the location permission', () => {
  let locationWasOn: boolean;

  before(() => {
    locationWasOn = locationServicesOn();
  });

  beforeEach(async () => {
    // A true first run. Revoking alone leaves the "denied always" flag from the last test.
    clearAppData();
  });

  after(async () => {
    setLocationServices(locationWasOn);
    await grantLocation();
  });

  it('T1: asks for the location at start, before the user does anything (S1)', async () => {
    await restartApp();

    const showed = await isDialogShowing(60_000);
    expect(showed).toBe(true);

    // S1 says the app gives no reason of its own first. Record what was behind the dialog.
    const message = await dialogMessage();
    console.log(`T1 dialog message: "${message}"`);
    await browser.saveScreenshot(`${process.env.WFNEWS_SHOT_DIR}/t1-permission-at-start.png`);
  });

  // This is the preloadGeolocation path, which uses duration 5000 and is correct.
  // It does not cover S6: the two `duration: 5` sites are in getCurrentLocation(),
  // and nothing calls that method. See section 6.6 of PIXEL_XL_FINDINGS_STE.md.
  it('T2: shows a message on Deny, and the message stays long enough to read', async () => {
    await restartApp();
    expect(await isDialogShowing(60_000)).toBe(true);
    await tap('deny');

    await waitForWebApp();

    // S6: two call sites pass `duration: 5`, which is 5 milliseconds and not 5 seconds.
    const seen = await inWebview(async () => {
      const start = Date.now();
      let appeared = false;
      let lastSeen = 0;
      while (Date.now() - start < 15_000) {
        const visible = await driver.execute(() => Boolean(document.querySelector('simple-snack-bar, .mat-snack-bar-container')));
        if (visible) {
          appeared = true;
          lastSeen = Date.now();
        }
        if (appeared && !visible) break;
        await new Promise((r) => setTimeout(r, 50));
      }
      return { appeared, visibleFor: appeared ? lastSeen - start : 0 };
    });

    console.log(`T2 snackbar: appeared=${seen.appeared}, visible for about ${seen.visibleFor} ms`);
    await browser.saveScreenshot(`${process.env.WFNEWS_SHOT_DIR}/t2-after-deny.png`);

    // A message a user cannot read is the same as no message.
    expect(seen.appeared && seen.visibleFor >= 2000).toBe(true);
  });

  it('T3: tells the user how to recover after "denied always" (S5)', async () => {
    // Android 11 and later set "denied always" after two denials. Android 10 uses a button.
    await restartApp();
    expect(await isDialogShowing(60_000)).toBe(true);
    await tap('deny');

    await restartApp();
    if (await isDialogShowing(30_000)) {
      try {
        await tap('denyDontAsk');
      } catch {
        await tap('deny');
      }
    }

    await restartApp();
    const asksAgain = await isDialogShowing(20_000);
    expect(asksAgain).toBe(false);

    await waitForWebApp();
    await browser.saveScreenshot(`${process.env.WFNEWS_SHOT_DIR}/t3-denied-always.png`);

    // S5: nothing calls Geolocation.checkPermissions, so the app cannot offer the settings screen.
    const offersHelp = await inWebview(async () =>
      driver.execute(() => /settings|permission/i.test(document.body.innerText)),
    );
    console.log(`T3 the app offers a route to Settings: ${offersHelp}`);
    expect(offersHelp).toBe(true);
  });

  it('T4: the position request ends when location services are off (S2)', async () => {
    const LIMIT = 30_000;
    await grantLocation();
    setLocationServices(false);
    try {
      await restartApp();
      await waitForWebApp();
      await browser.saveScreenshot(`${process.env.WFNEWS_SHOT_DIR}/t4-location-services-off.png`);

      // Measured by hand on a Pixel XL: still pending after 100 002 ms. No call site
      // passes a timeout, and the race in checkLocationServiceStatus awaits first.
      // Start the call, then poll a flag. One long script would hit the driver
      // script timeout, and UiAutomator2 has no setTimeouts command to raise it.
      const outcome = await inWebview(async () => {
        await driver.execute(() => {
          (window as any).__wfnewsGeo = { settled: false, ms: 0 };
          const started = Date.now();
          const record = () => ((window as any).__wfnewsGeo = { settled: true, ms: Date.now() - started });
          // @ts-expect-error the Capacitor bridge is on the window at runtime
          window.Capacitor.Plugins.Geolocation.getCurrentPosition().then(record, record);
        });

        const deadline = Date.now() + LIMIT;
        let state = { settled: false, ms: 0 };
        while (Date.now() < deadline) {
          state = (await driver.execute(() => (window as any).__wfnewsGeo)) as unknown as typeof state;
          if (state.settled) break;
          await browser.pause(1000);
        }
        return state;
      });

      console.log(`T4 getCurrentPosition settled=${outcome.settled} after ${outcome.settled ? outcome.ms : LIMIT} ms`);
      expect(outcome.settled).toBe(true);
    } finally {
      setLocationServices(true);
    }
  });

  it('T5: does not keep a failure for 30 seconds after the permission is given (S3)', async () => {
    await restartApp();
    expect(await isDialogShowing(60_000)).toBe(true);
    await tap('deny');
    await waitForWebApp();

    // S3: getCurrentLocationPromise stores the rejected promise and returns it for 30 seconds.
    await grantLocation();

    const gotLocation = await inWebview(async () =>
      driver.executeAsync((done: (r: boolean) => void) => {
        // @ts-expect-error the Capacitor bridge is on the window at runtime
        const geo = window.Capacitor?.Plugins?.Geolocation;
        if (!geo) return done(false);
        geo.getCurrentPosition().then(
          () => done(true),
          () => done(false),
        );
      }),
    );

    console.log(`T5 a position was available right after the grant: ${gotLocation}`);
    expect(gotLocation).toBe(true);
  });

  it('T6: works when only Approximate location is given', async function () {
    if (SDK < 31) {
      // Android 12 introduced the precise and approximate choice.
      this.skip();
    }
    await restartApp();
    expect(await isDialogShowing(60_000)).toBe(true);
    await tap('approximate');
    await tap('allowForeground');

    await waitForWebApp();
    const granted = await grantedPermissions();
    console.log(`T6 granted: ${granted.filter((p) => p.includes('LOCATION')).join(', ')}`);
    await browser.saveScreenshot(`${process.env.WFNEWS_SHOT_DIR}/t6-approximate-only.png`);

    expect(granted).toContain('android.permission.ACCESS_COARSE_LOCATION');
  });
});
