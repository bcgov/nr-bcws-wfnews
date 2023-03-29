import { APP_BOOTSTRAP_LISTENER, Inject, InjectionToken, Type } from '@angular/core';
import { EffectSources } from '@ngrx/effects';
import { SortDirection } from '@wf1/core-ui';
import * as moment from 'moment';
import { PagingInfoRequest } from '../store/application/application.state';

declare const window: any;
export enum ResourcesRoutes {
    LANDING = '',
    ACTIVEWILDFIREMAP = 'map',
    WILDFIRESLIST = 'list',
    CURRENTSTATISTICS = 'currentStatistics',
    RESOURCES = 'resources',
    UNAUTHORIZED = 'unauthorized',
    SIGN_OUT = 'sign-out-page',
    ERROR_PAGE = 'error-page',
    ADMIN = 'admin',
    ADMIN_INCIDENT = 'incident',
    PUBLIC_INCIDENT = 'incidents'
}

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

export const FireZones = [
  { code: 3, alias: 1, description: 'Quesnel Zone', fireCentreOrgUnit: 2},
  { code: 4, alias: 2, description: 'Central Cariboo Zone (Williams Lake)', fireCentreOrgUnit: 2},
  { code: 5, alias: 3, description: 'Central Cariboo Zone (Horsefly)', fireCentreOrgUnit: 2},
  { code: 6, alias: 4, description: '100 Mile House Zone', fireCentreOrgUnit: 2},
  { code: 7, alias: 5, description: 'Chilcotin Zone', fireCentreOrgUnit: 2},
  { code: 9, alias: 1, description: 'Prince George Zone', fireCentreOrgUnit: 8},
  { code: 10, alias: 3, description: 'Robson Valley Zone', fireCentreOrgUnit: 8},
  { code: 11, alias: 4, description: 'VanJam Zone (Vanderhoof)', fireCentreOrgUnit: 8},
  { code: 12, alias: 5, description: 'VanJam Zone (Fort St. James)', fireCentreOrgUnit: 8},
  { code: 13, alias: 6, description: 'Mackenzie Zone', fireCentreOrgUnit: 8},
  { code: 14, alias: 7, description: 'Dawson Creek Zone', fireCentreOrgUnit: 8},
  { code: 15, alias: 8, description: 'Fort St. John Zone', fireCentreOrgUnit: 8},
  { code: 16, alias: 9, description: 'Fort Nelson Zone', fireCentreOrgUnit: 8},
  { code: 26, alias: 1, description: 'Kamloops Zone (Clearwater)', fireCentreOrgUnit: 25},
  { code: 27, alias: 2, description: 'Kamloops Zone (Kamloops)', fireCentreOrgUnit: 25},
  { code: 28, alias: 3, description: 'Vernon Zone (Salmon Arm)', fireCentreOrgUnit: 25},
  { code: 29, alias: 4, description: 'Vernon Zone (Vernon)', fireCentreOrgUnit: 25},
  { code: 30, alias: 5, description: 'Penticton Zone', fireCentreOrgUnit: 25},
  { code: 31, alias: 6, description: 'Merritt Zone', fireCentreOrgUnit: 25},
  { code: 32, alias: 7, description: 'Lillooet Zone', fireCentreOrgUnit: 25},
  { code: 35, alias: 1, description: 'Cranbrook Zone', fireCentreOrgUnit: 34},
  { code: 36, alias: 2, description: 'Invermere Zone', fireCentreOrgUnit: 34},
  { code: 37, alias: 4, description: 'Columbia Zone', fireCentreOrgUnit: 34},
  { code: 38, alias: 5, description: 'Arrow Zone', fireCentreOrgUnit: 34},
  { code: 39, alias: 6, description: 'Boundary Zone', fireCentreOrgUnit: 34},
  { code: 40, alias: 7, description: 'Kootenay Lake Zone', fireCentreOrgUnit: 34},
  { code: 43, alias: 1, description: 'Nadina Zone (Lakes)', fireCentreOrgUnit: 42},
  { code: 44, alias: 2, description: 'Nadina Zone (Morice)', fireCentreOrgUnit: 42},
  { code: 45, alias: 3, description: 'Bulkley Zone', fireCentreOrgUnit: 42},
  { code: 46, alias: 4, description: 'Bulkley Zone (Kispiox)', fireCentreOrgUnit: 42},
  { code: 47, alias: 5, description: 'Skeena Zone (Kalum)', fireCentreOrgUnit: 42},
  { code: 48, alias: 8, description: 'Skeena Zone (North Coast)', fireCentreOrgUnit: 42},
  { code: 49, alias: 9, description: 'Cassiar Zone', fireCentreOrgUnit: 42},
  { code: 51, alias: 1, description: 'Fraser Zone', fireCentreOrgUnit: 50},
  { code: 52, alias: 3, description: 'Pemberton Zone', fireCentreOrgUnit: 50},
  { code: 53, alias: 5, description: 'Sunshine Coast Zone', fireCentreOrgUnit: 50},
  { code: 54, alias: 6, description: 'South Island Zone', fireCentreOrgUnit: 50},
  { code: 55, alias: 7, description: 'Mid Island Zone', fireCentreOrgUnit: 50},
  { code: 56, alias: 8, description: 'North Island Mid Coast Zone (Campbell River)', fireCentreOrgUnit: 50},
  { code: 57, alias: 9, description: 'North Island Mid Coast Zone (Port McNeill)', fireCentreOrgUnit: 50},
  { code: 58, alias: 10, description: 'North Island Mid Coast Zone (Mid Coast)', fireCentreOrgUnit: 50},
  { code: 59, alias: 11, description: 'Fraser Zone (Haida Gwaii)', fireCentreOrgUnit: 50}
]

