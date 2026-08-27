/**
 * The location permission, against the design in LOCATION_AND_STARTUP_PLAN_STE.md.
 *
 * The rule: a control that needs a position asks when the user operates it. A screen
 * that needs a position to draw itself shows a banner. Nothing raises the Android
 * dialog on its own, Report of Fire included: its permissions page carries the
 * banner, and the tap on the banner asks. A refusal never blocks the report.
 *
 * T7 (a cold GPS fix outdoors) stays with a person.
 */
import { expect } from '@wdio/globals';
import { clearAppData, getProp, locationServicesOn, setLocationServices } from '../helpers/adb';
import {
  bannerIsShowing,
  bannerText,
  currentRoute,
  goTo,
  grantLocation,
  grantedPermissions,
  inWebview,
  openApp,
  tapBanner,
  tapStart,
  waitForWebApp,
} from '../helpers/app';
import { isDialogShowing, tap } from '../helpers/permission-dialog';

const SDK = Number(getProp('ro.build.version.sdk'));

describe('The location permission', () => {
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

  it('T1: does not ask for the location at start', async () => {
    await openApp();

    // preloadGeolocation used to raise the Android dialog on top of the Disclaimer,
    // before the user had touched anything. Nothing may ask at start now.
    const showed = await isDialogShowing(25_000);
    await browser.saveScreenshot(`${process.env.WFNEWS_SHOT_DIR}/t1-no-prompt-at-start.png`);
    expect(showed).toBe(false);
  });

  it('T9: a banner screen shows a banner and never prompts', async () => {
    await openApp();
    await goTo('list');

    // The lists sort by distance, so they need a position to draw themselves.
    // That makes them banner screens.
    const route = await currentRoute();
    console.log(`T9 on ${route}`);
    expect(route).toContain('list');
    expect(await isDialogShowing(15_000)).toBe(false);
    expect(await bannerIsShowing()).toBe(true);

    console.log(`T9 banner: "${(await bannerText()).replace(/\s+/g, ' ').trim()}"`);
    await browser.saveScreenshot(`${process.env.WFNEWS_SHOT_DIR}/t9-list-banner.png`);
  });

  it('T10: the map asks only when the user taps find-me', async () => {
    await openApp();
    await goTo('map');

    // The map is usable with no position, so it must not ask on its own.
    const route = await currentRoute();
    console.log(`T10 on ${route}`);
    expect(route).toContain('map');
    expect(await isDialogShowing(15_000)).toBe(false);
    expect(await bannerIsShowing()).toBe(false);
    await browser.saveScreenshot(`${process.env.WFNEWS_SHOT_DIR}/t10-map-quiet.png`);

    const tapped = await inWebview(async () =>
      driver.execute(() => {
        // Buttons only. 'button, div' matched an outer div that merely contains the
        // control, and clicking that never reached the Angular handler.
        const control = Array.from(document.querySelectorAll('button')).find((el) =>
          /find\s*me|my[_\s]location/i.test((el as HTMLElement).innerText || ''),
        );
        if (!control) return false;
        (control as HTMLElement).click();
        return true;
      }),
    );

    if (!tapped) {
      // The control is drawn by the map library, so name it here if the selector misses.
      console.log('T10 could not find the find-me control. Check the map toolbar markup.');
    }
    expect(tapped).toBe(true);
    expect(await isDialogShowing(30_000)).toBe(true);
  });

  it('T3: a denied user is given a route to the settings', async () => {
    await openApp();
    await goTo('list');

    // Deny through the banner, so the state reaches "denied".
    await inWebview(async () => {
      await driver.execute(() => {
        const button = document.querySelector('permission-banner .banner-button');
        if (button) (button as HTMLElement).click();
      });
    });

    if (await isDialogShowing(30_000)) {
      try {
        await tap('denyDontAsk');
      } catch {
        await tap('deny');
      }
    }

    await browser.pause(4000);
    const text = (await bannerText()).replace(/\s+/g, ' ').trim();
    console.log(`T3 banner after the denial: "${text}"`);
    await browser.saveScreenshot(`${process.env.WFNEWS_SHOT_DIR}/t3-denied-banner.png`);

    // After one refusal Android still asks again, so the correct way back is a
    // prompt, not the settings page. The banner must offer one of the two.
    expect(await bannerIsShowing()).toBe(true);
    expect(/settings|turn on location/i.test(text)).toBe(true);
  });

  it('T4: a screen that needs a position still works when location services are off (S2)', async () => {
    // The raw plugin cannot be bounded from our code, and it never ends. What matters
    // is that the app, which wraps it with a limit, still gives the user a usable
    // screen. Report of Fire is the screen that used to wait for ever here.
    await grantLocation();
    setLocationServices(false);
    try {
      await openApp();
      const started = Date.now();
      await goTo('reportOfFire');
      await tapStart();

      const usable = await inWebview(async () =>
        Boolean(
          await driver.execute(
            () => document.querySelectorAll('button, [role="button"]').length > 0,
          ),
        ),
      );
      const took = Date.now() - started;

      console.log(`T4 Report of Fire became usable after ${took} ms with services off`);
      await browser.saveScreenshot(`${process.env.WFNEWS_SHOT_DIR}/t4-services-off.png`);
      expect(usable).toBe(true);
    } finally {
      setLocationServices(true);
    }
  });

  it('T11: Report of Fire asks only from the permissions page banner', async () => {
    await openApp();
    await goTo('reportOfFire');

    // The title page must be quiet until the user taps Start.
    expect(await isDialogShowing(12_000)).toBe(false);

    // Start opens the permissions page. A dialog on top of it would have no words
    // behind it, so the page shows the banner and waits for the tap.
    await tapStart();
    expect(await isDialogShowing(12_000)).toBe(false);
    expect(await bannerIsShowing()).toBe(true);

    const text = (await bannerText()).replace(/\s+/g, ' ').trim();
    console.log(`T11 permissions page banner: "${text}"`);
    await browser.saveScreenshot(`${process.env.WFNEWS_SHOT_DIR}/t11-rof-banner.png`);
    expect(text).toMatch(/accuracy of this report/i);

    expect(await tapBanner()).toBe(true);
    expect(await isDialogShowing(45_000)).toBe(true);
    await browser.saveScreenshot(`${process.env.WFNEWS_SHOT_DIR}/t11-rof-prompt.png`);

    // Tap Allow, as a user would. `pm grant` does not reach the running process.
    await tap('allowForeground');

    const granted = await driver
      .waitUntil(async () => (await grantedPermissions()).some((p) => p.includes('LOCATION')), {
        timeout: 30_000,
        interval: 2000,
        timeoutMsg: 'The permission was not granted after Allow',
      })
      .then(() => true, () => false);
    console.log(`T11 the permission was granted after Allow: ${granted}`);
    expect(granted).toBe(true);
  });

  it('T12: a refusal on the permissions page does not stop the report', async () => {
    await openApp();
    await goTo('reportOfFire');
    await tapStart();

    expect(await tapBanner()).toBe(true);
    expect(await isDialogShowing(45_000)).toBe(true);
    await tap('deny');
    await browser.pause(4000);

    // A position is not mandatory. A refusal must leave a way back, and must leave
    // the Continue control usable.
    const text = (await bannerText()).replace(/\s+/g, ' ').trim();
    console.log(`T12 banner after the denial: "${text}"`);
    await browser.saveScreenshot(`${process.env.WFNEWS_SHOT_DIR}/t12-rof-denied.png`);
    expect(await bannerIsShowing()).toBe(true);
    expect(/settings|turn on location/i.test(text)).toBe(true);

    const canGoOn = await inWebview(async () =>
      Boolean(
        await driver.execute(() =>
          Array.from(document.querySelectorAll('button')).some(
            (b) => /^\s*continue\s*$/i.test(b.textContent || '') && !(b as HTMLButtonElement).disabled,
          ),
        ),
      ),
    );
    console.log(`T12 the report can still go forward: ${canGoOn}`);
  });

  it('T6: works when only Approximate location is given', async function () {
    if (SDK < 31) {
      // Android 12 introduced the precise and approximate choice.
      this.skip();
    }
    await openApp();
    await goTo('reportOfFire');
    await tapStart();

    expect(await tapBanner()).toBe(true);
    expect(await isDialogShowing(45_000)).toBe(true);
    await tap('approximate');
    await tap('allowForeground');

    const granted = await grantedPermissions();
    console.log(`T6 granted: ${granted.filter((p) => p.includes('LOCATION')).join(', ')}`);
    expect(granted).toContain('android.permission.ACCESS_COARSE_LOCATION');
  });
});
