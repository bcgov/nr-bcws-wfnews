import {Injectable} from "@angular/core";
import {HttpClient, HttpHeaders} from "@angular/common/http";
import {AppConfigService} from "../app-config.service";
import * as moment from "moment";
import {DATE_FORMATS} from "@wf1/core-ui";
import { NearMeBansAndProhibitionsComponent } from "../../components/near-me-bans-and-prohibitions/near-me-bans-and-prohibitions.component";
import { NearMeFireComponent } from "../../components/near-me-fire/near-me-fire.component";
import { NearMeAreaRestrictionsComponent } from "../../components/near-me-area-restrictions/near-me-area-restrictions.component";
import { NearMeEvacuationOrdersComponent } from "../../components/near-me-evacuation-orders/near-me-evacuation-orders.component";
import { ActiveFireFeature, AreaRestrictionFeature, BanAndProhibitionAreaFeature, BboxFeature, EvacuationOrderFeature, NearbyResult, NearMeHeader, NearMeItem, NearMeTemplate, WeatherStationConditions, WeatherStationResult } from "./interfaces";
import demoWeatherStations from "./weather-response";
import demoNearby from "./nearby-response";

export { NearMeTemplate, NearMeHeader, NearMeItem, WeatherHourlyCondition, WeatherDailyCondition, WeatherStation, WeatherStationConditions, WeatherStationResult } from './interfaces'

const MAX_CACHE_AGE = 60 * 1000 //ms

@Injectable({providedIn: 'root'})
export class PointIdService {
    baseAPIUrl
    wfssPointidApiKey
    cache = {}

    constructor(
        private http: HttpClient,
        private appConfigService: AppConfigService
    ) {
        this.baseAPIUrl = this.appConfigService.getConfig().applicationResources['wfss-pointid-api'];
        this.wfssPointidApiKey = this.appConfigService.getConfig().applicationResources['wfss-pointid-api-key'];
    }

    fetch( url: string ) {
        const self = this

        var now = ( new Date() ).getTime()

        if ( this.cache[ url ] && ( now - this.cache[ url ].ts ) < MAX_CACHE_AGE )
            return this.cache[ url ].result

        Object.keys( this.cache ).forEach( function ( url ) {
            if ( ( now - self.cache[ url ].ts ) < MAX_CACHE_AGE ) return

            console.log( 'expire', url )
            delete self.cache[ url ]
        } )

        this.cache[ url ] = {
            ts: now,
            result: this.http.get( url, {
                headers: new HttpHeaders( {
                    
                    'apikey' : this.wfssPointidApiKey,
                } ),
            } ).toPromise()
        }

        return this.cache[ url ].result
    }

    fetchNearbyFeatures( latitude: number, longitude: number, radius : number, notifyId?: string, notifyType?: string ): Promise<NearMeTemplate> {
        var self = this

        // return Promise.resolve( demoNearby )
        return this.fetch( `${ this.baseAPIUrl }/nearby?lat=${ latitude.toFixed( 3 ) }&lon=${ longitude.toFixed( 3 ) }&radius=${ radius }` )
            .then( normalizeNearbyResult )
            .then( function ( resp: NearbyResult ) {
                let fts = resp.features[0]
                
                // Filter out any BCWS_ActiveFires_PublicView where  fire_status === "Out"
                let ftsFiltered = fts.BCWS_ActiveFires_PublicView.filter(e => e.fire_status !== 'Out');
                fts.BCWS_ActiveFires_PublicView = ftsFiltered;

                let nearMeItems = [
                    ...fts.BCWS_ActiveFires_PublicView.map( convertActiveFire( notifyType == 'BCWS_ActiveFires_PublicView' && notifyId ) ),
                    ...fts.British_Columbia_Bans_and_Prohibition_Areas.map( convertBanAndProhibitionArea( notifyType == 'British_Columbia_Bans_and_Prohibition_Areas' && notifyId ) ),
                    ...fts.British_Columbia_Area_Restrictions.map( convertAreaRestriction( notifyType == 'British_Columbia_Area_Restrictions' && notifyId ) ),
                    ...fts.Evacuation_Orders_and_Alerts.map( convertEvacuationOrder( notifyType == 'Evacuation_Orders_and_Alerts' && notifyId ) )
                ]
                nearMeItems.sort( function ( a, b ) {
                    return a.distanceKm - b.distanceKm
                } )

                let station = fts.British_Columbia_Fire_Service_Weather_Stations[ 0 ]

                let result: NearMeTemplate = {
                    nearMeItems: nearMeItems,
                    header: makeNearMeHeader( resp )
                }

                if ( !station ) return result

                return self.fetchWeatherStation( station.stationCode.toString() )
                    .then( function ( conditions ) {
                        result.weatherConditions = { ...station, ...conditions }
                        return result
                    } )
            } )
    }

