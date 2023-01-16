import { HttpClient, HttpHeaders } from '@angular/common/http'
import { AppConfigService } from '@wf1/core-ui'
import { Injectable } from '@angular/core'
import { Observable } from 'rxjs'

export type AgolOptions = {
  returnCentroid?: boolean,
  returnGeometry?: boolean,
  returnExtent?: boolean
};

@Injectable({
  providedIn: 'root',
})
export class AGOLService {
  constructor (private appConfigService: AppConfigService, protected http: HttpClient) { /* empty */ }

  getFirePerimetre (fireNumber: string, options: AgolOptions = null) {
    let url = this.appConfigService.getConfig().externalAppConfig['AGOLperimetres'].toString()
    if (!url.endsWith('/')) {
      url += '/'
    }
    // append query. Only search for Fire events
    url += `query?where=FIRE_NUMBER='${fireNumber}'&geometryType=esriGeometryEnvelope&inSR=4326&spatialRel=esriSpatialRelIntersects&units=esriSRUnit_Meter&outFields=*&returnGeometry=${options && options.returnGeometry ? true : false}&returnCentroid=${options && options.returnCentroid ? true : false}&returnExtentOnly=${options && options.returnExtent ? true : false}&featureEncoding=esriDefault&outSR=4326&defaultSR=4326&returnIdsOnly=false&returnQueryGeometry=false&cacheHint=false&returnExceededLimitFeatures=true&sqlFormat=none&f=pjson&token=`

    let headers = new HttpHeaders();
    headers.append('Access-Control-Allow-Origin','*');
    headers.append('Accept','*/*');
    return this.http.get<any>(encodeURI(url), {headers})
  }

  getEvacOrdersByEventNumber (eventNumber: string, options: AgolOptions = null): Observable<any> {
    let url = this.appConfigService.getConfig().externalAppConfig['AGOLevacOrders'].toString()
    if (!url.endsWith('/')) {
      url += '/'
    }
    // append query. Only search for Fire events
    url += `query?where=EVENT_NUMBER='${eventNumber}'&geometryType=esriGeometryEnvelope&inSR=4326&spatialRel=esriSpatialRelIntersects&units=esriSRUnit_Meter&outFields=*&returnGeometry=${options && options.returnGeometry ? true : false}&returnCentroid=${options && options.returnCentroid ? true : false}&returnExtentOnly=${options && options.returnExtent ? true : false}&featureEncoding=esriDefault&outSR=4326&defaultSR=4326&returnIdsOnly=false&returnQueryGeometry=false&cacheHint=false&returnExceededLimitFeatures=true&sqlFormat=none&f=pjson&token=`

    let headers = new HttpHeaders();
    headers.append('Access-Control-Allow-Origin','*');
    headers.append('Accept','*/*');
    return this.http.get<any>(encodeURI(url), {headers})
  }

  getEvacOrders (location: { x: number, y: number} | null = null, options: AgolOptions = null): Observable<any> {
    let url = this.appConfigService.getConfig().externalAppConfig['AGOLevacOrders'].toString()
    if (!url.endsWith('/')) {
      url += '/'
    }
    // append query. Only search for Fire events
    url += `query?where=EVENT_TYPE='fire'&geometryType=esriGeometryEnvelope&inSR=4326&spatialRel=esriSpatialRelIntersects&units=esriSRUnit_Meter&outFields=*&returnGeometry=${options && options.returnGeometry ? true : false}&returnCentroid=${options && options.returnCentroid ? true : false}&returnExtentOnly=${options && options.returnExtent ? true : false}&featureEncoding=esriDefault&outSR=4326&defaultSR=4326&returnIdsOnly=false&returnQueryGeometry=false&cacheHint=false&returnExceededLimitFeatures=true&sqlFormat=none&f=pjson&token=`

    if (location) {
      // Get the incident geometry, buffer the points by x metres
      // right now, just moving by 2 points of lat/long
      url += `&geometry=${location.x - 1},${location.y - 1},${location.x + 1},${location.y + 1}`
    }

    let headers = new HttpHeaders();
    headers.append('Access-Control-Allow-Origin','*');
    headers.append('Accept','*/*');
    return this.http.get<any>(encodeURI(url), {headers})
  }

