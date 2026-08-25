/**
 * Reads every Journey record in `logs/network/` and writes NETWORK_FINDINGS_STE.md
 * at the repository root.
 *
 * It reports the median of the repeats, not the mean. One slow run on a mobile
 * network is normal, and a mean lets that one run tell the story.
 */
import { existsSync, mkdirSync, readFileSync, readdirSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));
const e2eRoot = join(here, '..');
const repoRoot = join(e2eRoot, '..', '..', '..', '..', '..', '..');
const logRoot = join(e2eRoot, 'logs', 'network');
const outFile = join(repoRoot, 'NETWORK_FINDINGS_STE.md');

const PROFILE_ORDER = ['wifi', 'lte', '3g', 'slow-3g', '2g', 'lossy', 'offline'];

function loadRecords() {
  if (!existsSync(logRoot)) return [];
  const records = [];
  for (const profile of readdirSync(logRoot)) {
    const dir = join(logRoot, profile);
    for (const file of readdirSync(dir).filter((f) => f.endsWith('.json'))) {
      records.push(JSON.parse(readFileSync(join(dir, file), 'utf8')));
    }
  }
  return records;
}

function median(values) {
  if (!values.length) return null;
  const sorted = [...values].sort((a, b) => a - b);
  const middle = Math.floor(sorted.length / 2);
  return sorted.length % 2 ? sorted[middle] : Math.round((sorted[middle - 1] + sorted[middle]) / 2);
}

const seconds = (ms) => (ms === null ? '—' : `${(ms / 1000).toFixed(1)} s`);
const kilobytes = (bytes) => (bytes === null ? '—' : `${Math.round(bytes / 1024)} kB`);

/** Groups "1 connection died" with "7 connections died". The count is not the finding. */
const findingKey = (text) =>
  text.replace(/\b\d+\b/g, 'N').replace(/\bconnections\b/g, 'connection');

