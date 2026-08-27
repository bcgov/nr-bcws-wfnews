/**
 * Walks the Report of Fire flow, one page at a time.
 *
 * The flow must work with no network. `report-of-fire.config.json` holds an
 * `offLineMessage` for each page and a `disclaimer-page` that says "You are
 * currently offline", so the design says the same. This helper proves it, or
 * shows where the walk stops.
 *
 * The walk does not know the page names in advance. It reads the page that is on
 * the screen, gives the smallest valid answer, and taps forward. A flow that
 * changes its questions does not break this helper.
 */
import { inWebview } from './app';

/** Every page component of the flow. The wizard builds them all, so only one is visible. */
const PAGE_SELECTOR = [
  'rof-title-page',
  'rof-disclaimer-page',
  'rof-permissions-page',
  'rof-compass-page',
  'rof-complex-question-page',
  'rof-simple-question-page',
  'rof-location-page',
  'rof-photo-page',
  'rof-comments-page',
  'rof-contact-page',
  'rof-review-page',
  'rof-call-page',
].join(', ');

export interface RofPage {
  tag: string;
  title: string;
  /** The page name for the report: the tag when the title is empty. */
  key: string;
  buttons: Array<{ text: string; disabled: boolean }>;
  options: string[];
  chosen: string | null;
  /** Every page element that a user could see. More than one is a defect in the walk. */
  visibleTags: string[];
}

/** Reads the page that a user can see. Nothing else on the screen counts. */
export async function rofPage(): Promise<RofPage | null> {
  const raw = (await inWebview(async () =>
    driver.execute((selector: string) => {
      const visible = (el: Element): boolean => {
        const rect = el.getBoundingClientRect();
        const style = window.getComputedStyle(el);
        return rect.width > 0 && rect.height > 0 && style.visibility !== 'hidden' && style.display !== 'none';
      };
      const all = Array.from(document.querySelectorAll(selector));
      const page = all.find(visible);
      if (!page) return null;
      const text = (el: Element) => (el.textContent || '').replace(/\s+/g, ' ').trim();
      const heading = page.querySelector('.rof-text-primary-header, .rof-text-title, h1, h2');
      const group = page.querySelector('mat-button-toggle-group');
      return {
        tag: page.tagName.toLowerCase(),
        title: heading ? text(heading) : '',
        buttons: Array.from(page.querySelectorAll('button')).map((b) => ({
          text: text(b),
          disabled: (b as HTMLButtonElement).disabled,
        })),
        options: group
          ? Array.from(group.querySelectorAll('mat-button-toggle')).map((o) => text(o))
          : [],
        chosen: group
          ? (() => {
              const on = group.querySelector('mat-button-toggle.mat-button-toggle-checked');
              return on ? text(on) : null;
            })()
          : null,
        // Two visible pages at once means the walk could read the wrong one.
        visibleTags: all.filter(visible).map((el) => el.tagName.toLowerCase()),
      };
    }, PAGE_SELECTOR),
  )) as Omit<RofPage, 'key'> | null;

  if (!raw) return null;
  return { ...raw, key: raw.title || raw.tag.replace('rof-', '').replace('-page', '') };
}

/**
 * Answers the page, then taps forward.
 *
 * The callback question is answered "No" on purpose. "Yes" opens the contact
 * page and asks for a name and a telephone number, and a test must not put a
 * person into a report.
 */
