import { Injectable } from '@angular/core';
import * as L from 'leaflet';
import { CommonUtilityService } from '@app/services/common-utility.service';
import { getActiveMap } from '@app/utils';

@Injectable({
  providedIn: 'root',
})
export class MapUtilityService {
  highlightPolygons: L.Polygon[] = [];

  constructor(private commonUtilityService: CommonUtilityService) {}

  fixPolygonToMap(polygonData: number[][], response: any[]) {
    const viewer = getActiveMap().$viewer;
    const convex = this.commonUtilityService.createConvex(polygonData);
    const bounds = convex?.reduce((acc, coord) => [
      [Math.min(acc[0][0], coord[1]), Math.min(acc[0][1], coord[0])],
      [Math.max(acc[1][0], coord[1]), Math.max(acc[1][1], coord[0])]
    ], [[Infinity, Infinity], [-Infinity, -Infinity]]);
    viewer.map.fitBounds(bounds);

    for (const polygon of this.highlightPolygons) {
      viewer.map.removeLayer(polygon);
    }

    for (const ring of response) {
      const multiSwappedPolygonData: number[][] = ring.map(([latitude, longitude]) => [longitude, latitude]);
      const polygon = L.polygon(multiSwappedPolygonData, {
        weight: 3,
        color: 'black',
        fillColor: 'white',
        fillOpacity: 0.3
      }).addTo(viewer.map);
      this.highlightPolygons.push(polygon);
    }
  }
}