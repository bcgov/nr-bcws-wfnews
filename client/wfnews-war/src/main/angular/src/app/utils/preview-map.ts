import { getStageOfControlIconPath } from '@app/utils';
import * as turf from '@turf/turf';

/**
 * Shared drawing for the small read-only maps. Everything here goes through
 * SMK's showFeature, so it works on whichever viewer the map config asks for.
 */

/**
 * getPolygonBond answers `[[minLat, minLon], [maxLat, maxLon]]`, latitude
 * first. An SMK extent is `[west, south, east, north]` — longitude first.
 */
export function boundsToExtent(bounds: number[][]): number[] | undefined {
  if (!bounds || bounds.length < 2) {
    return undefined;
  }
  const [[minLat, minLon], [maxLat, maxLon]] = bounds;
  if (![minLat, minLon, maxLat, maxLon].every(Number.isFinite)) {
    return undefined;
  }
  return [minLon, minLat, maxLon, maxLat];
}

const point = (item: any) => ({
  type: 'Feature',
  properties: { stage: item.stageOfControlCode },
  geometry: {
    type: 'Point',
    coordinates: [Number(item.longitude), Number(item.latitude)],
  },
});

const collection = (features: any[]) => ({
  type: 'FeatureCollection',
  features,
});

/**
 * AGOL rings and extractPolygonData both give `[longitude, latitude]`, which is
 * already the GeoJSON order. The box of a convex hull equals the box of the
 * points it was built from, so no hull is needed here.
 */
export function coordsToExtent(coords: number[][]): number[] | undefined {
  if (!coords?.length) {
    return undefined;
  }
  const extent = coords.reduce(
    (acc, [lon, lat]) => [
      Math.min(acc[0], lon),
      Math.min(acc[1], lat),
      Math.max(acc[2], lon),
      Math.max(acc[3], lat),
    ],
    [Infinity, Infinity, -Infinity, -Infinity],
  );
  return extent.every(Number.isFinite) ? extent : undefined;
}

/** The rings of a GeoJSON Polygon or MultiPolygon. */
export function polygonRings(geometry: any): number[][][] | undefined {
  if (geometry?.type === 'Polygon') {
    return geometry.coordinates;
  }
  if (geometry?.type === 'MultiPolygon') {
    return geometry.coordinates.flat();
  }
  return undefined;
}

/** The box of every ring of an AGOL polygon. */
export function ringsToExtent(rings: number[][][] | undefined): number[] | undefined {
  return coordsToExtent(rings?.flat());
}

/** An extent as a query param value, so View on Map can carry it to the map. */
export function extentToParam(extent: number[] | undefined): string | undefined {
  return extent?.length === 4 ? extent.join(',') : undefined;
}

/** Answers undefined for anything that is not a real [west, south, east, north] box. */
export function paramToExtent(value: string | undefined): number[] | undefined {
  const extent = String(value ?? '').split(',').map(Number);
  if (extent.length !== 4 || !extent.every(Number.isFinite)) {
    return undefined;
  }
  const [west, south, east, north] = extent;
  return west <= east && south <= north ? extent : undefined;
}

/** setView fits with no padding, so the area would touch the map edge and the controls. */
export function padExtent(extent: number[], ratio = 0.1): number[] {
  const [west, south, east, north] = extent;
  const dx = (east - west) * ratio;
  const dy = (north - south) * ratio;
  return [west - dx, south - dy, east + dx, north + dy];
}

/** setView takes the same extent on both viewers, so this asks no viewer type. */
export function zoomToCoords(smk: any, coords: number[][]): void {
  const extent = coordsToExtent(coords);
  if (extent) {
    smk?.$viewer?.setView({ extent });
  }
}

/**
 * The highlight the preview panels draw over a selected area. One acetate holds
 * every ring, so a later call replaces the last highlight, and a call with no
 * rings clears it.
 */
export function highlightArea(smk: any, rings?: number[][][]): void {
  if (!smk) {
    return;
  }
  if (!rings?.length) {
    smk.showFeature('area-highlight');
    return;
  }
  smk.showFeature(
    'area-highlight',
    collection(
      rings.map((coordinates) => ({
        type: 'Feature',
        properties: {},
        geometry: { type: 'Polygon', coordinates: [coordinates] },
      })),
    ),
    {
      paint: {
        'fill-color': 'white',
        'fill-opacity': 0.3,
        'fill-outline-color': 'black',
      },
    },
  );
}

const GLOW_PULSES = 3;
// 1.2 s a pulse, the same pace as the wildfire marker ping.
const GLOW_MS = 3600;
const GLOW_OPACITY = 0.8;
// Removes zigzags too small to see, but keeps survey corners within a pixel of the edge.
const GLOW_SIMPLIFY_PX = 1.5;
const GLOW_COLOR = '#3388ff';
// SMK names a polygon acetate's layers after it. A host highlight outline stays on top of the glow.
const GLOW_LAYER = 'smk-acetate-zoom-flash';
const HIGHLIGHT_OUTLINE = 'smk-acetate-area-highlight-outline';
// Three rings of the marker-ping SCSS animation.
const PING_MS = 3600;
let attentionTimer: ReturnType<typeof setTimeout>;
let attentionCount = 0;

