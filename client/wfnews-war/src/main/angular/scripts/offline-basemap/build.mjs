// Builds the offline vector basemap assets into vendor/offline-basemap/:
//   - bc.pmtiles: BC extract (zoom 0-12) from a Protomaps daily OpenStreetMap build,
//     clipped to the BC boundary and trimmed via tippecanoe's tile-join
//   - fonts/<fontstack>/<range>.pbf: SDF glyph ranges for MapLibre labels
//   - version.json: build metadata for reproducibility
//
// Requires Docker. Usage (from client/wfnews-war/src/main/angular):
//   node scripts/offline-basemap/build.mjs [--build=YYYYMMDD] [--region=path] [--maxzoom=12]
import { spawnSync } from "node:child_process";
import {
  copyFileSync,
  existsSync,
  mkdirSync,
  mkdtempSync,
  renameSync,
  rmSync,
  statSync,
  writeFileSync,
} from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { layers as protomapsLayers, namedFlavor } from "@protomaps/basemaps";

const scriptDir = dirname(fileURLToPath(import.meta.url));
const angularDir = resolve(scriptDir, "../..");
const outDir = join(angularDir, "vendor/offline-basemap");
const DOCKER_IMAGE = "wfnews-offline-basemap-tools";
const DEFAULT_REGION = join(scriptDir, "bc-boundary.geojson");
const DEFAULT_MAXZOOM = "12";
const BUILDS_INDEX_URL = "https://build-metadata.protomaps.dev/builds.json";
const GLYPHS_BASE_URL = "https://protomaps.github.io/basemaps-assets/fonts";
const DROP_LAYERS = ["landuse", "buildings", "pois"];
const ALLOWED_KEYS = [
  "is_bridge",
  "is_link",
  "is_tunnel",
  "kind",
  "kind_detail",
  "min_zoom",
  "name",
  "name:en",
  "population_rank",
  "ref",
  "ref:en",
  "shield_text",
  "sort_key",
];
const FEATURE_FILTER = {
  water: [
    "all",
    ["!=", "kind", "stream"],
    [
      "any",
      ["<", "$zoom", 8],
      ["!=", "$type", "Polygon"],
      [
        "all",
        ["!=", "kind", "reef"],
        [
          "any",
          ["!=", "kind", "water"],
          [
            "all",
            ["any", ["has", "kind_detail"], ["has", "name"]],
            [
              "any",
              ["!has", "kind_detail"],
              [
                "!in",
                "kind_detail",
                "river",
                "stream",
                "basin",
                "canal",
                "ditch",
                "drain",
              ],
            ],
          ],
        ],
      ],
    ],
  ],
  roads: [
    "any",
    ["<", "$zoom", 11],
    [
      "all",
      ["!in", "kind", "other", "aerialway"],
      [
        "any",
        ["!=", "kind", "path"],
        [
          "all",
          ["has", "kind_detail"],
          ["in", "kind_detail", "track", "resource extraction"],
        ],
      ],
    ],
  ],
  boundaries: ["any", ["!has", "kind_detail"], ["<=", "kind_detail", 4]],
};
const GLYPH_RANGES = [
  "0-255",
  "256-511",
  "512-767",
  "768-1023",
  "7680-7935",
  "8192-8447",
];

function parseArgs(argv) {
  const args = {};
  for (const arg of argv) {
    const m = /^--([a-z-]+)=(.+)$/.exec(arg);
    if (m) args[m[1]] = m[2];
  }
  return args;
}

async function resolveBuildKey(requestedBuild) {
  if (requestedBuild) {
    return requestedBuild.endsWith(".pmtiles")
      ? requestedBuild
      : `${requestedBuild}.pmtiles`;
  }
  const resp = await fetch(BUILDS_INDEX_URL);
  if (!resp.ok) {
    throw new Error(
      `Failed to fetch Protomaps builds index (${resp.status}): ${BUILDS_INDEX_URL}`,
    );
  }
  const builds = await resp.json();
  if (!Array.isArray(builds) || builds.length === 0) {
    throw new Error("Protomaps builds index returned no builds");
  }
  const latest = builds[builds.length - 1];
  if (!latest?.key) {
    throw new Error("Latest Protomaps build entry has no key");
  }
  return latest.key;
}

function ensureDockerImage() {
  const info = spawnSync("docker", ["info"], { stdio: "ignore" });
  if (info.status !== 0) {
    throw new Error(
      "Docker is required to run offline-basemap:build. Start Docker Desktop / daemon and retry.",
    );
  }
  console.log(`Building/checking Docker image ${DOCKER_IMAGE}...`);
  const build = spawnSync("docker", ["build", "-t", DOCKER_IMAGE, scriptDir], {
    stdio: "inherit",
  });
  if (build.status !== 0) {
    throw new Error(`docker build failed with exit code ${build.status}`);
  }
}

