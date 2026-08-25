/**
 * Runs the Journeys against each Network Profile in turn, then makes the report.
 *
 *   node scripts/run-network.mjs                     # every profile, one run each
 *   node scripts/run-network.mjs 3g 2g offline       # only these profiles
 *   WFNEWS_NET_REPEATS=3 node scripts/run-network.mjs
 *
 * Each profile gets its own WebdriverIO process. A crash in one profile then
 * costs one profile, not the whole Network Run.
 */
import { spawnSync } from 'node:child_process';
import { rmSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));
const root = join(here, '..');

const wdioCli = join(root, 'node_modules', '@wdio', 'cli', 'bin', 'wdio.js');

const ALL = ['wifi', 'lte', '3g', 'slow-3g', '2g', 'lossy', 'offline'];
const profiles = process.argv.slice(2).length ? process.argv.slice(2) : ALL;

const unknown = profiles.filter((p) => !ALL.includes(p));
if (unknown.length) {
  console.error(`No Network Profile is named: ${unknown.join(', ')}. Use: ${ALL.join(', ')}`);
  process.exit(1);
}

// Old numbers must not enter a new report.
if (process.env.WFNEWS_NET_KEEP !== '1') {
  rmSync(join(root, 'logs', 'network'), { recursive: true, force: true });
}

const failed = [];
for (const profile of profiles) {
  console.log(`\n=== Network Profile: ${profile} ===\n`);
  // Call the wdio entry point with this Node, and not through `npx`. A `.cmd`
  // shim needs a shell on Windows, and it fails with no output when there is none.
  const result = spawnSync(
    process.execPath,
    [wdioCli, 'run', 'wdio.conf.ts', '--spec', 'test/specs/network-journeys.e2e.ts'],
    {
      cwd: root,
      stdio: 'inherit',
      env: { ...process.env, WFNEWS_NET_PROFILE: profile },
    },
  );
  if (result.error) console.error(`  ${profile} could not start: ${result.error.message}`);
  if (result.status !== 0) failed.push(profile);
}

console.log('\n=== Making the report ===\n');
spawnSync(process.execPath, [join(here, 'network-report.mjs')], { cwd: root, stdio: 'inherit' });

if (failed.length) {
  console.error(`\nThese Network Profiles did not finish: ${failed.join(', ')}`);
  process.exit(1);
}
