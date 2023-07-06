import {EffectSources} from "@ngrx/effects";
import {APP_BOOTSTRAP_LISTENER, Inject, InjectionToken, Type} from "@angular/core";
import {VmAdvisory, VmBanProhibition, VmFireCentre, VmFireStatus, VmOption} from "../conversion/models";
import {TitleCasePipe} from "@angular/common";
import { WeatherHourlyCondition, WeatherStationConditions } from "../services/point-id.service";
import { MatSnackBarConfig } from "@angular/material";

export enum WFOnePublicMobileRoutes {
    LANDING = 'wildfire-map',
    REPORT_OF_FIRE = 'report-a-fire',
    FEEDBACK = 'feedback',
    LATEST_NEWS = 'latest-news',
    HELP = 'help',
    ADVISORIES = 'advisories',
    BANS_AND_PROHIBITIONS = 'bans-and-prohibitions',
    BANS_AND_PROHIBITIONS_DETAIL = 'bans-and-prohibitions-detail',
    HELP_CONTENT = 'help-content',
    DISCLAIMER = 'disclaimer',
    CURRENT_STATS = 'current-stats',
    NOTIFICATIONS = 'notifications',
    NOTIFICATION_DETAIL = 'notification-detail',
    LATEST_NEWS_DETAIL = 'latest-news-detail',
}

export enum WFOnePublicMobileMapToolRoutes { //only used for snowplow tracking
    NEARME = '#nearMe',
    SEARCH = '#search',
    BASEMAP = '#baseMap',
    LAYERS = '#layers',
    IDENTIFY = '#identify',
}

export const CONSTANTS = {
    MAT_ICON_CUSTOM_TWITTER: 'twitter',
    MAT_ICON_CUSTOM_FACEBOOK: 'facebook',
    ICON_WEB_NAVIGATE: 'webnavigate',
    MAT_ICON_CUSTOM_FIRE: 'fire',
    MAT_ICON_CUSTOM_MAP_SIGNS: 'map-signs',
    MAT_ICON_CUSTOM_INCIDENT: 'incident',
    MAT_ICON_CUSTOM_ADVISORIES: 'advisories',
    MAT_ICON_CUSTOM_EXT_LINK: 'external-link',
    MAT_ICON_CUSTOM_EXCLAMATION_CIRCLE: 'exclamation-circle',
    MAT_ICON_CLOUD_SUN: 'cloud-sun',
    MAP: 'map',
    NO_CONNECTIVITY_MESSAGE : 'No Connectivity. Please try again when you have reconnected.'
};

export const APP_CONFIG_KEYS = {
    APP_RESOURCES: 'applicationResources',
    BAN_PROHIBITIONS_RSS_LOCATION: 'bans-prohibitions-rss-location',
    WFSS_POINTID_API_URL: 'wfss-pointid-api',
    TWITTER_FEED_PROFILE_NAME: 'twitter-feed-profile-name',
    REPORT_A_FIRE_PHONE: 'report-a-fire-phone',
    REPORT_A_FIRE_CELL: 'report-a-fire-cell',
    ARC_GIS_BASE_URL: 'arc-gis-base-url',
    FEEDBACK_EMAIL: 'feedback-email',
    FIRE_INFO_PHONE: 'fire-info-phone',
    BURN_REGISTRATION_PHONE: 'burn-registration-phone',
    TWITTER_PROFILE_URL: 'twitter-profile-url',
    FB_PROFILE_URL: 'fb-profile-url',
    DATA_CATALOGUE_URL: 'data-catalogue-url',
    FIRE_DANGER_RATING_URL: 'fire-danger-rating-url',
    FIRE_WEATHER_URL: 'fire-weather-url',
    PROHIBITIONS_URL: 'prohibitions-restriction-advisories',
    PRESCRIBED_BURNING_URL: 'prescribed-burning-url',
    FIRE_TRACKING_URL: 'fire-tracking-url',
    HAZARD_ASSESSMENT_URL: 'hazard-assessment-url',
    OPENMAPS_BASE_URL: 'openmaps-base-url',
    DRIVEBC_BASE_URL: 'drivebc-base-url',
    DATASET_DRIVEBC_URL: 'dataset-drivebc-url',
    DATASET_FIRELOCATIONS_URL: 'dataset-firelocations-url',
    DATASET_FIREPERIMETER_URL: 'dataset-fireperimeter-url',
    DATASET_FIRECENTRES_URL: 'dataset-firecentres-url',
    DATASET_DANGERRATING_URL: 'dataset-dangerrating-url',
    DATASET_AREARESTRICTIONS_URL: 'dataset-arearestrictions-url',
    DATASET_RECSITES_URL: 'dataset-recsites-url',
    DATESET_PROTECTEDLANDS_URL: 'dataset-protectedlandrestrictions-url',
    DATASET_EVACORDERS_URL: 'dataset-evacorders-url',
    DATASET_CURRENT_CONDITIONS_URL: "dataset-current-conditions-url",
    DATASET_RADARURPPRECIPR14_URL: "dataset-radarurpprecipr14-url",
    DATASET_FIRESMOKE_URL: "dataset-firesmoke-url",
    NOTIFICATION_API_URL: 'notifications-api-url'
};





