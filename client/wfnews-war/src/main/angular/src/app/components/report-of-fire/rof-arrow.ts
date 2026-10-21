import { LonLat } from '@app/services/wfnews-map.service/util';
import * as turf from '@turf/turf';

/**
 * The yellow arrow from the device to the fire. The location page draws it live
 * as the user pans; the review page draws it once.
 */

/** The DOM element a MapLibre marker draws. */
export function markerElement(className: string, html = ''): HTMLElement {
  const el = document.createElement('div');
  el.className = className;
  el.innerHTML = html;
  // The map must stay draggable through the marker.
  el.style.pointerEvents = 'none';
  return el;
}

export function formatDist(dist: number): string {
  if (dist == null) {
    return '';
  }

  const rounded = parseFloat(dist.toPrecision(6));
  const a = Math.abs(rounded);
  const s = Math.sign(rounded);
  const i = Math.floor(a);
  const f = a - i;

  return (s * i).toLocaleString() + f.toFixed(3).substr(1);
}

/** The ReportOfFire model holds [latitude, longitude]; GeoJSON is the other way. */
export function toLonLat(latLon: number[]): LonLat {
  return [Number(latLon[1]), Number(latLon[0])];
}

/** Draws start -> end and answers the length in km. */
export function drawArrow(smk: any, start: LonLat, end: LonLat): number {
  const view = smk.$viewer.getView();
  const lineStartOffsetPx = 15;
  const lineEndOffsetPx = 35;

  const arrowLine = turf.lineString([start, end]);
  const arrowLen = turf.length(arrowLine);

  const startOffset = (view.metersPerPixel * lineStartOffsetPx) / 1000;
  const endOffset = (view.metersPerPixel * lineEndOffsetPx) / 1000;

  const headPt = turf.along(turf.lineString([end, start]), endOffset);
  const headRot = turf.bearing(headPt.geometry.coordinates, end);
  smk.showFeature('arrow-head', headPt, {
    htmlMarker: () =>
      markerElement(
        'rof-arrow-head',
        `<i class="material-icons" style="transform:rotateZ(${headRot}deg);">navigation</i>`,
      ),
  });

  const startPt = turf.along(
    turf.lineString([start, headPt.geometry.coordinates]),
    startOffset,
  ).geometry.coordinates;
  const line = turf.lineString([startPt, headPt.geometry.coordinates]);

  smk.showFeature('arrow-line', line, {
    paint: { 'line-color': 'yellow', 'line-width': 5 },
  });

  smk.showFeature('arrow-line-shadow', line, {
    paint: { 'line-color': 'rgba(0,0,0,36%)', 'line-width': 7 },
  });

  // MapLibre has no bindTooltip, so the distance rides on its own marker.
  smk.showFeature('arrow-label', turf.along(line, turf.length(line) / 2), {
    htmlMarker: () =>
      markerElement('rof-arrow-label', formatDist(arrowLen) + ' km'),
  });

  return arrowLen;
}
