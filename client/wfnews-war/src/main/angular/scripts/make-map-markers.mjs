// Makes the main map marker PNGs from the stage of control SVGs. Run from the angular folder:
//   node scripts/make-map-markers.mjs
// MapLibre draws a symbol from a raster only, so the shadow is baked in here.
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';

const SVG_DIR = new URL('../src/assets/images/svg-icons/', import.meta.url);
const PNG_DIR = new URL('../src/assets/images/map-markers/', import.meta.url);

// PNG pixels for each CSS pixel; SMK gets the ratio from markerSize.
const SCALE = 4;

// Room for the shadow on each side; the rest of markerSize is the circle.
const MARGIN = 2;

// --marker-shadow in _stage-icon.scss: 0 0.5px 1.5px rgba(0, 0, 0, 0.55).
const SHADOW = { dy: 0.5, stdDeviation: 0.75, opacity: 0.55 };

// PNG name: [SVG name, markerSize in the layer configs].
const MARKERS = {
  'wildfire-out-of-control': ['out-of-control', 20],
  'wildfire-holding': ['being-held', 20],
  'wildfire-under-control': ['under-control', 20],
  'wildfire-out': ['out-fire', 20],
  'wildfire-of-note': ['wildfire-of-note', 30],
};

for (const [png, [source, size]] of Object.entries(MARKERS)) {
  const circle = size - 2 * MARGIN;
  const marker = readFileSync(new URL(source + '.svg', SVG_DIR), 'utf8').replace(
    '<svg xmlns="http://www.w3.org/2000/svg"',
    `<svg x="${MARGIN}" y="${MARGIN}" width="${circle}" height="${circle}"`,
  );

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${size * SCALE}" height="${size * SCALE}">
<defs><filter id="shadow" x="-25%" y="-25%" width="150%" height="150%">
<feGaussianBlur in="SourceAlpha" stdDeviation="${SHADOW.stdDeviation}"/>
<feOffset dy="${SHADOW.dy}"/>
<feComponentTransfer><feFuncA type="linear" slope="${SHADOW.opacity}"/></feComponentTransfer>
<feMerge><feMergeNode/><feMergeNode in="SourceGraphic"/></feMerge>
</filter></defs>
<g transform="scale(${SCALE})"><g filter="url(#shadow)">${marker}</g></g>
</svg>`;

  await sharp(Buffer.from(svg)).png().toFile(fileURLToPath(new URL(png + '.png', PNG_DIR)));
  console.log(png + '.png', size * SCALE + 'px');
}