export const mapServiceConfig = {
    'map': {
        'center': [
            -126.58333333,
            56.66666667
        ],
        'zoom': 5,
        'leafOpt': {
            'zoomControl': true,
            'attributionControl': false
        },
        'baseMaps': [
            'EsriImagery',
            'EsriStreet',
            'EsriTopo'
        ]
    },
    'basemapUI': {
        'EsriImagery': {
            'title': 'Imagery',
            'thumbnail': 'assets/images/map-thumbnails/esri-imagery.jpg'
        },
        'EsriStreet': {
            'title': 'Street',
            'thumbnail': 'assets/images/map-thumbnails/esri-street.jpg'
        },
        'EsriTopo': {
            'title': 'Topographic',
            'thumbnail': 'assets/images/map-thumbnails/esri-topo.jpg'
        }
    },
    'layerSettings': {
        'services': {
            'wf': {
                'name': 'WF',
                'url': 'https://d1geo.vividsolutions.com/geoserver/wms'
            },
            'wfgs': {
                'name': 'WF-GS',
                'url': 'https://wf1geot.nrs.gov.bc.ca/geoserver/wms'
            }
        },
        'layers': [
            {
                'id': 'ActiveIncidents',
                'title': 'Active Incidents',
                'folder': [
                    'Incidents'
                ],
                'service': 'wf',
                'visible': true,
                'layers': 'ACTIVE_FIRES'
            },
            {
                'id': 'FireCentre',
                'title': 'Fire Centre',
                'folder': [
                    'Boundaries',
                    'BC Wildfire'
                ],
                'service': 'wfgs',
                'visible': false,
                'layers': 'WF1_FIRE_CENTRE_SPG'
            },
            {
                'id': 'FireZone',
                'title': 'Fire Zone',
                'folder': [
                    'Boundaries',
                    'BC Wildfire'
                ],
                'service': 'wfgs',
                'visible': false,
                'layers': 'WF1_FIRE_ZONE_SPG'
            },
            {
                'id': 'Roads',
                'title': 'Roads',
                'folder': [
                    'Transportation and Trails',
                    'Roads'
                ],
                'service': 'wfgs',
                'visible': false,
                'layers': 'WF1_ROADS'
            },
            {
                'id': 'AirtankerBase',
                'title': 'Airtanker Base',
                'folder': [
                    'Critical Infrastructure',
                    'Wildfire Response Infrastructure'
                ],
                'service': 'wfgs',
                'visible': false,
                'layers': 'CI_BCWS_AIRTANKER_BASE'
            },
            {
                'id': 'AttackBase',
                'title': 'Attack Base',
                'folder': [
                    'Critical Infrastructure',
                    'Wildfire Response Infrastructure'
                ],
                'service': 'wfgs',
                'visible': false,
                'layers': 'CI_BCWS_ATTACK_BASE'
            },
            {
                'id': 'EquipmentDepot',
                'title': 'Equipment Depot',
                'folder': [
                    'Critical Infrastructure',
                    'Wildfire Response Infrastructure'
                ],
                'service': 'wfgs',
                'visible': false,
                'layers': 'CI_BCWS_EQUIPMENT_DEPOT'
            },
            {
                'id': 'AdminOffice',
                'title': 'Admin Office',
                'folder': [
                    'Critical Infrastructure',
                    'Wildfire Response Infrastructure'
                ],
                'service': 'wfgs',
                'visible': false,
                'layers': 'CI_BCWS_ADMIN_OFFICE'
            }
        ]
    }
};