    fetchAdvisoryFeatures( latitude: number = 52.61960, longitude: number = -129.54926, radius : number = 1000 ): Promise<NearMeTemplate> {
        // return Promise.resolve( demoNearby )
        return this.fetch( `${ this.baseAPIUrl }/nearby?lat=${ latitude.toFixed( 3 ) }&lon=${ longitude.toFixed( 3 ) }&radius=${ radius }` )
            .then( normalizeNearbyResult )
            .then( function ( resp: NearbyResult ) {
                let fts = resp.features[ 0 ]

                let nearMeItems = [
                    ...fts.British_Columbia_Bans_and_Prohibition_Areas.map( convertBanAndProhibitionArea() ),
                    ...fts.British_Columbia_Area_Restrictions.map( convertAreaRestriction() ),
                    ...fts.Evacuation_Orders_and_Alerts.map( convertEvacuationOrder() )
                ]
                nearMeItems.sort( function ( a, b ) {
                    return a.distanceKm - b.distanceKm
                } )

                let result: NearMeTemplate = {
                    nearMeItems: nearMeItems,
                    header: makeNearMeHeader( resp )
                }

                return result
            } )
    }

    fetchWeatherStation( weatherStationId: string ): Promise<WeatherStationConditions> {
        // return Promise.resolve( demoWeatherStations )
        return this.fetch( `${ this.baseAPIUrl }/weatherStation?code=${ weatherStationId }&duration=3` )
            .then( function ( resp: WeatherStationResult ) {
                return resp.stations[ 0 ]
            } )
    }

    fetchNearestWeatherStation( latitude: number, longitude: number ): Promise<WeatherStationConditions> {
        // return Promise.resolve( demoWeatherStations )
        return this.fetch( `${ this.baseAPIUrl }/weather?lat=${ latitude.toFixed( 3 ) }&lon=${ longitude.toFixed( 3 ) }&duration=3` )
            .then( function ( resp: WeatherStationResult ) {
                return resp.stations[ 0 ]
            } )
    }
}

function normalizeNearbyResult( nearby: NearbyResult ): NearbyResult {
    var ft = nearby.features[ 0 ]
    if ( !ft.BCWS_ActiveFires_PublicView ) ft.BCWS_ActiveFires_PublicView = []
    if ( !ft.Evacuation_Orders_and_Alerts ) ft.Evacuation_Orders_and_Alerts = []
    if ( !ft.British_Columbia_Area_Restrictions ) ft.British_Columbia_Area_Restrictions = []
    if ( !ft.British_Columbia_Bans_and_Prohibition_Areas ) ft.British_Columbia_Bans_and_Prohibition_Areas = []
    if ( !ft.British_Columbia_Danger_Rating ) ft.British_Columbia_Danger_Rating = []
    if ( !ft.British_Columbia_Fire_Centre_Boundaries ) ft.British_Columbia_Fire_Centre_Boundaries = []
    if ( !ft.British_Columbia_Fire_Service_Weather_Stations ) ft.British_Columbia_Fire_Service_Weather_Stations = []

    return nearby
}

function makeNearMeHeader( nearby: NearbyResult ): NearMeHeader {
    let dangers = nearby.features[ 0 ].British_Columbia_Danger_Rating
    let centers = nearby.features[ 0 ].British_Columbia_Fire_Centre_Boundaries

    return {
        latitude: nearby.lat.toFixed( 6 ),
        longitude: nearby.lon.toFixed( 6 ),
        dangerRating: dangers.length > 0 && dangers[ 0 ].label,
        fireCentre: centers.length > 0 && centers[ 0 ].fire_centre
    }
}

function parseDistance( val: string ) {
    if ( !val ) return

    return parseFloat( val.replace( ' km', '' ) )
}

function parseNumber( val: number|string ): number {
    if ( typeof val == 'number' ) return val
    return parseFloat( val )
}

function makePoint( latitude: number|string, longitude?: number|string ): object {
    if ( longitude == null && typeof latitude == 'string' ) {
        let coord = JSON.parse( latitude )
        latitude = coord[ 0 ]
        longitude = coord[ 1 ]
    }

    return {
        type: 'Feature',
        geometry: {
            type: 'Point',
            coordinates: [ parseNumber( longitude ), parseNumber( latitude ) ]
        }
    }
}

function parseDate( val: string ): string {
    if ( !val ) return
    return moment( parseFloat( val ) ).format( DATE_FORMATS.datePickerInput )
}

