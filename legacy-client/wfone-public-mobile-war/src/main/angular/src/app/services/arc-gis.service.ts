import {Injectable} from "@angular/core";
import {HttpClient, HttpHeaders} from "@angular/common/http";
import {Observable} from "rxjs";
import {Location} from "@angular/common";
import * as moment from "moment";
import {FireStatsRsrc} from "../conversion/resources";
import {AppConfigService} from "./app-config.service";
import {APP_CONFIG_KEYS} from "../utils";

@Injectable({
  providedIn: 'root',
})
export class ArcGisService {

    arcGisBaseUrl: string;
    activeFiresResourcePartialUrl: string;
    activeFireResourceBaseUrl: string;
    bansAndProhibitionsPartialUrl: string;
    bansAndProhibitionsBaseUrl: string;
    banAndProhibitionsRssFeedUrl: string;

    constructor(private http: HttpClient, private location: Location, private appConfigService: AppConfigService) {
        this.arcGisBaseUrl = this.appConfigService.getAppResourcesConfig().arcGisBaseUrl
        this.activeFiresResourcePartialUrl = '/BCWS_ActiveFires_PublicView/FeatureServer/0';
        this.activeFireResourceBaseUrl = this.arcGisBaseUrl + this.activeFiresResourcePartialUrl;
        this.bansAndProhibitionsPartialUrl = '/British_Columbia_Bans_and_Prohibition_Areas/FeatureServer/0';
        this.bansAndProhibitionsBaseUrl = this.arcGisBaseUrl + this.bansAndProhibitionsPartialUrl;
        this.banAndProhibitionsRssFeedUrl = this.appConfigService.getAppResourcesConfig().bansProhibitionsRssLocation
    }

    // Active Fires Stats

    getActiveFireStats(): Observable<FireStatsRsrc> {
        // console.log("getActiveFireStats - 1");
        let url = `${this.activeFireResourceBaseUrl}/query?f=json&where=FIRE_STATUS <> 'Out'&returnGeometry=false&` +
            `spatialRel=esriSpatialRelIntersects&outFields=*&` +
            `outStatistics=[{\"statisticType\":\"count\",\"onStatisticField\":\"OBJECTID\",\"outStatisticFieldName\":\"value\"}]`;
        url = encodeURI(url);
        // console.log("getActiveFireStats - 2: " + url);
        return this.http.get<any>(url);
    }

    getActiveFireLastXDaysStats(lastXDays: number): Observable<FireStatsRsrc> {
        // console.log("getActiveFireLastXDaysStats - 1: " + lastXDays);

        let startdate = moment();
        const enddate = moment();
        startdate = startdate.subtract(lastXDays, 'days');
        const sStartdate = startdate.format('YYYY-MM-DD HH:mm:ss');
        // console.log("sStartDate: " + sStartdate);
        const sEnddate = enddate.format('YYYY-MM-DD HH:mm:ss');
        // console.log("sEnddate: " + sEnddate);

        let url = `${this.activeFireResourceBaseUrl}/query?f=json&` +
            `where=(FIRE_STATUS <> 'Out') AND (IGNITION_DATE<=timestamp '${sEnddate}'` +
            `AND IGNITION_DATE>=timestamp '${sStartdate}')&returnGeometry=false&spatialRel=esriSpatialRelIntersects&` +
            `outFields=*&` +
            `outStatistics=[{\"statisticType\":\"count\",\"onStatisticField\":\"OBJECTID\",\"outStatisticFieldName\":\"value\"}]`;
        url = encodeURI(url);
        // console.log("getActiveFireLastXDaysStats encodeUrl: " + url);
        return this.http.get<any>(url);
    }

    getActiveFiresByFireCentresStats(): Observable<FireStatsRsrc> {
        // console.log('getActiveFiresByFireCentreStats - 1');
        let url = `${this.activeFireResourceBaseUrl}/query?f=json&` +
                    `where=FIRE_STATUS <> 'Out'&returnGeometry=false&spatialRel=esriSpatialRelIntersects&` +
                    `outFields=*&groupByFieldsForStatistics=FIRE_CENTRE&orderByFields=FIRE_CENTRE asc&` +
                    `outStatistics=[{"statisticType":"count","onStatisticField":"OBJECTID","outStatisticFieldName":"value"}]`;
        url = encodeURI(url);
        // console.log('getActiveFiresByFireCentreStats - 2: ' + url);
        return this.http.get<any>(url);
    }


    getActiveFiresBySuspectedCausesStats(): Observable<FireStatsRsrc> {
        // console.log('getActiveFiresBySuspectedCauses - 1');
        let url = `${this.activeFireResourceBaseUrl}/query?f=json&where=FIRE_STATUS <> 'Out'&returnGeometry=false&` +
                `spatialRel=esriSpatialRelIntersects&outFields=*&groupByFieldsForStatistics=FIRE_CAUSE&orderByFields=FIRE_CAUSE asc&` +
                `outStatistics=[{"statisticType":"count","onStatisticField":"OBJECTID","outStatisticFieldName":"value"}]`;
        url = encodeURI(url);
        // console.log('getActiveFiresBySuspectedCauses - 2: ' + url);
        return this.http.get<any>(url);
    }

