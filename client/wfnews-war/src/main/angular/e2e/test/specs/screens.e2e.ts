/**
 * Goes to each public screen and saves a named screenshot for a person to review.
 * No baseline comparison yet, by decision: a baseline made now would lock in a
 * screen that is already wrong.
 */
import { grantLocation, inWebview, restartApp, waitForWebApp } from '../helpers/app';

// The names come from ResourcesRoutes in src/app/utils/index.ts.
const SCREENS: Array<{ name: string; route: string }> = [
  { name: 'landing', route: '' },
  { name: 'active-wildfire-map', route: 'map' },
  { name: 'wildfires-list', route: 'list' },
  { name: 'saved-locations', route: 'saved' },
  { name: 'add-saved-location', route: 'add-location' },
  { name: 'report-of-fire', route: 'reportOfFire' },
  { name: 'more', route: 'more' },
  { name: 'contact-us', route: 'contact-us' },
];

async function goTo(route: string): Promise<void> {
  await inWebview(async () => {
    await driver.execute((path: string) => {
      window.location.href = `${window.location.origin}/${path}`;
    }, route);
  });
  // The router and the map both settle well after readyState is complete.
  await browser.pause(6000);
}

describe('Screens: capture each one for review', () => {
  before(async () => {
    await grantLocation();
    await restartApp();
    await waitForWebApp();
  });

  for (const screen of SCREENS) {
    it(`draws ${screen.name}`, async () => {
      await goTo(screen.route);
      await browser.saveScreenshot(`${process.env.WFNEWS_SHOT_DIR}/${screen.name}.png`);

      const report = await inWebview(async () =>
        driver.execute(() => {
          const doc = document.documentElement;
          // Horizontal overflow is the defect that a narrow, dense screen shows first.
          const overflow = doc.scrollWidth - doc.clientWidth;
          const offscreen = Array.from(document.querySelectorAll('*'))
            .filter((el) => el.getBoundingClientRect().right > doc.clientWidth + 1)
            .slice(0, 5)
            .map((el) => `${el.tagName.toLowerCase()}.${String(el.className).split(' ')[0]}`);
          return { overflow, offscreen, text: document.body.innerText.trim().length };
        }),
      );

      console.log(`${screen.name}: overflow ${report.overflow}px, text ${report.text} chars`);
      if (report.offscreen.length) console.log(`  past the right edge: ${report.offscreen.join(', ')}`);
    });
  }
});