function main() {
  const records = loadRecords();
  if (!records.length) {
    console.error(`No Journey records under ${logRoot}. Run the Journeys first.`);
    process.exit(1);
  }

  const profiles = PROFILE_ORDER.filter((p) => records.some((r) => r.profile === p));
  const journeys = [];
  for (const record of records) {
    if (!journeys.some((j) => j.name === record.journey)) {
      journeys.push({ name: record.journey, label: record.label });
    }
  }

  const device = records[0].device;
  const profileLabels = new Map(records.map((r) => [r.profile, r.profileLabel]));
  const runs = Math.max(...records.map((r) => r.run));
  const date = records
    .map((r) => r.startedAt)
    .sort()[0]
    .slice(0, 10);

  const out = [];
  out.push('# Network findings');
  out.push('');
  out.push('**Written in ASD-STE100 Simplified Technical English. It uses the words from');
  out.push('[CONTEXT.md](CONTEXT.md).**');
  out.push('');
  out.push(`Date of the test: ${date}. Device: \`${device}\`. Runs for each Journey: ${runs}.`);
  out.push('');
  out.push('This file is made by a program. Do not edit it by hand. To make it again:');
  out.push('');
  out.push('```bash');
  out.push('cd client/wfnews-war/src/main/angular/e2e');
  out.push('npm run test:network:all');
  out.push('```');
  out.push('');
  out.push('---');
  out.push('');

  out.push('## 1. How the network was made bad');
  out.push('');
  out.push('The device sends all its traffic to a proxy on the workstation. `adb reverse`');
  out.push('carries the port over USB. The proxy adds a delay, limits the speed, and can');
  out.push('kill a connection in the middle.');
  out.push('');
  out.push('**A proxy is used, and not the Chrome DevTools throttle.** Three services send');
  out.push('their requests with `CapacitorHttp`, which is DEX code and not the Payload. A');
  out.push('DevTools throttle does not touch those requests. The Active Wildfire Map and the');
  out.push('Saved Location reads are two of the three, so a DevTools measurement would call');
  out.push('them good on 2G and would be wrong.');
  out.push('');
  out.push('| Network Profile | What it is |');
  out.push('|---|---|');
  for (const profile of profiles) out.push(`| \`${profile}\` | ${profileLabels.get(profile)} |`);
  out.push('');
  out.push('| Measurement | True for a user? |');
  out.push('|---|---|');
  out.push('| The order of the Network Profiles | **Yes.** Slower is slower. |');
  out.push('| The bytes for each Journey | **Yes.** The application code asks for them. |');
  out.push('| A screen that never leaves the spinner | **Yes.** The logic is the same in each build. |');
  out.push('| The absolute times | **Compare only.** This is a debug build, and it is not minified. |');
  out.push('| A host that gives `ENOTFOUND` | **Check it first.** The proxy looks up the name on the workstation, and not on the device. A name that only the device network knows fails here and works for a user. |');
  out.push('');
  out.push('## The rule for this report');
  out.push('');
  out.push('**The Report of Fire flow must work with no network. The rest of the app does');
  out.push('not have to.** So read the Report of Fire section first. A slow or empty screen');
  out.push('somewhere else on the `offline` Network Profile is not a defect by this rule.');
  out.push('');
  out.push('---');
  out.push('');

  // One table for each Journey.
  let section = 2;
  for (const journey of journeys) {
    const forJourney = records.filter((r) => r.journey === journey.name);
    const stepNames = [];
    for (const record of forJourney) {
      for (const step of record.steps) if (!stepNames.includes(step.name)) stepNames.push(step.name);
    }

    out.push(`## ${section}. Journey: ${journey.label}`);
    out.push('');
    out.push(`| Network Profile | Total | ${stepNames.join(' | ')} | Down | Connections | Result |`);
    out.push(`|---|---|${stepNames.map(() => '---').join('|')}|---|---|---|`);

    for (const profile of profiles) {
      const rows = forJourney.filter((r) => r.profile === profile);
      if (!rows.length) continue;
      const cells = [`\`${profile}\``, seconds(median(rows.map((r) => r.totalMs)))];
      for (const name of stepNames) {
        const values = rows
          .map((r) => r.steps.find((s) => s.name === name))
          .filter(Boolean);
        if (!values.length) {
          cells.push('—');
          continue;
        }
        const time = seconds(median(values.map((s) => s.ms)));
        const bad = values.filter((s) => s.status !== 'ok').length;
        cells.push(bad ? `**${time} ✗**` : time);
      }
      cells.push(kilobytes(median(rows.map((r) => r.network.bytesDown))));
      cells.push(String(median(rows.map((r) => r.network.connections)) ?? '—'));
      const worst = rows.some((r) => r.status === 'error')
        ? 'error'
        : rows.some((r) => r.status === 'timeout')
          ? 'did not finish'
          : 'finished';
      cells.push(worst);
      out.push(`| ${cells.join(' | ')} |`);
    }
    out.push('');
    out.push('A **✗** means that the step ran out of its budget. The time is the budget, and');
    out.push('not the time that the step needs.');
    out.push('');

    const notes = new Map();
    for (const record of forJourney) {
      for (const finding of record.findings) {
        const key = `${record.profile}: ${findingKey(finding)}`;
        if (!notes.has(key)) notes.set(key, { profile: record.profile, text: finding });
      }
    }
    if (notes.size) {
      out.push('What a user sees go wrong:');
      out.push('');
      for (const note of notes.values()) out.push(`- \`${note.profile}\` — ${note.text}`);
      out.push('');
    }

    const walked = forJourney.filter((r) => Array.isArray(r.pages) && r.pages.length);
    if (walked.length) {
      const order = [];
      for (const record of walked) {
        for (const page of record.pages) {
          const name = String(page).split(' — ')[0];
          if (!/^(stored report|after submit)/.test(page) && !order.includes(name)) order.push(name);
        }
      }
      const walkedProfiles = profiles.filter((p) => walked.some((r) => r.profile === p));
      out.push('Which pages the walk reached:');
      out.push('');
      out.push(`| Page | ${walkedProfiles.join(' | ')} |`);
      out.push(`|---|${walkedProfiles.map(() => '---').join('|')}|`);
      for (const name of order) {
        const cells = walkedProfiles.map((profile) => {
          const rows = walked.filter((r) => r.profile === profile);
          const hit = rows.some((r) => r.pages.some((page) => String(page).startsWith(name)));
          return hit ? '✓' : '**not reached**';
        });
        const title = walked
          .flatMap((r) => r.pages)
          .map(String)
          .find((page) => page.startsWith(name));
        const label = title && title.includes(' — ') ? title.split(' — ')[1] : name;
        out.push(`| \`${name}\` — ${label} | ${cells.join(' | ')} |`);
      }
      out.push('');

      const notesFromWalk = walked
        .flatMap((r) => r.pages.filter((page) => /^(stored report|after submit)/.test(String(page))).map((page) => `\`${r.profile}\` — ${page}`))
        .filter((line, i, all) => all.indexOf(line) === i);
      if (notesFromWalk.length) {
        out.push('What the walk ended with:');
        out.push('');
        for (const line of notesFromWalk) out.push(`- ${line}`);
        out.push('');
      }
    }

    const heaviest = forJourney
      .filter((r) => r.network.hosts.length)
      .sort((a, b) => b.network.bytesDown - a.network.bytesDown)[0];
    if (heaviest) {
      out.push('The hosts that sent the most, in the heaviest run:');
      out.push('');
      out.push('| Host | Down | Connections |');
      out.push('|---|---|---|');
      for (const host of heaviest.network.hosts.slice(0, 6)) {
        out.push(`| \`${host.host}\` | ${kilobytes(host.bytesDown)} | ${host.connections} |`);
      }
      out.push('');
    }
    out.push('---');
    out.push('');
    section += 1;
  }

  // The findings, ranked by how many Journey and Network Profile pairs show them.
  const ranked = new Map();
  for (const record of records) {
    for (const finding of record.findings) {
      const key = findingKey(finding);
      const entry = ranked.get(key) || { text: finding, where: new Map(), count: 0 };
      const profilesHit = entry.where.get(record.journey) || new Set();
      profilesHit.add(record.profile);
      entry.where.set(record.journey, profilesHit);
      entry.count += 1;
      ranked.set(key, entry);
    }
  }
  /** "map (every profile), list-to-incident (2g, offline)". A long list helps nobody. */
  const whereText = (entry) =>
    [...entry.where.entries()]
      .map(([journey, hit]) => {
        const ran = records.filter((r) => r.journey === journey).length;
        return hit.size >= ran ? `${journey} (every profile)` : `${journey} (${[...hit].sort().join(', ')})`;
      })
      .join('; ');
  const order = [...ranked.values()].sort((a, b) => b.count - a.count);

  out.push(`## ${section}. What to improve`);
  out.push('');
  if (!order.length) {
    out.push('No Journey showed a defect on any Network Profile.');
  } else {
    out.push('The list is in order. The first line is seen on the most screens.');
    out.push('');
    out.push('| What a user sees | Where |');
    out.push('|---|---|');
    for (const entry of order.slice(0, 30)) {
      out.push(`| ${entry.text.replace(/\|/g, '\\|')} | ${whereText(entry)} |`);
    }
  }
  out.push('');

  // A Journey that pulls much less than the Baseline, and still says it finished,
  // lost data without telling the user. This is the failure that no screen shows.
  const quiet = [];
  for (const journey of journeys) {
    const forJourney = records.filter((r) => r.journey === journey.name);
    const baseline = median(
      forJourney.filter((r) => r.profile === 'wifi').map((r) => r.network.bytesDown),
    );
    if (!baseline) continue;
    for (const profile of profiles) {
      if (profile === 'wifi' || profile === 'offline') continue;
      const rows = forJourney.filter((r) => r.profile === profile);
      if (!rows.length) continue;
      const got = median(rows.map((r) => r.network.bytesDown));
      const share = Math.round((got / baseline) * 100);
      // A finding that starts with a count came from the proxy. Every other finding
      // came from the screen, and a finding from the screen means the user was told.
      const fromProxy = /^\d+ connections? /;
      const silent = rows.every(
        (r) => r.status === 'ok' && r.findings.every((f) => fromProxy.test(f)),
      );
      if (share < 60 && silent) {
        quiet.push({ journey: journey.name, profile, share, got, baseline });
      }
    }
  }
  if (quiet.length) {
    out.push('### Data that went missing, with no message on the screen');
    out.push('');
    out.push('Each row below is a Journey that reported that it finished. It pulled much');
    out.push('less than the Baseline, so some data never arrived. The screen did not say so,');
    out.push('and a user reads the part that arrived as the whole truth.');
    out.push('');
    out.push('| Journey | Network Profile | Down | Against the Baseline |');
    out.push('|---|---|---|---|');
    for (const row of quiet.sort((a, b) => a.share - b.share)) {
      out.push(
        `| ${row.journey} | \`${row.profile}\` | ${kilobytes(row.got)} | ${row.share}% of ${kilobytes(row.baseline)} |`,
      );
    }
    out.push('');
  }

  const worstBytes = [...records].sort((a, b) => b.network.bytesDown - a.network.bytesDown)[0];
  if (worstBytes && worstBytes.network.bytesDown > 0) {
    out.push(
      `The heaviest Journey is **${worstBytes.journey}**. It pulled ` +
        `${kilobytes(worstBytes.network.bytesDown)} over ${worstBytes.network.connections} connections. ` +
        'Fewer bytes and fewer connections help every Network Profile at the same time.',
    );
    out.push('');
  }

  mkdirSync(dirname(outFile), { recursive: true });
  writeFileSync(outFile, out.join('\n'));
  console.log(`Wrote ${outFile} from ${records.length} Journey records.`);
}

main();
