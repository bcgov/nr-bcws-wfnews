import { APP_BOOTSTRAP_LISTENER, Inject, InjectionToken, Type } from '@angular/core';
import { EffectSources } from '@ngrx/effects';
import { SortDirection } from '@wf1/core-ui';
import * as moment from 'moment';
import { Moment } from 'moment';
import { PagingInfoRequest } from '../store/application/application.state';

export enum ResourcesRoutes {
    LANDING = '',
    ACTIVEWILDFIREMAP = 'activeWildfireMap',
    WILDFIRESLIST = 'wildFiresList',
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
        code: "2",
        description: "Cariboo Fire Centre",
        displayOrder: 1,
        effectiveDate: "1999-01-01",
        expiryDate: "9999-12-31"
    },
    {
        code: "50",
        description: "Coastal Fire Centre",
        displayOrder: 2,
        effectiveDate: "1999-01-01",
        expiryDate: "9999-12-31"
    },
    {
        code: "25",
        description: "Kamloops Fire Centre",
        displayOrder: 3,
        effectiveDate: "1999-01-01",
        expiryDate: "9999-12-31"
    },
    {
        code: "42",
        description: "Northwest Fire Centre",
        displayOrder: 4,
        effectiveDate: "1999-01-01",
        expiryDate: "9999-12-31"
    },
    {
        code: "8",
        description: "Prince George Fire Centre",
        displayOrder: 5,
        effectiveDate: "1999-01-01",
        expiryDate: "9999-12-31"
    },
    {
        code: "34",
        description: "Southeast Fire Centre",
        displayOrder: 6,
        effectiveDate: "1999-01-01",
        expiryDate: "9999-12-31"
    }
];

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
    NO_RECORDS_MESSAGE: "No records to display.",
}

export function arrayEquals(a, b) {
    return Array.isArray(a) &&
        Array.isArray(b) &&
        a.length === b.length &&
        a.every((val, index) => val === b[index]);
}

export const formatSort = (param: string, direction: SortDirection) => param && direction ? `${param} ${direction}` : undefined;

export const WF_SNACKBAR_TYPES = {SUCCESS: "success", ERROR: "error", WARNING: "warning", INFO: "info", UPDATE: "update"};


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

export function convertToFireCentreDescription(code: string): string {
    if (code) {
        let result = FireCentres.find(fireCentre => fireCentre.code === code);
        return result.description;
    }
}

