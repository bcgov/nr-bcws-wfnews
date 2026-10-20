import { setDisplayColor } from '@app/utils';

/**
 * Shared drawing for the small read-only maps that used to build their own
 * Leaflet map. Everything here goes through SMK's showFeature, so it works on
 * whichever viewer the map config asks for.
 */

/**
 * getPolygonBond answers `[[minLat, minLon], [maxLat, maxLon]]`, the Leaflet
 * order. An SMK extent is `[west, south, east, north]` — longitude first.
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

/**
 * The nearby incidents every full-details panel draws: a fire of note as its
 * icon, everything else as a dot coloured by stage of control.
 */
export function drawNearbyIncidents(smk: any, incidents: any[]): void {
  const list = incidents || [];

  smk.showFeature(
    'nearby-incidents',
    collection(list.filter((i) => !i.fireOfNoteInd).map(point)),
    { htmlMarker: (f: any) => dot(setDisplayColor(f.properties.stage)) },
  );

  // Drawn second so a fire of note sits above the dots, as the add order did.
  smk.showFeature(
    'nearby-fires-of-note',
    collection(list.filter((i) => i.fireOfNoteInd).map(point)),
    { htmlMarker: () => image('/assets/images/local_fire_department.png', 35) },
  );
}

/** A MapLibre marker takes a DOM element; these replace Leaflet's icons. */
export function dot(fillColour: string, radius = 5): HTMLElement {
  const el = document.createElement('div');
  el.style.width = radius * 2 + 'px';
  el.style.height = radius * 2 + 'px';
  el.style.borderRadius = '50%';
  el.style.backgroundColor = fillColour;
  el.style.border = '1px solid black';
  el.style.boxSizing = 'border-box';
  el.style.pointerEvents = 'none';
  return el;
}

export function image(src: string, size: number): HTMLElement {
  const img = document.createElement('img');
  img.alt = '';
  img.src = src;
  img.width = size;
  img.height = size;
  img.style.pointerEvents = 'none';
  return img;
}