export async function rofAdvance(page: RofPage): Promise<string> {
  const wantsNo = /call ?back|available for a call/i.test(page.title);

  return String(
    await inWebview(async () =>
      driver.execute(
        (selector: string, chooseNo: boolean) => {
          const visible = (el: Element): boolean => {
            const rect = el.getBoundingClientRect();
            const style = window.getComputedStyle(el);
            return (
              rect.width > 0 && rect.height > 0 && style.visibility !== 'hidden' && style.display !== 'none'
            );
          };
          const view = Array.from(document.querySelectorAll(selector)).find(visible);
          if (!view) return 'no page';
          const text = (el: Element) => (el.textContent || '').replace(/\s+/g, ' ').trim();
          const did: string[] = [];

          // The contact page is the only page that asks for typed input.
          for (const input of Array.from(view.querySelectorAll('input'))) {
            const field = input as HTMLInputElement;
            if (field.type === 'checkbox' || field.type === 'radio' || field.value) continue;
            const label = (field.getAttribute('aria-label') || field.placeholder || '').toLowerCase();
            if (!label) continue;
            field.value = label.includes('phone') ? '2505551234' : 'Device Test';
            field.dispatchEvent(new Event('input', { bubbles: true }));
            did.push(`typed into ${label}`);
          }

          // The permissions page keeps Continue disabled until the agreement box is
          // ticked. Tick it through the real input, so the Angular handler runs.
          for (const box of Array.from(view.querySelectorAll('input[type="checkbox"]'))) {
            const field = box as HTMLInputElement;
            if (!field.checked) {
              field.click();
              did.push('ticked the agreement box');
            }
          }

          // A question page keeps its forward control disabled until it has an answer.
          const group = view.querySelector('mat-button-toggle-group');
          if (group && !group.querySelector('mat-button-toggle.mat-button-toggle-checked')) {
            const all = Array.from(group.querySelectorAll('mat-button-toggle'));
            const pick =
              (chooseNo ? all.find((o) => /^no$/i.test(text(o))) : null) ||
              all.find((o) => !/not sure/i.test(text(o))) ||
              all[0];
            if (pick) {
              const hit = (pick.querySelector('button') || pick) as HTMLElement;
              hit.click();
              did.push(`chose "${text(pick)}"`);
            }
          }

          const buttons = Array.from(view.querySelectorAll('button')).filter(
            (b) => !(b as HTMLButtonElement).disabled,
          );
          // "Start" opens the flow on the title page. "Call" is next to it and must
          // never be tapped, so the list is explicit and not a guess.
          for (const pattern of [/^submit report/i, /^start/i, /^continue/i, /^next/i, /^done/i]) {
            const go = buttons.find((b) => pattern.test(text(b)));
            if (go) {
              (go as HTMLElement).click();
              did.push(`tapped "${text(go)}"`);
              return did.join(', ');
            }
          }

          // Nothing goes forward on the page. The header Skip is the last way out.
          const skip = Array.from(document.querySelectorAll('.skip')).find(visible);
          if (skip) {
            (skip as HTMLElement).click();
            did.push('tapped "Skip" in the header');
            return did.join(', ');
          }
          return did.length ? `${did.join(', ')}, and nothing goes forward` : 'nothing goes forward';
        },
        PAGE_SELECTOR,
        wantsNo,
      ),
    ),
  );
}

/**
 * Reads the stored Report of Fire out of the WebView.
 *
 * Ionic Storage keeps it in IndexedDB, database `_ionicstorage`, store
 * `_ionickv`. A stored report proves that the offline path ran. Nothing goes to
 * the server until the app syncs, and the caller clears the app before that.
 */
export interface StoredReport {
  found: boolean;
  bytes: number;
  keys: string[];
  /** The fields of the stored report that say whether it is usable. */
  resource?: Record<string, unknown>;
  images: number;
}

export async function storedReport(): Promise<StoredReport> {
  return (await inWebview(async () =>
    driver.executeAsync((done: (value: unknown) => void) => {
      const fail = (why: string) => done({ found: false, bytes: 0, keys: [why], images: 0 });
      let open: IDBOpenDBRequest;
      try {
        open = indexedDB.open('_ionicstorage');
      } catch (error) {
        return fail(String(error));
      }
      open.onerror = () => fail('the storage would not open');
      open.onsuccess = () => {
        const db = open.result;
        if (!db.objectStoreNames.contains('_ionickv')) return fail('no _ionickv store');
        const store = db.transaction('_ionickv', 'readonly').objectStore('_ionickv');
        const all = store.getAllKeys();
        all.onsuccess = () => {
          const keys = (all.result as string[]).map(String);
          const one = store.get('offlineReportData');
          one.onsuccess = () => {
            const value = one.result;
            if (!value) return done({ found: false, bytes: 0, keys, images: 0 });
            const text = String(value);
            let resource;
            let images = 0;
            try {
              const held = JSON.parse(text);
              images = ['image1', 'image2', 'image3'].filter((k) => held[k]).length;
              resource = held.resource ? JSON.parse(held.resource) : undefined;
            } catch (error) {
              resource = { parseError: String(error) };
            }
            done({ found: true, bytes: text.length, keys, resource, images });
          };
          one.onerror = () => done({ found: false, bytes: 0, keys, images: 0 });
        };
        all.onerror = () => fail('the keys could not be read');
      };
    }),
  )) as StoredReport;
}
