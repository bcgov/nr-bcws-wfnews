import { Injectable } from '@angular/core';
import { getActiveMap } from '@app/utils';
import { highlightArea, zoomToCoords } from '@app/utils/preview-map';

/**
 * The zoom-in behaviour every preview panel shares. The map is asked for at each
 * call: this service is a singleton, so a field would freeze the viewer of the
 * first injection for the life of the app.
 */
@Injectable({
  providedIn: 'root',
})
export class MapUtilityService {
  fixPolygonToMap(polygonData: number[][], response?: number[][][]) {
    const smk = getActiveMap();
    zoomToCoords(smk, polygonData);
    highlightArea(smk, response);
  }

  fixMultipolygonToMap(multiPolygonData: number[][][][], response: number[][][][]) {
    const smk = getActiveMap();
    // Flatten the polygons to rings, then the rings to points, so the box holds
    // every part and the highlight draws every ring.
    zoomToCoords(smk, flatten(flatten(multiPolygonData)));
    highlightArea(smk, flatten(response));
  }
}

function flatten<T>(nested: T[][]): T[] {
  return [].concat(...(nested || []));
}