  getAreaRestrictionsByID (sysId: string, options: AgolOptions = null): Observable<any> {
    let url = this.appConfigService.getConfig().externalAppConfig['AGOLareaRestrictions'].toString();
    if (!url.endsWith('/')) {
      url += '/'
    }
    // append query
    url += `query?where=PROT_RA_SYSID=${sysId}&geometryType=esriGeometryEnvelope&inSR=4326&spatialRel=esriSpatialRelIntersects&units=esriSRUnit_Meter&outFields=*&returnGeometry=${options && options.returnGeometry ? true : false}&returnCentroid=${options && options.returnCentroid ? true : false}&returnExtentOnly=${options && options.returnExtent ? true : false}&featureEncoding=esriDefault&outSR=4326&defaultSR=4326&returnIdsOnly=false&returnQueryGeometry=false&cacheHint=false&returnExceededLimitFeatures=true&sqlFormat=none&f=pjson&token=`

    let headers = new HttpHeaders();
    headers.append('Access-Control-Allow-Origin','*');
    headers.append('Accept','*/*');
    return this.http.get<any>(encodeURI(url),{headers})
  }

  getAreaRestrictions (location: { x: number, y: number} | null = null, options: AgolOptions = null): Observable<any> {
    let url = this.appConfigService.getConfig().externalAppConfig['AGOLareaRestrictions'].toString();

    if (!url.endsWith('/')) {
      url += '/'
    }

    // append query
    url += `query?where=1=1&geometryType=esriGeometryEnvelope&inSR=4326&spatialRel=esriSpatialRelIntersects&units=esriSRUnit_Meter&outFields=*&returnGeometry=${options && options.returnGeometry ? true : false}&returnCentroid=${options && options.returnCentroid ? true : false}&returnExtentOnly=${options && options.returnExtent ? true : false}&featureEncoding=esriDefault&outSR=4326&defaultSR=4326&returnIdsOnly=false&returnQueryGeometry=false&cacheHint=false&returnExceededLimitFeatures=true&sqlFormat=none&f=pjson&token=`

    if (location) {
      // Get the incident geometry, buffer the points by x metres
      // right now, just moving by 2 points of lat/long
      url += `&geometry=${location.x - 1},${location.y - 1},${location.x + 1},${location.y + 1}`
    }

    let headers = new HttpHeaders();
    headers.append('Access-Control-Allow-Origin','*');
    headers.append('Accept','*/*');
    return this.http.get<any>(encodeURI(url),{headers})
  }

  getBansAndProhibitionsById (sysId: string, options: AgolOptions = null): Observable<any> {
    let url = this.appConfigService.getConfig().externalAppConfig['AGOLBansAndProhibitions'].toString();

    if (!url.endsWith('/')) {
      url += '/'
    }

    // append query
    url += `query?where=PROT_BAP_SYSID=${sysId}&geometryType=esriGeometryEnvelope&inSR=4326&spatialRel=esriSpatialRelIntersects&units=esriSRUnit_Meter&outFields=*&returnGeometry=${options && options.returnGeometry ? true : false}&returnCentroid=${options && options.returnCentroid ? true : false}&returnExtentOnly=${options && options.returnExtent ? true : false}&featureEncoding=esriDefault&outSR=4326&defaultSR=4326&returnIdsOnly=false&returnQueryGeometry=false&cacheHint=false&returnExceededLimitFeatures=true&sqlFormat=none&f=pjson&token=`

    let headers = new HttpHeaders();
    headers.append('Access-Control-Allow-Origin','*');
    headers.append('Accept','*/*');
    return this.http.get<any>(encodeURI(url),{headers})
  }

