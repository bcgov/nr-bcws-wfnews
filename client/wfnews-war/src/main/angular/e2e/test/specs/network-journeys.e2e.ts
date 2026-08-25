/**
 * The Journeys, run against one Network Profile.
 *
 *   WFNEWS_NET_PROFILE=3g npm run test:network
 *   WFNEWS_NET_REPEATS=3 WFNEWS_NET_PROFILE=2g npm run test:network
 *
 * This is a measurement suite, like `screens.e2e.ts`. A slow screen does not
 * make the run red, because a red run stops the measurement and loses the rest
 * of the Network Profiles. The numbers go to `logs/network/`, and
 * `npm run report:network` turns them into the findings file.
 *
 * A test goes red only when the harness itself is broken: no session, no
 * WebView, or a device that will not take the Network Profile.
 */
import { clearAppData, deviceTag, shell } from '../helpers/adb';
import { dismissDisclaimer, grantLocation, inWebview, restartApp } from '../helpers/app';
import {
  Journey,
  JourneyContext,
  JourneyRecorder,
  WaitResult,
  readScreen,
  waitFor,
  waitUntilSettled,
} from '../helpers/journey';
import { NetworkControl, profileByName } from '../helpers/network';
import { RofPage, StoredReport, rofAdvance, rofPage, storedReport } from '../helpers/rof';

const PROFILE = profileByName(process.env.WFNEWS_NET_PROFILE || 'wifi');
const REPEATS = Number(process.env.WFNEWS_NET_REPEATS || 1);

// A slower Network Profile gets more time. The `offline` profile gets less: no
// wait will ever end well, and a user gives up long before two minutes.
const budget = (ms: number) => Math.round(ms * PROFILE.budgetScale);
const COLD_START_BUDGET = budget(180_000);
const NAV_BUDGET = budget(120_000);
const SETTLE_BUDGET = budget(120_000);

/** Runs one Journey by name, when a run needs only that one. */
const ONLY = process.env.WFNEWS_NET_ONLY || '';

const network = new NetworkControl();
const proxy = () => (PROFILE.offline ? null : network.proxy);

/** A Cold start. The Payload is on the device, so this draws even with no network. */
async function coldStart(ctx: JourneyContext) {
  await restartApp();
  await ctx.step('web view appears', () =>
    waitFor(
      async () => {
        const contexts = (await driver.getContexts()) as unknown as string[];
        return contexts.some((c) => String(c).startsWith('WEBVIEW_'));
      },
      { timeout: COLD_START_BUDGET, interval: 1000 },
    ),
  );
  await ctx.step('first text drawn', () =>
    waitFor(async () => (await readScreen()).textLength > 0, { timeout: COLD_START_BUDGET }),
  );
  try {
    await dismissDisclaimer();
  } catch {
    /* the Disclaimer was already answered */
  }
}

/**
 * Goes to a route and waits for it to draw. The Payload is local, so the reload
 * itself costs no network; only the data on the new screen does.
 */