// The effect plays where the user sees it, after a zoom lands. A newer one replaces it.
function whenStill(smk: any, play: () => void) {
  clearTimeout(attentionTimer);
  smk.showFeature('zoom-ping');
  smk.showFeature('zoom-flash');
  const count = ++attentionCount;
  const playLatest = () => count === attentionCount && play();
  const map = smk.$viewer?.map;
  if (map?.isMoving?.()) {
    map.once('moveend', playLatest);
  } else {
    playLatest();
  }
}

/** Rings a place, like the selected wildfire, so a zoom that does not move still answers. */
export function pingPoint(smk: any, longitude: number, latitude: number): void {
  if (!smk) {
    return;
  }
  whenStill(smk, () => {
    smk.showFeature('zoom-ping', { type: 'Point', coordinates: [longitude, latitude] }, {
      htmlMarker: () => {
        const el = document.createElement('div');
        el.className = 'zoom-ping marker-ping';
        el.style.pointerEvents = 'none';
        return el;
      },
    });
    attentionTimer = setTimeout(() => smk.showFeature('zoom-ping'), PING_MS);
  });
}

// A wide glow on every small corner of a detailed edge looks jagged.
function simplifyRing(ring: number[][], zoom: number | undefined): number[][] {
  if (zoom === undefined || ring.length < 4) {
    return ring;
  }
  // Degrees across one screen pixel, for MapLibre's 512 px tiles.
  const pixel = 360 / (512 * 2 ** zoom);
  try {
    return turf.simplify(turf.polygon([ring]), { tolerance: GLOW_SIMPLIFY_PX * pixel }).geometry.coordinates[0];
  } catch {
    return ring;
  }
}

/** Glows round an area three times. The area itself does not change colour. */
export function flashArea(smk: any, rings?: number[][][]): void {
  if (!smk || !rings?.length) {
    return;
  }
  // With reduced motion, the glow shows steady and does not pulse.
  const reducedMotion = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
  whenStill(smk, () => {
    const count = attentionCount;
    const zoom = smk.$viewer?.map?.getZoom?.();
    const area = collection(
      rings.map((ring) => ({
        type: 'Feature',
        properties: {},
        geometry: { type: 'Polygon', coordinates: [simplifyRing(ring, zoom)] },
      })),
    );
    smk.showFeature('zoom-flash', area, {
      paint: { 'fill-opacity': 0, 'line-color': GLOW_COLOR, 'line-opacity': 0 },
    });
    const map = smk.$viewer?.map;
    const glow = GLOW_LAYER + '-outline';
    if (!map?.getLayer?.(glow)) {
      attentionTimer = setTimeout(() => smk.showFeature('zoom-flash'), GLOW_MS);
      return;
    }
    // SMK sets paint only when it makes the layer, so set it on every play.
    map.setPaintProperty(GLOW_LAYER, 'fill-opacity', 0);
    map.setPaintProperty(glow, 'line-color', GLOW_COLOR);
    map.setPaintProperty(glow, 'line-width', 14);
    map.setPaintProperty(glow, 'line-blur', 10);
    if (map.getLayer(HIGHLIGHT_OUTLINE)) {
      map.moveLayer(GLOW_LAYER, HIGHLIGHT_OUTLINE);
      map.moveLayer(glow, HIGHLIGHT_OUTLINE);
    }
    const start = performance.now();
    const frame = (now: number) => {
      if (count !== attentionCount) {
        return;
      }
      const t = Math.min(1, (now - start) / GLOW_MS);
      if (t >= 1) {
        smk.showFeature('zoom-flash');
        return;
      }
      const pulse = reducedMotion ? 1 : Math.sin(Math.PI * GLOW_PULSES * t) ** 2;
      map.setPaintProperty(glow, 'line-opacity', GLOW_OPACITY * pulse);
      requestAnimationFrame(frame);
    };
    requestAnimationFrame(frame);
  });
}

/**
 * The nearby incidents every full-details panel draws: a fire of note as its
 * icon, everything else as a dot coloured by stage of control.
 */
export function drawNearbyIncidents(smk: any, incidents: any[]): void {
  const list = incidents || [];

  smk.showFeature(
    'nearby-incidents',
    collection(list.filter((i) => !i.fireOfNoteInd).map(point)),
    { htmlMarker: (f: any) => stageDot(f.properties.stage) },
  );

  // Drawn second so a fire of note sits above the dots.
  smk.showFeature(
    'nearby-fires-of-note',
    collection(list.filter((i) => i.fireOfNoteInd).map(point)),
    { htmlMarker: () => fireOfNote(35) },
  );
}

/**
 * A MapLibre marker takes a DOM element. These use the Legend SVGs, the same
 * files the main map markers are made from, so every map shows one design.
 */
export function stageDot(stageCode: string, size = 14): HTMLElement {
  return markerImage(stageCode ? getStageOfControlIconPath(stageCode) : '', size);
}

export function fireOfNote(size: number): HTMLElement {
  return markerImage('/assets/images/svg-icons/wildfire-of-note.svg', size);
}

function markerImage(src: string, size: number): HTMLElement {
  const img = document.createElement('img');
  img.alt = '';
  img.src = src;
  img.width = img.height = size;
  // No shadow here: _stage-icon.scss gives every marker img the same one.
  img.style.pointerEvents = 'none';
  return img;
}