export const FireCentres = [
    {
        code: '2',
        agol: '7',
        description: 'Cariboo Fire Centre',
        displayOrder: 1,
        effectiveDate: '1999-01-01',
        expiryDate: '9999-12-31',
        characterAlias: 'C'
    },
    {
        code: '50',
        agol: '2',
        description: 'Coastal Fire Centre',
        displayOrder: 2,
        effectiveDate: '1999-01-01',
        expiryDate: '9999-12-31',
        characterAlias: 'V'
    },
    {
        code: '25',
        agol: '5',
        description: 'Kamloops Fire Centre',
        displayOrder: 3,
        effectiveDate: '1999-01-01',
        expiryDate: '9999-12-31',
        characterAlias: 'K'
    },
    {
        code: '42',
        agol: '3',
        description: 'Northwest Fire Centre',
        displayOrder: 4,
        effectiveDate: '1999-01-01',
        expiryDate: '9999-12-31',
        characterAlias: 'R'
    },
    {
        code: '8',
        agol: '4',
        description: 'Prince George Fire Centre',
        displayOrder: 5,
        effectiveDate: '1999-01-01',
        expiryDate: '9999-12-31',
        characterAlias: 'G'
    },
    {
        code: '34',
        agol: '6',
        description: 'Southeast Fire Centre',
        displayOrder: 6,
        effectiveDate: '1999-01-01',
        expiryDate: '9999-12-31',
        characterAlias: 'N'
    }
];

export const BOOTSTRAP_EFFECTS = new InjectionToken('Bootstrap Effects');

export function createInstances(...instances: any[]) {
    return instances;
}

export function bootstrapEffects(effects: Type<any>[], sources: EffectSources) {
    return () => {
        effects.forEach(effect => sources.addEffects(effect));
    };
}

export function provideBootstrapEffects(effects: Type<any>[]): any {
    return [
        effects,
        {
            provide: BOOTSTRAP_EFFECTS, deps: effects, useFactory: createInstances
        },
        {
            provide: APP_BOOTSTRAP_LISTENER,
            multi: true,
            useFactory: bootstrapEffects,
            deps: [[new Inject(BOOTSTRAP_EFFECTS)], EffectSources]
        }
    ];
}

export const FIRE_CENTRES: VmFireCentre[] = [
    {id: 2, name: 'Coastal', displayOrder: 1},
    {id: 3, name: 'Northwest', displayOrder: 2},
    {id: 4, name: 'Prince George', displayOrder: 3},
    {id: 5, name: 'Kamloops', displayOrder: 4},
    {id: 6, name: 'Southeast', displayOrder: 5},
    {id: 7, name: 'Cariboo', displayOrder: 6},
];

export const FIRE_BAN_TYPES = {
    OPEN_FIRES_CATEGORY_2: {desc: 'Category 2', value: 'Category 2'} as VmOption,
    OPEN_FIRES_CATEGORY_3: {desc: 'Category 3', value: 'Category 3'} as VmOption,
    CAMP_FIRES: {desc: 'Campfires', value: 'Campfires'} as VmOption,
    FOREST_USE: {desc: 'Forest Use', value: 'Forest Use'} as VmOption,
};

export function getFireCentreById(id: number): VmFireCentre {
    return FIRE_CENTRES.find((fireCentre: VmFireCentre) => fireCentre.id === id);
}

export function getFireCentreByName(name: string): VmFireCentre {
    return FIRE_CENTRES.find((fireCentre: VmFireCentre) => fireCentre.name.toUpperCase() === name.toUpperCase());
}

export function getFireCentreByContainsName(phrase: string): VmFireCentre {
    return FIRE_CENTRES.find((fireCentre: VmFireCentre) => phrase.toUpperCase().indexOf(fireCentre.name.toUpperCase()) > -1);
}

export function getNoAdvisory(fireCentre: VmFireCentre): VmAdvisory {
    const titlecasePipe: TitleCasePipe = new TitleCasePipe();
    return {
        fireCentre: fireCentre,
        campfiresStatus: VmFireStatus.PERMITTED,
        campfiresStatusDesc: titlecasePipe.transform(VmFireStatus[VmFireStatus.PERMITTED]),
        campFireBanInEffect: false,
        openFiresStatus: VmFireStatus.PERMITTED,
        openFiresDesc: titlecasePipe.transform(VmFireStatus[VmFireStatus.PERMITTED]),
        openFireBanInEffect: false,
        forestUseStatus: VmFireStatus.UNRESTRICTED,
        forestUseDesc: titlecasePipe.transform(VmFireStatus[VmFireStatus.UNRESTRICTED]),
        forestUseRestrictionsInEffect: false,
        hasProhibitions: false
    };
}