function makeBbox( feature: BboxFeature ) {
    if ( !feature.bboxMinLongitude ) return
    return [
        parseNumber( feature.bboxMinLongitude ),
        parseNumber( feature.bboxMinLatitude ),
        parseNumber( feature.bboxMaxLongitude ),
        parseNumber( feature.bboxMaxLatitude )
    ]
}

function convertActiveFire( notifyId?: string ) {
    return ( fire: ActiveFireFeature ): NearMeItem => {
        return {
            type: 'FIRE',
            component: NearMeFireComponent,
            fireId: fire.fire_number,
            stageOfControl: fire.fire_status,
            suspectedCause: fire.fire_cause,
            estimatedSizeHectacres: parseNumber( fire.current_size ),
            dateActive: parseDate( fire.ignition_date ), //? moment(parseFloat(fire.ignition_date)).format(DATE_FORMATS.datePickerInput) : '',
            distanceKm: parseDistance( fire.distance ), // ? fire.distance.replace(' km', '') : undefined,
            url:fire.fire_of_note_url, // ? fire.fire_of_note_url: undefined,
            nearestCoordinates: makePoint( fire.latitude, fire.longitude ),
            bbox: makeBbox( fire ),
            notified: notifyId == fire.fire_number,
            fireOfNoteInd: fire.fire_of_note_ind
        }
    }
}

function convertEvacuationOrder( notifyId?: string ) {
    return ( evac: EvacuationOrderFeature ): NearMeItem => {
        return {
            type: 'EVACUATION_ORDERS',
            component: NearMeEvacuationOrdersComponent,
            evacuationName: evac.event_name,
            evacuationType: evac.event_type,
            agency:evac.issuing_agency,
            dateActive: parseDate( evac.date_modified ), //&& moment(parseFloat(evac.date_modified)).format(DATE_FORMATS.datePickerInput),
            evacuationStatus: evac.order_alert_status,
            status: evac.order_alert_status,
            distanceKm: parseDistance( evac.distance_to_nearest_coordinates ), //? evac.distance_to_nearest_coordinates.replace(' km', '') : undefined,
            nearestCoordinates: makePoint( evac.nearest_coordinates ), // nearestCoords && nearestCoords.length == 2 ? this.getFeaturePoint(nearestCoords[1], nearestCoords[0]): undefined,
            key: evac.emrg_oaa_sysid,
            bbox: makeBbox( evac ),
            notified: notifyId == evac.emrg_oaa_sysid
        }
    }
}

function convertAreaRestriction( notifyId?: string ) {
    return ( area: AreaRestrictionFeature ): NearMeItem => {
        return {
            type: 'AREA_RESTRICTIONS',
            component: NearMeAreaRestrictionsComponent,
            areaName: area.name,
            url: area.url, //? area.url:undefined,
            fireCentre: area.firecentre,
            distanceKm: parseDistance( area.distance_to_nearest_coordinates ), //? area.distance_to_nearest_coordinates.replace(' km', '') : undefined,
            nearestCoordinates: makePoint( area.nearest_coordinates ), // nearestCoords && nearestCoords.length == 2 ? this.getFeaturePoint(nearestCoords[1], nearestCoords[0]): undefined,
            status: area.datedeactivated ? "Inactive" : "Active",
            dateActive: parseDate( area.dateactive ), //area.dateactive?moment(parseFloat(area.dateactive)).format(DATE_FORMATS.datePickerInput):'',
            key: area.prot_ra_sysid,
            bbox: makeBbox( area ),
            notified: notifyId == area.prot_ra_sysid
        }
    }
}

function convertBanAndProhibitionArea( notifyId?: string ) {
    return ( ban: BanAndProhibitionAreaFeature ): NearMeItem => {
        return {
            type: 'BANS_AND_PROHIBITIONS',
            component: NearMeBansAndProhibitionsComponent,
            prohibitionName: 'Bans and Prohibitions',
            prohibitionType: ban.type,
            dateActive: parseDate( ban.dateactive ), //?moment(parseFloat(ban.dateactive)).format(DATE_FORMATS.datePickerInput):'',
            comments: ban.comments,
            fireCentre: ban.firecentre,
            // status: ban.status,
            url: ban.url, // ? ban.url: undefined,
            distanceKm: parseDistance( ban.distance_to_nearest_coordinates ), // ? ban.distance_to_nearest_coordinates.replace(' km', '') : undefined,
            nearestCoordinates: makePoint( ban.nearest_coordinates ), //nearestCoords && nearestCoords.length == 2 ? this.getFeaturePoint(nearestCoords[1], nearestCoords[0]): undefined,
            key: ban.prot_bap_sysid,
            bbox: makeBbox( ban ),
            notified: notifyId == ban.prot_bap_sysid
        }
    }
}