    getActiveFiresByStageOfControlStats(): Observable<FireStatsRsrc> {
        // console.log('getActiveFiresByStageOfControlStats - 1');
        let url = `${this.activeFireResourceBaseUrl}/query?f=json&where=FIRE_STATUS <> 'Out'&returnGeometry=false&` +
            `spatialRel=esriSpatialRelIntersects&outFields=*&groupByFieldsForStatistics=FIRE_STATUS&orderByFields=FIRE_STATUS asc&` +
            `outStatistics=[{"statisticType":"count","onStatisticField":"OBJECTID","outStatisticFieldName":"value"}]`;
        url = encodeURI(url);
        // console.log('getActiveFiresByStageOfControlStats - 2: ' + url);
        return this.http.get<any>(url);
    }

    // Current Year Stats

    getCurrentYearFireStats(): Observable<FireStatsRsrc> {
        // console.log("getCurrentYearFireStats - 1");
        let url = `${this.activeFireResourceBaseUrl}/query?f=json&where=1=1&returnGeometry=false&spatialRel=esriSpatialRelIntersects&
        outFields=*&outStatistics=[{\"statisticType\":\"count\",\"onStatisticField\":\"OBJECTID\",\"outStatisticFieldName\":\"value\"}]`;
        url = encodeURI(url);
        // console.log("getCurrentYearFireStats - 2: " + url);
        return this.http.get<any>(url);
    }

    getCurrentYearFireLastXDaysStats(lastXDays: number): Observable<FireStatsRsrc> {
        // console.log("getCurrentYearFireLastXDaysStats - 1");

        let startdate = moment();
        const enddate = moment();
        startdate = startdate.subtract(lastXDays, 'days');
        const sStartdate = startdate.format('YYYY-MM-DD HH:mm:ss');
        // console.log("sStartDate: " + sStartdate);
        const sEnddate = enddate.format('YYYY-MM-DD HH:mm:ss');
        // console.log("sEnddate: " + sEnddate);

        let url = `${this.activeFireResourceBaseUrl}/query?f=json&` +
            `where=IGNITION_DATE<=timestamp '${sEnddate}' AND IGNITION_DATE>=timestamp '${sStartdate}'` +
            `&returnGeometry=false&spatialRel=esriSpatialRelIntersects&outFields=*` +
            `&outStatistics=[{\"statisticType\":\"count\",\"onStatisticField\":\"OBJECTID\",\"outStatisticFieldName\":\"value\"}]`;
        url = encodeURI(url);
        // console.log("getCurrentYearFireLastXDaysStats - 2: " + url);
        return this.http.get<any>(url);
    }

    getCurrentYearFiresByFireCentresStats(): Observable<FireStatsRsrc> {
        // console.log("getCurrentYearFiresByFireCentreStats - 1");
        let url = `${this.activeFireResourceBaseUrl}/query?f=json&where=1=1&returnGeometry=false&spatialRel=esriSpatialRelIntersects&` +
            `outFields=*&groupByFieldsForStatistics=FIRE_CENTRE&orderByFields=FIRE_CENTRE asc&` +
            `outStatistics=[{"statisticType":"count","onStatisticField":"OBJECTID","outStatisticFieldName":"value"}]`;
        url = encodeURI(url);
        // console.log("getCurrentYearFiresByFireCentreStats - 2: " + url);
        return this.http.get<any>(url);
    }

    getCurrentYearFiresBySuspectedCausesStats(): Observable<FireStatsRsrc> {
        // console.log("getCurrentYearFireStats - 1");
        let url = `${this.activeFireResourceBaseUrl}/query?f=json&where=1=1&returnGeometry=false&` +
                    `spatialRel=esriSpatialRelIntersects&outFields=*&` +
                    `groupByFieldsForStatistics=FIRE_CAUSE&orderByFields=FIRE_CAUSE asc&` +
                    `outStatistics=[{"statisticType":"count","onStatisticField":"OBJECTID","outStatisticFieldName":"value"}]`;
        url = encodeURI(url);
        // console.log("getCurrentYearFireStats - 2: " + url);
        return this.http.get<any>(url);
    }

    getCurrentYearFiresByStageOfControlStats(): Observable<FireStatsRsrc> {
        // console.log("getCurrentYearFiresByStageOfControlStats - 1");
        let url = `${this.activeFireResourceBaseUrl}/query?f=json&where=1=1&returnGeometry=false&spatialRel=esriSpatialRelIntersects&` +
            `outFields=*&groupByFieldsForStatistics=FIRE_STATUS&orderByFields=FIRE_STATUS asc&` +
            `outStatistics=[{"statisticType":"count","onStatisticField":"OBJECTID","outStatisticFieldName":"value"}]`;
        url = encodeURI(url);
        // console.log("getCurrentYearFiresByStageOfControlStats - 2: " + url);
        return this.http.get<any>(url);
    }

    // Other
    getBansProhibitionsStats(): Observable<FireStatsRsrc> {
        // console.log('getBansProhibitionsStats - 1');
        let url = `${this.bansAndProhibitionsBaseUrl}/query?f=json&where=Status =  '1'&returnGeometry=false&` +
                    `spatialRel=esriSpatialRelIntersects&outFields=*&orderByFields=FireCentre asc&` +
                    `resultOffset=0&resultRecordCount=100`;
        url = encodeURI(url);
        // console.log('getBansProhibitionsStats - 2: ' + url);
        return this.http.get<any>(url);
    }


    getBanRSSFeed(): Observable<any> {
        console.log('getBanRSSFeed - 1');
        const url = encodeURI(this.banAndProhibitionsRssFeedUrl);
        console.log('getBanRSSFeed - 2: ' + url);
        const httpHeaders = new HttpHeaders()
            .set('Content-Type', 'text/xml')
            .set('Accept', 'text/xml');
        return this.http.get<any>(url,
            {
                        headers: httpHeaders,
                        responseType: 'text' as 'json'
                    });
    }

}