export function getPageInfoRequestForSearchState(searchState: any): PagingInfoRequest {
    return {
        pageRowCount: searchState.pageSize,
        pageNumber: searchState.pageIndex,
        sortColumn: searchState.sortParam,
        sortDirection: searchState.sortDirection,
        query: searchState.query
    };
}

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

export const DATE_FORMATS = {
    fullPickerInput: 'Y-MM-DD HH:mm',
    datePickerInput: 'Y-MM-DD',
    timePickerInput: 'HH:mm',
    monthYearLabel: 'Y-MM',
    dateA11yLabel: 'Y-MMM-DD',
    monthYearA11yLabel: 'YYYY-MMM',
    simplifiedDate: 'MMM DD',
    simplifiedDateWithYear: 'MMM DD YYYY',
    simplifiedDateWithTime: 'MMM DD, YYYY - HH:mm',
    simplifiedMonthDate: 'MM-DD',
    fullPickerInputWithSlash: 'Y-MM-DD/ HH:mm',
    API_DATE: 'Y-MM-DD',
    API_TIMESTAMP: 'Y-MM-DD HH:mm:ss',
    API_TIMESTAMP_WITH_SEP: 'Y-MM-DDTHH:mm:ss'
};

export function getElementInnerText(el: HTMLElement): string {
    return el.innerText;
}

export  const hasValues = (obj) => Object.values(obj).some(v => v !== null && typeof v !== 'undefined');

export function isElementTruncated(el: HTMLElement): boolean {
    return el.offsetWidth < el.scrollWidth;
}

export const CONSTANTS= {
    NO_RECORDS_MESSAGE: 'No records to display.',
}

export function arrayEquals(a, b) {
    return Array.isArray(a) &&
        Array.isArray(b) &&
        a.length === b.length &&
        a.every((val, index) => val === b[index]);
}

export const formatSort = (param: string, direction: SortDirection) => param && direction ? `${param} ${direction}` : undefined;

export const WF_SNACKBAR_TYPES = {SUCCESS: 'success', ERROR: 'error', WARNING: 'warning', INFO: 'info', UPDATE: 'update'};


export function convertFromTimestamp(date: string) {
    if (date) {
        return moment(date).format(DATE_FORMATS.simplifiedDateWithYear)
    }
}

export function convertToDateWithTime(date: string) {
    if (date) {
        return moment(date).format(DATE_FORMATS.simplifiedDateWithTime)
    }
}

export function convertToDateWithDayOfWeek(date: string) {
    if (date){
        return displayDay(date) + ' ' + moment(date).format(DATE_FORMATS.simplifiedDateWithYear)
    }
}

export function  convertToStageOfControlDescription(code: string) {
    switch(code) {
        case 'OUT_CNTRL':
            return 'Out Of Control'
        case 'HOLDING':
            return 'Being Held'
        case 'UNDR_CNTRL':
            return 'Under Control'
        case 'OUT':
            return 'Out'
        default:
            break;
      }
}

function displayDay(date: string): string{
    if (date) {
        const result = moment(date).format('dddd');
        return (result.charAt(0).toUpperCase() + result.slice(1)).slice(0, 3); // abbreviate days of the week
    } else {
        return null;
    }
}

export function findFireCentreByName(fireCentreName: string): any {
  if (fireCentreName) {
      let nameResult = FireCentres.find(fireCentre => fireCentre.description.toLowerCase().trim() === fireCentreName.toLowerCase().trim() + '')
      return nameResult ? nameResult : null;
  }
}

export function convertToFireCentreDescription(code: string): string {
    if (code) {
        const result = FireCentres.find(fireCentre => fireCentre.code === code + '')
        // Some have the code from AGOL, which appears to be an objectid?
        const agolResult = FireCentres.find(fireCentre => fireCentre.agol === code + '');
        const nameResult = FireCentres.find(fireCentre => fireCentre.description === code + '')
        return result ? result.description : agolResult ? agolResult.description : nameResult ? nameResult.description: code;
    }
}

export function isMobileView () {
  return window.innerWidth <= 768
}

export async function snowPlowHelper(page: string, data: any = null) {
    let pageInfo = page;
    if(data) {
       window.snowplow('trackSelfDescribingEvent', {
        schema: 'iglu:ca.bc.gov.wfnews/action/jsonschema/1-0-0',
        data: data
      });
    } else {
      window.snowplow('trackPageView', pageInfo);
    }
}

export function convertFireNumber(incident) {
    if(incident.incidentNumberLabelFull) {
        return incident.incidentNumberLabelFull
    } else if(incident.incidentNumberLabel.length > 4) {
      return incident.incidentNumberLabel
    } else{
        try {
        const fcAlias = FireCentres.find(c => c.code === incident.fireCentreCode).characterAlias
        const zoneAlias = FireZones.find(z => z.code === incident.fireZoneUnitIdentifier).alias
        const incidentNumber = String(incident.incidentNumberLabel).padStart(4, '0')
        return fcAlias + zoneAlias + incidentNumber
        } catch (err) {
        console.error(err)
        return 'Unknown Incident Label'
        }
    }
}

export function convertToYoutubeId (externalUri: string) {
  if (externalUri) {
    const regExp = /^.*((youtu.be\/)|(v\/)|(\/u\/\w\/)|(embed\/)|(watch\?))\??v?=?([^#&?]*).*/;
    let match = externalUri.match(regExp);
    if( match && match[7].length == 11) {
      return match[7]
    }
  }
}