  getBansAndProhibitions (location: { x: number, y: number} | null = null, options: AgolOptions = null): Observable<any> {
    let url = this.appConfigService.getConfig().externalAppConfig['AGOLBansAndProhibitions'].toString();

    if (!url.endsWith('/')) {
      url += '/'
    }

    // append query
    url += `query?where=1=1&geometryType=esriGeometryEnvelope&inSR=4326&spatialRel=esriSpatialRelIntersects&units=esriSRUnit_Meter&outFields=*&returnGeometry=${options && options.returnGeometry ? true : false}&returnCentroid=${options && options.returnCentroid ? true : false}&returnExtentOnly=${options && options.returnExtent ? true : false}&featureEncoding=esriDefault&outSR=4326&defaultSR=4326&returnIdsOnly=false&returnQueryGeometry=false&cacheHint=false&returnExceededLimitFeatures=true&sqlFormat=none&f=pjson&token=`

    if (location) {
      // Get the incident geometry, buffer the points by x metres
      // right now, just moving by 2 points of lat/long
      url += `&geometry=${location.x - 1},${location.y - 1},${location.x + 1},${location.y + 1}`
    }

    let headers = new HttpHeaders();
    headers.append('Access-Control-Allow-Origin','*');
    headers.append('Accept','*/*');
    return this.http.get<any>(encodeURI(url),{headers})
  }

  getAreaRestrictionsWfs () {
    const url = 'https://openmaps.gov.bc.ca/geo/pub/WHSE_LAND_AND_NATURAL_RESOURCE.PROT_RESTRICTED_AREAS_SP/ows?service=wfs&version=1.1.0&request=GetFeature&typename=WHSE_LAND_AND_NATURAL_RESOURCE.PROT_RESTRICTED_AREAS_SP&outputFormat=application/json&SRSName=urn:x-ogc:def:crs:EPSG:4326'
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

  getActiveFiresNoGeom (): Observable<any> {
    let url = this.appConfigService.getConfig().externalAppConfig['AGOLactiveFirest'].toString();
    url += `/query?f=json&where=FIRE_STATUS <> 'Out'&returnGeometry=false&spatialRel=esriSpatialRelIntersects&outFields=*`
    return this.http.get<any>(encodeURI(url));
  }

  getOutFiresNoGeom (): Observable<any> {
    let url = this.appConfigService.getConfig().externalAppConfig['AGOLactiveFirest'].toString();
    url += `/query?f=json&where=FIRE_STATUS = 'Out'&returnGeometry=false&spatialRel=esriSpatialRelIntersects&outFields=*`
    return this.http.get<any>(encodeURI(url));
  }

  getCurrentYearFireLastXDaysStats(lastXDays: number): Observable<any> {
    let startdate = new Date();
    const enddate = new Date();
    startdate.setDate(startdate.getDate() - lastXDays);
    const sStartdate = `${startdate.getFullYear()}-${startdate.getMonth() + 1}-${startdate.getDate()} ${startdate.getHours() < 10 ? '0' : ''}${startdate.getHours()}:${startdate.getMinutes() < 10 ? '0' : ''}${startdate.getMinutes()}:${startdate.getSeconds() < 10 ? '0' : ''}${startdate.getSeconds()}`
    const sEnddate = `${enddate.getFullYear()}-${enddate.getMonth() + 1}-${enddate.getDate()} ${enddate.getHours() < 10 ? '0' : ''}${enddate.getHours()}:${enddate.getMinutes() < 10 ? '0' : ''}${enddate.getMinutes()}:${enddate.getSeconds() < 10 ? '0' : ''}${enddate.getSeconds()}`

    let url = `${this.appConfigService.getConfig().externalAppConfig['AGOLactiveFirest']}/query?f=json&` +
        `where=IGNITION_DATE<=timestamp '${sEnddate}' AND IGNITION_DATE>=timestamp '${sStartdate}'` +
        `&returnGeometry=false&spatialRel=esriSpatialRelIntersects&outFields=*` +
        `&outStatistics=[{\"statisticType\":\"count\",\"onStatisticField\":\"OBJECTID\",\"outStatisticFieldName\":\"value\"}]`;
    url = encodeURI(url);
    return this.http.get<any>(url);
  }

  getCurrentYearFireStats(): Observable<any> {
    let url = `${this.appConfigService.getConfig().externalAppConfig['AGOLactiveFirest']}/query?f=json&where=1=1&returnGeometry=false&spatialRel=esriSpatialRelIntersects&
    outFields=*&outStatistics=[{\"statisticType\":\"count\",\"onStatisticField\":\"OBJECTID\",\"outStatisticFieldName\":\"value\"}]`;
    url = encodeURI(url);
    return this.http.get<any>(url);
}
}