async function navigate(route: string, timeout = NAV_BUDGET) {
  try {
    await inWebview(async () => {
      await driver.execute((path: string) => {
        window.location.href = `${window.location.origin}/${path}`;
      }, route);
    });
  } catch {
    /* the WebView tears down under the navigation. That is the navigation working. */
  }
  const arrived = await waitFor(
    async () => {
      const state = await readScreen();
      return state.route.replace(/^\//, '').startsWith(route) && state.textLength > 0;
    },
    { timeout },
  );
  try {
    await dismissDisclaimer();
  } catch {
    /* already answered */
  }
  return arrived;
}

/** Taps the first element that matches, inside the WebView. */
async function tap(selector: string): Promise<boolean> {
  return Boolean(
    await inWebview(async () =>
      driver.execute((css: string) => {
        const el = document.querySelector(css) as HTMLElement | null;
        if (!el) return false;
        el.click();
        return true;
      }, selector),
    ),
  );
}

/**
 * The Report of Fire flow must work with no network, and the rest of the app does
 * not have to. So the submit runs on the `offline` Network Profile, where the
 * report is kept on the device and never sent. Set WFNEWS_ROF_SUBMIT to 1 or 0 to
 * change that. A submit with a network makes a real Report of Fire.
 */
const SUBMIT = (process.env.WFNEWS_ROF_SUBMIT ?? (PROFILE.offline ? '1' : '0')) === '1';
let submitted = false;

/** The flow has about 18 pages. This stops a loop that a defect could make endless. */
const MAX_PAGES = 32;

/**
 * Walks page by page to the review page. It reads the page on the screen, gives
 * the smallest valid answer, and taps forward. A page that does not change twice
 * is where the walk stopped, and that is the finding.
 */
async function walkTheFlow(ctx: JourneyContext): Promise<WaitResult> {
  const started = Date.now();
  let last = '';
  let repeats = 0;

  for (let step = 0; step < MAX_PAGES; step++) {
    const page: RofPage | null = await rofPage();
    if (!page) {
      ctx.find('report of fire: no page of the flow is on the screen');
      return { ok: false, ms: Date.now() - started };
    }

    if (page.visibleTags.length > 1) {
      ctx.find(`report of fire: ${page.visibleTags.join(' and ')} are on the screen together`);
    }

    if (page.key === last) {
      repeats += 1;
      if (repeats >= 2) {
        ctx.find(`report of fire: the walk stopped on "${page.key}" and would not go forward`);
        return { ok: false, ms: Date.now() - started };
      }
    } else {
      repeats = 0;
      // Name the component as well as the title. A page that shows under an
      // unexpected title is then still readable in the report.
      ctx.reached(`${page.tag} — ${page.key}`);
      await ctx.shot(`rof-${String(step + 1).padStart(2, '0')}`);
    }
    last = page.key;

    if (page.tag === 'rof-review-page') return { ok: true, ms: Date.now() - started };

    await rofAdvance(page);
    await waitFor(
      async () => {
        const now = await rofPage();
        return Boolean(now) && now.key !== page.key;
      },
      { timeout: NAV_BUDGET, interval: 250 },
    );
  }

  ctx.find(`report of fire: the walk did not reach the review page inside ${MAX_PAGES} pages`);
  return { ok: false, ms: Date.now() - started };
}

/** A tile with `leaflet-tile-loaded` arrived. A tile without it is still a hole. */
const MAP_PARTS = {
  map: '.leaflet-container',
  tiles: 'img.leaflet-tile-loaded',
  allTiles: 'img.leaflet-tile',
};

const JOURNEYS: Journey[] = [
  {
    name: 'cold-start',
    label: 'A Cold start to the landing screen',
    async run(ctx) {
      await coldStart(ctx);
      await ctx.step('screen settles', () =>
        waitUntilSettled(ctx.proxy, { timeout: SETTLE_BUDGET }),
      );
      await ctx.check('landing');
      await ctx.shot('landing');
    },
  },
  {
    name: 'map',
    label: 'Open the Active Wildfire Map and wait for the tiles',
    async run(ctx) {
      await coldStart(ctx);
      await ctx.step('reach the map', () => navigate('map'));
      // Leaflet draws tiles as images, not on a canvas, and it adds
      // `leaflet-tile-loaded` when a tile arrives. That class is the true signal.
      await ctx.step('the first tiles arrive', () =>
        waitFor(async () => (await readScreen(MAP_PARTS)).counts.tiles > 0, {
          timeout: SETTLE_BUDGET,
        }),
      );
      await ctx.step('map settles', () => waitUntilSettled(ctx.proxy, { timeout: SETTLE_BUDGET }));
      const state = await ctx.check('map', MAP_PARTS);
      if (!state.counts.map) ctx.find('map: the map never drew');
      else if (!state.counts.tiles) ctx.find('map: the map drew, but no tile finished loading');
      else if (state.counts.tiles < state.counts.allTiles) {
        ctx.find(
          `map: ${state.counts.allTiles - state.counts.tiles} of ${state.counts.allTiles} tiles never arrived, so the map has holes`,
        );
      }
      await ctx.shot('map');
    },
  },
  {
    name: 'list-to-incident',
    label: 'Open the wildfires list, then open one Public Incident Page',
    async run(ctx) {
      await coldStart(ctx);
      await ctx.step('reach the list', () => navigate('list'));
      await ctx.step('the list holds Incidents', () =>
        waitFor(async () => (await readScreen({ card: '.panel-card' })).counts.card > 0, {
          timeout: SETTLE_BUDGET,
        }),
      );
      const list = await ctx.check('list', { card: '.panel-card' });
      await ctx.shot('list');
      if (!list.counts.card) {
        ctx.find('list: no Incident reached the screen, so the Public Incident Page was not opened');
        return;
      }
      await ctx.step('open one Incident', async () => {
        await tap('.panel-card');
        return waitFor(
          async () => (await readScreen({ header: 'incident-header-panel' })).counts.header > 0,
          { timeout: NAV_BUDGET },
        );
      });
      await ctx.step('the Incident settles', () =>
        waitUntilSettled(ctx.proxy, { timeout: SETTLE_BUDGET }),
      );
      await ctx.check('incident', { header: 'incident-header-panel' });
      await ctx.shot('incident');
    },
  },
  {
    name: 'saved-location',
    label: 'Read the Saved Locations, then search for an address to add one',
    async run(ctx) {
      await coldStart(ctx);
      await ctx.step('reach Saved Locations', () => navigate('saved'));
      await ctx.step('Saved Locations settles', () =>
        waitUntilSettled(ctx.proxy, { timeout: SETTLE_BUDGET }),
      );
      await ctx.check('saved', { card: '.section-card', saved: '.saved-location' });
      await ctx.shot('saved');

      // Stop before the save. A save writes a real Saved Location row, and this
      // suite runs many times.
      await ctx.step('reach Add Saved Location', () => navigate('add-location'));
      await ctx.step('search for an address', async () => {
        await inWebview(async () => {
          await driver.execute(() => {
            const box = document.querySelector(
              'input[aria-label="Find Address"]',
            ) as HTMLInputElement | null;
            if (!box) return;
            box.focus();
            box.value = 'Kamloops';
            box.dispatchEvent(new Event('input', { bubbles: true }));
          });
        });
        return waitFor(async () => (await readScreen({ option: 'mat-option' })).counts.option > 0, {
          timeout: SETTLE_BUDGET,
        });
      });
      const search = await ctx.check('address search', { option: 'mat-option' });
      if (!search.counts.option) ctx.find('address search: the Gazetteer gave no result');
      await ctx.shot('add-location');
    },
  },
  {
    name: 'report-of-fire',
    label: 'Walk the whole Report of Fire flow, page by page',
    async run(ctx) {
      await coldStart(ctx);
      await ctx.step('reach Report of Fire', () => navigate('reportOfFire'));
      await ctx.step('tap Start', async () => {
        const title = await rofPage();
        if (title) await rofAdvance(title);
        return waitFor(async () => {
          const page = await rofPage();
          return Boolean(page) && page.tag !== 'rof-title-page';
        }, { timeout: NAV_BUDGET });
      });

      const review = await ctx.step('walk to the review page', () => walkTheFlow(ctx));
      await ctx.check('report of fire');

      if (!review || !review.ok) return;
      if (!SUBMIT) return;

      // The submit runs offline by default and online never. Offline it is stored
      // on the device, and the app data is cleared below before the Wi-Fi returns,
      // so no Report of Fire ever reaches the server.
      let stored: StoredReport = { found: false, bytes: 0, keys: [], images: 0 };
      try {
        await ctx.step('tap Submit Report', async () => {
          const page = await rofPage();
          if (page) await rofAdvance(page);
          return waitFor(async () => {
            const now = await rofPage();
            return Boolean(now) && now.tag !== 'rof-review-page';
          }, { timeout: NAV_BUDGET });
        });
        await ctx.shot('rof-after-submit');
        const after = await rofPage();
        if (after) ctx.reached(`after submit: ${after.key}`);

        stored = await storedReport();
        await ctx.step('the report is kept on the device', async () => ({
          ok: stored.found,
          ms: stored.bytes,
        }));
        if (!stored.found) {
          ctx.find(
            `report of fire: nothing was stored, so an offline report is lost. Storage holds: ${stored.keys.join(', ') || 'nothing'}`,
          );
        } else {
          // A stored report with no position cannot be acted on. This is the one
          // field that decides whether an offline report is worth anything.
          const held = stored.resource || {};
          const where = held.fireLocation || held.deviceLocation;
          if (!where) {
            ctx.find('report of fire: the stored report holds no fire location and no device location');
          }
          // Print the coordinates. `setLocation()` in the location page holds a
          // placeholder of [-112, 50], which is in Alberta, so "a location" is not
          // the same as "the right location".
          const asText = (value: unknown) => (Array.isArray(value) ? `[${value.join(', ')}]` : 'none');
          ctx.reached(
            `stored report: ${stored.bytes} characters, ${stored.images} photos, ` +
              `fireLocation ${asText(held.fireLocation)}, deviceLocation ${asText(held.deviceLocation)}, ` +
              `estimatedDistance ${held.estimatedDistance ?? 'none'}`,
          );
          if (Array.isArray(held.fireLocation) && Number(held.fireLocation[0]) === -112 && Number(held.fireLocation[1]) === 50) {
            ctx.find('report of fire: the stored fire location is the [-112, 50] placeholder, which is in Alberta');
          }
          const empty = Object.entries(held)
            .filter(([, value]) => value === null || value === undefined || (Array.isArray(value) && value.length === 0))
            .map(([key]) => key);
          if (empty.length) ctx.reached(`stored report: empty fields — ${empty.join(', ')}`);
        }
      } finally {
        // Always, and while the Wi-Fi is still off. A stored report syncs by itself
        // when the network returns, and this suite must not make a real report.
        clearAppData();
        submitted = true;
        await grantLocation();
      }
    },
  },
];

describe(`Network Journeys on the "${PROFILE.name}" Network Profile`, () => {
  const device = deviceTag();

  before(async () => {
    console.log(`Network Profile: ${PROFILE.name} — ${PROFILE.label}`);

    // Warm up on a good network, so the Disclaimer and the location permission
    // are answered before the profile makes the network bad. Otherwise the first
    // Journey measures a modal, not a screen.
    await network.finish();
    await grantLocation();
    await restartApp();
    await waitFor(async () => (await readScreen()).textLength > 0, { timeout: COLD_START_BUDGET });
    try {
      await dismissDisclaimer();
    } catch {
      /* already answered */
    }

    await network.apply(PROFILE);
    console.log(`Wi-Fi: ${/Wi-Fi is enabled/i.test(shell('dumpsys wifi')) ? 'on' : 'off'}. Proxy: ${shell('settings get global http_proxy')}`);
  });

  after(async () => {
    // A stored Report of Fire syncs by itself when the network returns. Clear it
    // before the Wi-Fi comes back, and not after.
    if (submitted) clearAppData();
    await network.finish();
  });

  const chosen = ONLY ? JOURNEYS.filter((j) => j.name === ONLY) : JOURNEYS;
  if (ONLY && !chosen.length) {
    throw new Error(`No Journey is named "${ONLY}". Use one of: ${JOURNEYS.map((j) => j.name).join(', ')}`);
  }

  for (let run = 1; run <= REPEATS; run++) {
    for (const journey of chosen) {
      it(`${journey.name} on ${PROFILE.name}, run ${run}`, async () => {
        await network.apply(PROFILE);
        const recorder = new JourneyRecorder(
          journey,
          PROFILE.name,
          PROFILE.label,
          run,
          device,
          proxy(),
        );
        try {
          await journey.run(recorder);
        } finally {
          const record = recorder.finish();
          const total = (record.totalMs / 1000).toFixed(1);
          const down = (record.network.bytesDown / 1024).toFixed(0);
          console.log(`  ${journey.name}: ${total} s, ${down} kB down, ${record.findings.length} findings`);
          for (const finding of record.findings) console.log(`    - ${finding}`);
        }
      });
    }
  }
});
