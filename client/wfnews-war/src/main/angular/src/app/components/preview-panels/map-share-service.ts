import { Injectable } from '@angular/core';
import * as L from 'leaflet';
import { CommonUtilityService } from '@app/services/common-utility.service';
import { getActiveMap } from '@app/utils';

@Injectable({
  providedIn: 'root',
})
export class MapUtilityService {
  highlightPolygons: L.Polygon[] = [];
  viewer = getActiveMap().$viewer;
  constructor(private commonUtilityService: CommonUtilityService) { }

  fixPolygonToMap(polygonData: number[][], response?: any[]) {
  
    const convex = this.commonUtilityService.createConvex(polygonData);
    this.fitBounds(convex)
    
    for (const polygon of this.highlightPolygons) {
      this.viewer.map.removeLayer(polygon);
    }

    if (response) {
      this.highlightPolygon(response)
    }

  }

  fixMultipolygonToMap(multiPolygonData: number[][], response: any[]) {
    
    let convexMulti: any[][] = [];
    let convexArr: any[] = [];
    
    for (const polygon of this.highlightPolygons) {
      this.viewer.map.removeLayer(polygon);
    }

    if (response) {
      for (const coord of response as any[])
        this.highlightPolygon(coord)
    }

    // retrieve convex from each ploygon 
    for(const polygon of multiPolygonData){
      for(const poly of polygon){
        convexMulti.push(this.commonUtilityService.createConvex(poly));
      }
    }

    // add all coordinates to single array to create bounds
    for(const arr of convexMulti as any[]){
      for(const array of arr as any[]){
        convexArr.push(array)
      }
    }

    this.fitBounds(convexArr)
  }

  highlightPolygon(response: any[]) {
    for (const ring of response) {
      const multiSwappedPolygonData: number[][] = ring.map(([latitude, longitude]) => [longitude, latitude]);
      const polygon = L.polygon(multiSwappedPolygonData, {
        weight: 3,
        color: 'black',
        fillColor: 'white',
        fillOpacity: 0.3
      }).addTo(this.viewer.map);
      this.highlightPolygons.push(polygon);
    }
  }

  fitBounds(coords) {
    const bounds = coords?.reduce((acc, coord) => [
      [Math.min(acc[0][0], coord[1]), Math.min(acc[0][1], coord[0])],
      [Math.max(acc[1][0], coord[1]), Math.max(acc[1][1], coord[0])]
    ], [[Infinity, Infinity], [-Infinity, -Infinity]]);
    this.viewer.map.fitBounds(bounds);
  }
}