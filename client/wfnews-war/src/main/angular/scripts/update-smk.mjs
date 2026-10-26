// Builds SMK's MapLibre bundle from a smk-wildfire checkout into vendor/smk/.
// SMK v2 is not on npm yet, so WFNEWS keeps the build in git until it is.
// Usage: node scripts/update-smk.mjs [smk-wildfire dir]   (default: a sibling of this repository)
import { spawnSync } from 'node:child_process';
import { mkdtempSync, readFileSync, rmSync, writeFileSync, mkdirSync, copyFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const angular = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const smk = resolve(process.argv[2] ?? join(angular, '../../../../../../smk-wildfire'));
const vendor = join(angular, 'vendor/smk');

const run = (cmd, args) => {
  const r = spawnSync(cmd, args, { cwd: smk, shell: true, encoding: 'utf8' });
  if (r.status !== 0) throw new Error(`${cmd} ${args.join(' ')} failed in ${smk}:\n${r.error?.message ?? r.stderr ?? r.stdout}`);
  return r.stdout.trim();
};

// A build of uncommitted code could never be traced back to its source.
const dirty = run('git', ['status', '--porcelain', '--', 'src', 'build', 'package.json', 'package-lock.json', 'vite.config*.js']);
if (dirty) throw new Error(`smk-wildfire has uncommitted changes:\n${dirty}`);
const commit = run('git', ['rev-parse', 'HEAD']);
const branch = run('git', ['rev-parse', '--abbrev-ref', 'HEAD']);
const date = run('git', ['log', '-1', '--format=%cI']);

const out = mkdtempSync(join(tmpdir(), 'smk-build-'));
try {
  run('npx', ['vite', 'build', '--config', 'vite.config.maplibre.js', '--outDir', JSON.stringify(out), '--emptyOutDir']);

  // index.html loads Material Icons from Google Fonts; SMK's inline copy adds 163 KB to every page.
  const css = readFileSync(join(out, 'smk.maplibre.css'), 'utf8');
  const fontFace = /@font-face\{font-family:\s*["']?Material Icons["']?;[^}]*\}/g;
  if ((css.match(fontFace) ?? []).length !== 1) throw new Error('expected one Material Icons @font-face in smk.maplibre.css');

  // Offline, a remote @import fails and styles.css never leaves media="print".
  const remoteImport = /@import\s*(?:url\(\s*)?(["']?)https?:\/\/[^"')]*\1\s*\)?[^;]*;/g;
  const vendored = css.replace(fontFace, '').replace(remoteImport, '');
  if (/@import/.test(vendored)) throw new Error('an @import is left in smk.maplibre.css');

  // The MapLibre build inlines its images, so it needs no assets/ folder.
  rmSync(vendor, { recursive: true, force: true });
  mkdirSync(vendor, { recursive: true });
  copyFileSync(join(out, 'smk.maplibre.js'), join(vendor, 'smk.js'));
  writeFileSync(join(vendor, 'smk.css'), vendored);
  copyFileSync(join(out, 'smk-template-compiler.js'), join(vendor, 'smk-template-compiler.js'));
  writeFileSync(
    join(vendor, 'smk.version.json'),
    JSON.stringify({ source: 'https://github.com/bcgov/smk-wildfire', branch, commit, date, build: 'vite.config.maplibre.js' }, null, 2) + '\n',
  );
  console.log(`vendor/smk is now smk-wildfire ${branch} ${commit.slice(0, 7)} (${date})`);
} finally {
  rmSync(out, { recursive: true, force: true });
}
