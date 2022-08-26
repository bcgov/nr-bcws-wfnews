import { HttpClient, HttpHeaders } from '@angular/common/http'
import { AppConfigService } from '@wf1/core-ui'
import { Injectable } from '@angular/core'
import { Observable } from 'rxjs'

@Injectable({
  providedIn: 'root',
})
export class AGOLService {
  constructor (private appConfigService: AppConfigService, protected http: HttpClient) { /* empty */ }

  // Update to use a defined type, not any
  getEvacOrders (location: { x: number, y: number} | null = null): Observable<any> {
    let url = this.appConfigService.getConfig().externalAppConfig['AGOLevacOrders'].toString()
    // append query. Only search for Fire events
    url += "query?where=EVENT_TYPE='fire'&geometryType=esriGeometryEnvelope&inSR=4326&spatialRel=esriSpatialRelIntersects&units=esriSRUnit_Meter&outFields=*&returnGeometry=false&returnCentroid=false&featureEncoding=esriDefault&outSR=4326&defaultSR=4326&returnIdsOnly=false&returnQueryGeometry=false&cacheHint=false&returnExceededLimitFeatures=true&sqlFormat=none&f=pjson&token="

    if (location) {
      // Get the incident geometry, buffer the points by x metres
      // right now, just moving by 10 points of lat/long
      url += `&geometry=${location.x - 5},${location.y - 5},${location.x + 5},${location.y + 5}`
    }

    let headers = new HttpHeaders();
    headers.append('Access-Control-Allow-Origin','*');
    headers.append('Accept','*/*');
    return this.http.get<any>(encodeURI(url), {headers})
  }

  getAreaRestrictions (location: { x: number, y: number} | null = null): Observable<any> {
    let url = this.appConfigService.getConfig().externalAppConfig['AGOLareaRestrictions'].toString();

    // append query
    url += 'query?where=1=1&geometryType=esriGeometryEnvelope&inSR=4326&spatialRel=esriSpatialRelIntersects&units=esriSRUnit_Meter&outFields=*&returnGeometry=false&returnCentroid=false&featureEncoding=esriDefault&outSR=4326&defaultSR=4326&returnIdsOnly=false&returnQueryGeometry=false&cacheHint=false&returnExceededLimitFeatures=true&sqlFormat=none&f=pjson&token='

    if (location) {
      // Get the incident geometry, buffer the points by x metres
      // right now, just moving by 10 points of lat/long
      url += `&geometry=${location.x - 5},${location.y - 5},${location.x + 5},${location.y + 5}`
    }

    let headers = new HttpHeaders();
    headers.append('Access-Control-Allow-Origin','*');
    headers.append('Accept','*/*');
    return this.http.get<any>(encodeURI(url),{headers})
  }

  // Wont be needed when we point to our internal cache
  getActiveFireCount (): Observable<any> {
    let url = this.appConfigService.getConfig().externalAppConfig['AGOLactiveFirest'].toString();
    url += `/query?f=json&where=FIRE_STATUS <> 'Out'&returnGeometry=false&spatialRel=esriSpatialRelIntersects&outFields=*&outStatistics=[{\"statisticType\":\"count\",\"onStatisticField\":\"OBJECTID\",\"outStatisticFieldName\":\"value\"}]`
    return this.http.get<any>(encodeURI(url));
  }
}
