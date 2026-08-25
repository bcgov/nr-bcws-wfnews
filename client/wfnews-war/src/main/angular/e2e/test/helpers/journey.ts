/**
 * The Journey recorder.
 *
 * A Journey is one repeatable user workflow, from a Cold start to a result. The
 * recorder measures each step, watches the screen for a defect that a user can
 * see, and writes one JSON file. The report script reads those files.
 *
 * No step throws. A bad network makes a step fail, and that failure is the
 * measurement. A thrown error would stop the Network Run and lose the rest of
 * the data.
 */
import { mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import type { Counters } from './throttle-proxy';
import type { ThrottleProxy } from './throttle-proxy';
import { inWebview } from './app';

export interface StepRecord {
  name: string;
  ms: number;
  status: 'ok' | 'timeout' | 'error';
  note?: string;
}

export interface JourneyRecord {
  journey: string;
  label: string;
  profile: string;
  profileLabel: string;
  run: number;
  device: string;
  startedAt: string;
  totalMs: number;
  status: 'ok' | 'timeout' | 'error';
  steps: StepRecord[];
  network: Counters;
  /** What a user would see go wrong. Each line goes into the report. */
  findings: string[];
  /** The named screens that the Journey reached, in order. The report makes a matrix. */
  pages?: string[];
  screenshots: string[];
}

/** The strings that this app puts on the screen when a read fails. */
const FAILURE_TEXT: Array<{ pattern: RegExp; meaning: string }> = [
  { pattern: /failed to load/i, meaning: 'the Public Incident Page failed to load' },
  { pattern: /no records to display/i, meaning: 'the list came back empty' },
  { pattern: /unable to (load|retrieve|find)/i, meaning: 'a read failed' },
  { pattern: /something went wrong/i, meaning: 'a generic error' },
  { pattern: /please try again|try again later/i, meaning: 'the app asks for a retry' },
  { pattern: /no internet|check your connection|you are offline/i, meaning: 'an offline message' },
  { pattern: /this app needs a newer browser/i, meaning: 'the Payload did not load' },
];

export interface ScreenState {
  route: string;
  textLength: number;
  spinners: number;
  failures: string[];
  counts: Record<string, number>;
}

/**
 * Reads the screen the way a user sees it. A hidden element does not count,
 * because a user cannot see it.
 */
export async function readScreen(countSelectors: Record<string, string> = {}): Promise<ScreenState> {
  const raw = (await inWebview(async () =>
    driver.execute((selectors: Record<string, string>) => {
      const visible = (el: Element): boolean => {
        const rect = el.getBoundingClientRect();
        const style = window.getComputedStyle(el);
        return (
          rect.width > 0 &&
          rect.height > 0 &&
          style.visibility !== 'hidden' &&
          style.display !== 'none' &&
          style.opacity !== '0'
        );
      };
      const counts: Record<string, number> = {};
      for (const key of Object.keys(selectors)) {
        counts[key] = document.querySelectorAll(selectors[key]).length;
      }
      return {
        route: window.location.pathname,
        text: document.body ? document.body.innerText : '',
        spinners: Array.from(document.querySelectorAll('mat-spinner, mat-progress-spinner')).filter(
          visible,
        ).length,
        counts,
      };
    }, countSelectors),
  )) as { route: string; text: string; spinners: number; counts: Record<string, number> };

  const text = String(raw.text || '');
  const failures: string[] = [];
  for (const entry of FAILURE_TEXT) {
    const hit = entry.pattern.exec(text);
    if (hit) failures.push(`${entry.meaning} ("${hit[0]}")`);
  }

  return {
    route: raw.route,
    textLength: text.trim().length,
    spinners: raw.spinners,
    failures,
    counts: raw.counts || {},
  };
}

export interface WaitResult {
  ok: boolean;
  ms: number;
}

/** A bounded wait that never throws. A false result is data, not a crash. */
export async function waitFor(
  predicate: () => Promise<boolean>,
  options: { timeout: number; interval?: number },
): Promise<WaitResult> {
  const started = Date.now();
  const interval = options.interval ?? 1000;
  while (Date.now() - started < options.timeout) {
    try {
      if (await predicate()) return { ok: true, ms: Date.now() - started };
    } catch {
      /* the WebView is busy or reloading. Try again. */
    }
    await browser.pause(interval);
  }
  return { ok: false, ms: Date.now() - started };
}

/**
 * Waits until the screen stops working: no spinner a user can see, and no byte
 * through the proxy for `quietMs`. The byte count is the half that matters,
 * because a screen with no spinner can still be pulling map tiles.
 */
export async function waitUntilSettled(
  proxy: ThrottleProxy | null,
  options: { timeout: number; quietMs?: number },
): Promise<WaitResult> {
  const quietMs = options.quietMs ?? 3000;
  return waitFor(
    async () => {
      const state = await readScreen();
      if (state.spinners > 0) return false;
      if (!proxy) return true;
      return proxy.idleMs() >= quietMs;
    },
    { timeout: options.timeout, interval: 1000 },
  );
}

export interface JourneyContext {
  profile: string;
  proxy: ThrottleProxy | null;
  /** Measures one named step. The body must bound its own waits. */
  step<T>(name: string, body: () => Promise<T>): Promise<T | undefined>;
  /** Adds a line to the report. */
  find(note: string): void;
  /** Saves a screenshot under the profile, and records the name. */
  shot(name: string): Promise<void>;
  /** Reads the screen and turns each visible failure into a finding. */
  check(name: string, countSelectors?: Record<string, string>): Promise<ScreenState>;
  /** Records a screen that the Journey reached, in order. */
  reached(page: string): void;
}

export interface Journey {
  name: string;
  label: string;
  run(ctx: JourneyContext): Promise<void>;
}

export class JourneyRecorder implements JourneyContext {
  private record: JourneyRecord;
  private startedAtMs = Date.now();

  constructor(
    journey: Journey,
    public readonly profile: string,
    profileLabel: string,
    run: number,
    device: string,
    public readonly proxy: ThrottleProxy | null,
  ) {
    this.record = {
      journey: journey.name,
      label: journey.label,
      profile,
      profileLabel,
      run,
      device,
      startedAt: new Date().toISOString(),
      totalMs: 0,
      status: 'ok',
      steps: [],
      network: {
        connections: 0,
        bytesDown: 0,
        bytesUp: 0,
        stalled: 0,
        failed: 0,
        failures: [],
        lastActivity: 0,
        hosts: [],
      },
      findings: [],
      screenshots: [],
    };
  }

  async step<T>(name: string, body: () => Promise<T>): Promise<T | undefined> {
    const started = Date.now();
    try {
      const value = await body();
      const ms = Date.now() - started;
      // `waitFor` reports a miss as `ok: false`, so a step that returns one is a
      // timeout, not a pass.
      const missed =
        value &&
        typeof value === 'object' &&
        'ok' in (value as object) &&
        (value as unknown as WaitResult).ok === false;
      this.record.steps.push({ name, ms, status: missed ? 'timeout' : 'ok' });
      if (missed) this.record.status = 'timeout';
      return value;
    } catch (error) {
      this.record.steps.push({
        name,
        ms: Date.now() - started,
        status: 'error',
        note: (error as Error).message.split('\n')[0].slice(0, 200),
      });
      this.record.status = 'error';
      return undefined;
    }
  }

  find(note: string): void {
    if (!this.record.findings.includes(note)) this.record.findings.push(note);
  }

  reached(page: string): void {
    if (!this.record.pages) this.record.pages = [];
    this.record.pages.push(page);
  }

  async shot(name: string): Promise<void> {
    const dir = join(process.env.WFNEWS_SHOT_DIR as string, 'network', this.profile);
    mkdirSync(dir, { recursive: true });
    const file = join(dir, `${this.record.journey}-${name}.png`);
    try {
      await browser.saveScreenshot(file);
      this.record.screenshots.push(file);
    } catch {
      /* the session can refuse a screenshot while the app is drawing */
    }
  }

  async check(name: string, countSelectors: Record<string, string> = {}): Promise<ScreenState> {
    let state: ScreenState;
    try {
      state = await readScreen(countSelectors);
    } catch (error) {
      this.find(`${name}: the WebView could not be read (${(error as Error).message.slice(0, 80)})`);
      return { route: '?', textLength: 0, spinners: 0, failures: [], counts: {} };
    }
    for (const failure of state.failures) this.find(`${name}: ${failure}`);
    if (state.spinners > 0) this.find(`${name}: a spinner is still turning after the screen settled`);
    if (state.textLength < 40) this.find(`${name}: the screen is empty`);
    return state;
  }

  finish(): JourneyRecord {
    this.record.totalMs = Date.now() - this.startedAtMs;
    if (this.proxy) {
      const counters = this.proxy.snapshot();
      this.record.network = counters;
      const many = (n: number) => (n === 1 ? 'connection' : 'connections');
      if (counters.failed > 0) {
        this.find(
          `${counters.failed} ${many(counters.failed)} never opened: ${counters.failures.join('; ')}`,
        );
      }
      if (counters.stalled > 0) {
        this.find(`${counters.stalled} ${many(counters.stalled)} died in the middle`);
      }
    }
    const dir = join(__dirname, '..', '..', 'logs', 'network', this.profile);
    mkdirSync(dir, { recursive: true });
    writeFileSync(
      join(dir, `${this.record.journey}-run${this.record.run}.json`),
      JSON.stringify(this.record, null, 2),
    );
    return this.record;
  }
}