export function getNoBanProhibition(fireCentre: VmFireCentre): VmBanProhibition {
    const titlecasePipe: TitleCasePipe = new TitleCasePipe();
    return {
        fireCentre: fireCentre,
        campfiresStatus: VmFireStatus.PERMITTED,
        campfiresStatusDesc: titlecasePipe.transform(VmFireStatus[VmFireStatus.PERMITTED]),
        campFireBanInEffect: false,
        openFiresStatus: VmFireStatus.PERMITTED,
        openFiresDesc: titlecasePipe.transform(VmFireStatus[VmFireStatus.PERMITTED]),
        openFireBanInEffect: false,
        forestUseStatus: VmFireStatus.UNRESTRICTED,
        forestUseDesc: titlecasePipe.transform(VmFireStatus[VmFireStatus.UNRESTRICTED]),
        forestUseRestrictionsInEffect: false,
        hasProhibitions: false
    };
}

export function removeCData(xml: string): string {
    let result = xml.replace(/\<\!\[CDATA\[/g, '');
    result = result.replace(/\]\]\>/g, '');
    result = result.replace(/\/s/g, '');
    return result;
}


export enum HELP_CONTENT_TYPES {
    BANS_PROHIBS = 'BANS_PROHIBS',
    OPEN_FIRES_ALL = 'OPEN_FIRES_ALL',
    OPEN_FIRES_CAT2 = 'OPEN_FIRES_CAT2',
    OPEN_FIRES_CAT3 = 'OPEN_FIRES_CAT3',
    CAMP_FIRES = 'CAMP_FIRES',
    LATEST_NEWS = 'LATEST_NEWS',
    REPORT_A_FIRE = 'REPORT_A_FIRE',
    FEEDBACK = 'FEEDBACK',
    HELP = 'HELP',
    DISCLAIMER = 'DISCLAIMER',
    ADVISORIES = 'ADVISORIES',
    CURRENT_STATS = 'CURRENT_STATS',
    WF_MAP = 'WF_MAP',
    WEATHER_INDICES = "WEATHER_INDICES"
}

export function copyToClipboard(str) {
    const el = document.createElement('textarea');
    el.value = str;
    document.body.appendChild(el);
    el.select();
    document.execCommand('copy');
    document.body.removeChild(el);
}

export function checkMobileResolution() {
    if (window.innerWidth < 768 || (window.innerWidth >= 768 && window.innerHeight < 450)/*support for landscape mobile views*/) {
        return true;
    } else {
        return false;
    }
}

export function checkTabletResolution() {
    if ((window.innerWidth <= 1032 && window.innerWidth >= 768) || (window.innerWidth >= 1032 && window.innerHeight <= 912)) {
        return true;
    } else {
        return false;
    }
}

export function isLandscape() {
    if(window.innerHeight < window.innerWidth){
        return true;
    }else{
        return false;
    }

}

export function convertRemToPixels(rem) {
    return rem * parseFloat(getComputedStyle(document.documentElement).fontSize);
}

export function getCurrentCondition( conditions: WeatherStationConditions ): WeatherHourlyCondition {
    if ( !conditions || !conditions.hourly ) return
    return conditions.hourly.find( function ( hc ) {
        return hc.temp != null
    } )
}

export function haversineDistance(lat1, lat2, lon1, lon2) {
    const R = 6371e3; // metres
    const φ1 = lat1 * Math.PI / 180; // φ, λ in radians
    const φ2 = lat2 * Math.PI / 180;
    const Δφ = (lat2 - lat1) * Math.PI/180;
    const Δλ = (lon2 - lon1) * Math.PI/180;
  
    const a = Math.sin(Δφ/2) * Math.sin(Δφ/2) +
              Math.cos(φ1)   * Math.cos(φ2)   *
              Math.sin(Δλ/2) * Math.sin(Δλ/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  
    const d = R * c; // in metres
    return d
  }

  export function convertToFireCentreDescription(code: string): string {
    if (code) {
        let result = FireCentres.find(fireCentre => fireCentre.code === code + '')
        // Some have the code from AGOL, which appears to be an objectid?
        let agolResult = FireCentres.find(fireCentre => fireCentre.agol === code + '');
        return result ? result.description : agolResult ? agolResult.description : code;
    }
}

export function getSnackbarConfig(message, type): MatSnackBarConfig {
    let config = {
        panelClass: "snack-bar-photo-warning",
        data: {
            message: message,
            type: type
        },
        duration: 4000
    };
    return config;
}
