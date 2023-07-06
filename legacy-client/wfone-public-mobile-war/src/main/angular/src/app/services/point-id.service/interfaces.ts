import { Type } from "@angular/core";

export interface NearMeTemplate{
    header: NearMeHeader;
    nearMeItems: NearMeItem[];
    weatherConditions?: WeatherStationConditions
}

export interface NearMeHeader{
    latitude: string;
    longitude: string;
    dangerRating: string;
    fireCentre: string
}

export interface NearMeItem {
    type: 'FIRE'|'EVACUATION_ORDERS'|'AREA_RESTRICTIONS'|'BANS_AND_PROHIBITIONS';
    distanceKm?: number;
    fireId?:string;
    stageOfControl?: string;
    estimatedSizeHectacres?: number;
    suspectedCause?: string;
    fireCentre?: string;
    dangerRating?: string;
    prohibitionType?: string;
    prohibitionName?: string;
    dateActive?: string;
    comments?: string;
    areaName?: string;
    url?: string;
    evacuationName?: string;
    evacuationType?: string;
    evacuationStatus?: string;
    status?: string;
    nearestCoordinates?: any;
    agency?: string;
    key?: string;
    bbox?: Array<number>;
    source?: string;
    component?: Type<any>;
    notified?: boolean
    fireOfNoteInd?: string;
}

export interface WeatherHourlyCondition {
    hour: string;
    index: number;
    // forecastInd: string;
    temp: number;
    relativeHumidity: number;
    windSpeed: number;
    windDirection: number;
    windCardinalDir: string;
    precipitation: number;
    // buildupIndex: number;
    fineFuelMoistureCode: number;
    initialSpreadIndex: number;
    fireWeatherIndex: number;
}

export interface WeatherDailyCondition {
    day: string;
    index: number;
    forecastInd: boolean;
    temp: number;
    relativeHumidity: number;
    windSpeed: number;
    windDirection: number;
    windCardinalDir: string;
    precipitation: number;
    buildupIndex: number;
    fineFuelMoistureCode: number;
    initialSpreadIndex: number;
    fireWeatherIndex: number;
    droughtCode: number;
    duffMoistureCode: number;

}

export interface WeatherStation {
    stationCode: string;
    stationName: string;
    lat?: string;
    lon?: string;
    elevation: string;
    distance: string;
    [ key: string ]: any;
}

export interface WeatherStationConditions extends WeatherStation {
    hourly: WeatherHourlyCondition[];
    daily: WeatherDailyCondition[];
}

export interface WeatherStationResult {
    stations: WeatherStationConditions[];
    [ key: string ]: any;
}

export interface NearbyResult {
    lat: number;
    lon: number;
    features: [ NearbyFeatures ];
    [ key: string ]: any;
}

export interface NearbyFeatures {
    BCWS_ActiveFires_PublicView: ActiveFireFeature[];
    Evacuation_Orders_and_Alerts: EvacuationOrderFeature[];
    British_Columbia_Area_Restrictions: AreaRestrictionFeature[];
    British_Columbia_Bans_and_Prohibition_Areas: BanAndProhibitionAreaFeature[];
    British_Columbia_Danger_Rating: DangerRatingFeature[];
    British_Columbia_Fire_Centre_Boundaries: FireCentreBoundaryFeature[];
    British_Columbia_Fire_Service_Weather_Stations: WeatherStation[];
    // [ key: string ]: any;
}

	// public static String BRITISH_COLUMBIA_BANS_AND_PROHIBITION_AREAS = "British_Columbia_Bans_and_Prohibition_Areas";
	// public static String EVACUATION_ORDERS_AND_ALERTS = "Evacuation_Orders_and_Alerts";
	// public static String BRITISH_COLUMBIA_AREA_RESTRICTIONS = "British_Columbia_Area_Restrictions";
	// public static String BCWF_ACTIVEFIRES_PUBLIVIEW = "BCWS_ActiveFires_PublicView";


export interface BboxFeature {
    bboxMaxLatitude: string;
    bboxMaxLongitude: string;
    bboxMinLatitude: string;
    bboxMinLongitude: string;
}

export interface ActiveFireFeature extends BboxFeature {
    current_size: string;
    distance: string;
    fire_cause: string;
    fire_number: string;
    fire_of_note_name: string;
    fire_of_note_url: string;
    fire_of_note_ind: string;
    fire_status: string;
    ignition_date: string;
    latitude: string;
    longitude: string;
    objectid: string;
}

export interface EvacuationOrderFeature extends BboxFeature {
    date_modified: string;
    distance_to_nearest_coordinates: string;
    emrg_oaa_sysid: string;
    event_name: string;
    event_type: string;
    issuing_agency: string;
    nearest_coordinates: string;
    number_of_homes: string;
    objectid: string;
    order_alert_status: string;
    population: string;
}

export interface AreaRestrictionFeature extends BboxFeature {
    dateactive: string;
    datedeactivated: string;
    distance_to_nearest_coordinates: string;
    firecentre: string;
    name: string;
    nearest_coordinates: string;
    objectid: string;
    prot_ra_sysid: string;
    status: string;
    type: string;
    url: string;
}

export interface BanAndProhibitionAreaFeature extends BboxFeature {
    comments: string;
    dateactive: string;
    datedeactivated: string;
    distance_to_nearest_coordinates: string;
    firecentre: string;
    mof_fire_zone_name: string;
    nearest_coordinates: string;
    objectid: string;
    org_unit_name: string;
    prot_bap_sysid: string;
    shape__area: string;
    shape__length: string;
    type: string;
    url: string;
}

export interface DangerRatingFeature extends BboxFeature {
    bknd: string;
    distance_to_nearest_coordinates: string;
    fgnd: string;
    label: string;
    nearest_coordinates: string;
    objectid: string;
    sfms_date: string;
    sfms_hour: string;
    value: string;
}

export interface FireCentreBoundaryFeature extends BboxFeature {
    distance_to_nearest_coordinates: string;
    fire_centre_code: string;
    fire_centre: string;
    headquarters: string;
    nearest_coordinates: string;
    objectid: string;
}