function runContainerPipeline(workDir, sourceUrl, maxzoom) {
  const tileJoinFlags = [
    ...DROP_LAYERS.map((l) => `-L ${l}`),
    ...ALLOWED_KEYS.map((k) => `-y ${k}`),
  ].join(" ");

  const shellScript = [
    'pmtiles extract "$SOURCE_URL" /tmp/raw.pmtiles --region=/work/region.geojson --maxzoom="$MAXZOOM"',
    "pmtiles show /tmp/raw.pmtiles --header-json > /tmp/header.json",
    `tile-join -o /tmp/bc.pmtiles -f --no-tile-size-limit --no-tile-stats ${tileJoinFlags} -J /work/filter.json /tmp/raw.pmtiles`,
    "pmtiles edit /tmp/bc.pmtiles --header-json=/tmp/header.json",
    "pmtiles verify /tmp/bc.pmtiles",
    "cp /tmp/bc.pmtiles /work/bc.pmtiles",
  ].join("\n");

  const result = spawnSync(
    "docker",
    [
      "run",
      "--rm",
      "-v",
      `${workDir}:/work`,
      "-e",
      `SOURCE_URL=${sourceUrl}`,
      "-e",
      `MAXZOOM=${maxzoom}`,
      DOCKER_IMAGE,
      "sh",
      "-eu",
      "-c",
      shellScript,
    ],
    { stdio: "inherit" },
  );
  if (result.status !== 0) {
    throw new Error(`Docker pipeline failed with exit code ${result.status}`);
  }
}

function collectStyleFonts() {
  const fonts = new Set();
  const dropSet = new Set(DROP_LAYERS);
  const walk = (value) => {
    if (typeof value === "string") {
      if (/^Noto Sans /.test(value)) fonts.add(value);
    } else if (Array.isArray(value)) {
      value.forEach(walk);
    }
  };
  for (const layer of protomapsLayers("protomaps", namedFlavor("light"), {
    lang: "en",
  })) {
    if (dropSet.has(layer?.["source-layer"])) continue;
    walk(layer?.layout?.["text-font"]);
  }
  return [...fonts].sort();
}

async function downloadGlyphs(fonts) {
  const fontsDir = join(outDir, "fonts");
  for (const font of fonts) {
    const fontDir = join(fontsDir, font);
    mkdirSync(fontDir, { recursive: true });
    for (const range of GLYPH_RANGES) {
      const url = `${GLYPHS_BASE_URL}/${encodeURIComponent(font)}/${range}.pbf`;
      const resp = await fetch(url);
      if (!resp.ok) {
        throw new Error(`Failed to fetch glyph ${url} (${resp.status})`);
      }
      writeFileSync(
        join(fontDir, `${range}.pbf`),
        Buffer.from(await resp.arrayBuffer()),
      );
    }
  }
}

async function main() {
  const args = parseArgs(process.argv.slice(2));
  const regionPath = resolve(angularDir, args.region ?? DEFAULT_REGION);
  const maxzoom = args.maxzoom ?? DEFAULT_MAXZOOM;
  const buildKey = await resolveBuildKey(args.build);
  const sourceUrl = `https://build.protomaps.com/${buildKey}`;

  ensureDockerImage();

  mkdirSync(outDir, { recursive: true });
  const tempDir = mkdtempSync(join(tmpdir(), "offline-basemap-"));

  try {
    copyFileSync(regionPath, join(tempDir, "region.geojson"));
    writeFileSync(join(tempDir, "filter.json"), JSON.stringify(FEATURE_FILTER));

    const tmpPmtiles = join(outDir, "bc.pmtiles.tmp");
    const finalPmtiles = join(outDir, "bc.pmtiles");
    if (existsSync(tmpPmtiles)) rmSync(tmpPmtiles, { force: true });

    console.log(
      `Extracting and trimming ${sourceUrl} (region=${regionPath}, maxzoom=${maxzoom})...`,
    );
    runContainerPipeline(tempDir, sourceUrl, maxzoom);

    copyFileSync(join(tempDir, "bc.pmtiles"), tmpPmtiles);
    renameSync(tmpPmtiles, finalPmtiles);

    const bytes = statSync(finalPmtiles).size;
    if (bytes <= 0) {
      throw new Error("Extracted bc.pmtiles is empty");
    }

    const fonts = collectStyleFonts();
    console.log(
      `Downloading glyphs for ${fonts.join(", ")} (${
        GLYPH_RANGES.length
      } ranges each)...`,
    );
    await downloadGlyphs(fonts);

    writeFileSync(
      join(outDir, "version.json"),
      JSON.stringify(
        {
          source: sourceUrl,
          build: buildKey,
          region: "scripts/offline-basemap/bc-boundary.geojson",
          maxzoom: Number(maxzoom),
          droppedLayers: DROP_LAYERS,
          bytes,
          fonts,
          ranges: GLYPH_RANGES,
          generatedAt: new Date().toISOString(),
        },
        null,
        2,
      ) + "\n",
    );

    const mb = (bytes / 1e6).toFixed(2);
    const mib = (bytes / (1024 * 1024)).toFixed(2);
    console.log(
      `vendor/offline-basemap/bc.pmtiles ready (${mb} MB / ${mib} MiB) from ${buildKey}`,
    );
  } finally {
    rmSync(tempDir, { recursive: true, force: true });
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
