import {
  APP_BOOTSTRAP_LISTENER,
  Inject,
  InjectionToken,
  Type,
} from '@angular/core';
import {
  WeatherHourlyCondition,
  WeatherStationConditions,
} from '@app/services/point-id.service';
import { EffectSources } from '@ngrx/effects';
import { SortDirection } from '@wf1/core-ui';
import * as moment from 'moment';
import { PagingInfoRequest } from '../store/application/application.state';

declare const window: any;
export enum ResourcesRoutes {
  LANDING = '',
  DASHBOARD = 'dashboard',
  ACTIVEWILDFIREMAP = 'map',
  WILDFIRESLIST = 'list',
  RESOURCES = 'resources',
  ROF = 'reportOfFire',
  UNAUTHORIZED = 'unauthorized',
  SIGN_OUT = 'sign-out-page',
  ERROR_PAGE = 'error-page',
  ADMIN = 'admin',
  ADMIN_INCIDENT = 'incident',
  PUBLIC_INCIDENT = 'incidents',
  FULL_DETAILS = 'full-details',
  SAVED = 'saved',
  ADD_LOCATION = 'add-location',
  MORE = 'more',
  CONTACT_US = 'contact-us',
  SAVED_LOCATION = 'saved-location',
  WEATHER_DETAILS = 'weather-details',
}

export const FireCentres = [
  {
    code: '2',
    agol: '7',
    description: 'Cariboo Fire Centre',
    displayOrder: 1,
    effectiveDate: '1999-01-01',
    expiryDate: '9999-12-31',
    characterAlias: 'C',
  },
  {
    code: '50',
    agol: '2',
    description: 'Coastal Fire Centre',
    displayOrder: 2,
    effectiveDate: '1999-01-01',
    expiryDate: '9999-12-31',
    characterAlias: 'V',
  },
  {
    code: '25',
    agol: '5',
    description: 'Kamloops Fire Centre',
    displayOrder: 3,
    effectiveDate: '1999-01-01',
    expiryDate: '9999-12-31',
    characterAlias: 'K',
  },
  {
    code: '42',
    agol: '3',
    description: 'Northwest Fire Centre',
    displayOrder: 4,
    effectiveDate: '1999-01-01',
    expiryDate: '9999-12-31',
    characterAlias: 'R',
  },
  {
    code: '8',
    agol: '4',
    description: 'Prince George Fire Centre',
    displayOrder: 5,
    effectiveDate: '1999-01-01',
    expiryDate: '9999-12-31',
    characterAlias: 'G',
  },
  {
    code: '34',
    agol: '6',
    description: 'Southeast Fire Centre',
    displayOrder: 6,
    effectiveDate: '1999-01-01',
    expiryDate: '9999-12-31',
    characterAlias: 'N',
  },
];

export const FireZones = [
  { code: 3, alias: 1, description: 'Quesnel Zone', fireCentreOrgUnit: 2 },
  {
    code: 4,
    alias: 2,
    description: 'Central Cariboo Zone (Williams Lake)',
    fireCentreOrgUnit: 2,
  },
  {
    code: 5,
    alias: 3,
    description: 'Central Cariboo Zone (Horsefly)',
    fireCentreOrgUnit: 2,
  },
  {
    code: 6,
    alias: 4,
    description: '100 Mile House Zone',
    fireCentreOrgUnit: 2,
  },
  { code: 7, alias: 5, description: 'Chilcotin Zone', fireCentreOrgUnit: 2 },
  {
    code: 9,
    alias: 1,
    description: 'Prince George Zone',
    fireCentreOrgUnit: 8,
  },
  {
    code: 10,
    alias: 3,
    description: 'Robson Valley Zone',
    fireCentreOrgUnit: 8,
  },
  {
    code: 11,
    alias: 4,
    description: 'VanJam Zone (Vanderhoof)',
    fireCentreOrgUnit: 8,
  },
  {
    code: 12,
    alias: 5,
    description: 'VanJam Zone (Fort St. James)',
    fireCentreOrgUnit: 8,
  },
  { code: 13, alias: 6, description: 'Mackenzie Zone', fireCentreOrgUnit: 8 },
  {
    code: 14,
    alias: 7,
    description: 'Dawson Creek Zone',
    fireCentreOrgUnit: 8,
  },
  {
    code: 15,
    alias: 8,
    description: 'Fort St. John Zone',
    fireCentreOrgUnit: 8,
  },
  { code: 16, alias: 9, description: 'Fort Nelson Zone', fireCentreOrgUnit: 8 },
  {
    code: 26,
    alias: 1,
    description: 'Kamloops Zone (Clearwater)',
    fireCentreOrgUnit: 25,
  },
  {
    code: 27,
    alias: 2,
    description: 'Kamloops Zone (Kamloops)',
    fireCentreOrgUnit: 25,
  },
  {
    code: 28,
    alias: 3,
    description: 'Vernon Zone (Salmon Arm)',
    fireCentreOrgUnit: 25,
  },
  {
    code: 29,
    alias: 4,
    description: 'Vernon Zone (Vernon)',
    fireCentreOrgUnit: 25,
  },
  { code: 30, alias: 5, description: 'Penticton Zone', fireCentreOrgUnit: 25 },
  { code: 31, alias: 6, description: 'Merritt Zone', fireCentreOrgUnit: 25 },
  { code: 32, alias: 7, description: 'Lillooet Zone', fireCentreOrgUnit: 25 },
  { code: 35, alias: 1, description: 'Cranbrook Zone', fireCentreOrgUnit: 34 },
  { code: 36, alias: 2, description: 'Invermere Zone', fireCentreOrgUnit: 34 },
  { code: 37, alias: 4, description: 'Columbia Zone', fireCentreOrgUnit: 34 },
  { code: 38, alias: 5, description: 'Arrow Zone', fireCentreOrgUnit: 34 },
  { code: 39, alias: 6, description: 'Boundary Zone', fireCentreOrgUnit: 34 },
  {
    code: 40,
    alias: 7,
    description: 'Kootenay Lake Zone',
    fireCentreOrgUnit: 34,
  },
  {
    code: 43,
    alias: 1,
    description: 'Nadina Zone (Lakes)',
    fireCentreOrgUnit: 42,
  },
  {
    code: 44,
    alias: 2,
    description: 'Nadina Zone (Morice)',
    fireCentreOrgUnit: 42,
  },
  { code: 45, alias: 3, description: 'Bulkley Zone', fireCentreOrgUnit: 42 },
  {
    code: 46,
    alias: 4,
    description: 'Bulkley Zone (Kispiox)',
    fireCentreOrgUnit: 42,
  },
  {
    code: 47,
    alias: 5,
    description: 'Skeena Zone (Kalum)',
    fireCentreOrgUnit: 42,
  },
  {
    code: 48,
    alias: 8,
    description: 'Skeena Zone (North Coast)',
    fireCentreOrgUnit: 42,
  },
  { code: 49, alias: 9, description: 'Cassiar Zone', fireCentreOrgUnit: 42 },
  { code: 51, alias: 1, description: 'Fraser Zone', fireCentreOrgUnit: 50 },
  { code: 52, alias: 3, description: 'Pemberton Zone', fireCentreOrgUnit: 50 },
  {
    code: 53,
    alias: 5,
    description: 'Sunshine Coast Zone',
    fireCentreOrgUnit: 50,
  },
  {
    code: 54,
    alias: 6,
    description: 'South Island Zone',
    fireCentreOrgUnit: 50,
  },
  { code: 55, alias: 7, description: 'Mid Island Zone', fireCentreOrgUnit: 50 },
  {
    code: 56,
    alias: 8,
    description: 'North Island Mid Coast Zone (Campbell River)',
    fireCentreOrgUnit: 50,
  },
  {
    code: 57,
    alias: 9,
    description: 'North Island Mid Coast Zone (Port McNeill)',
    fireCentreOrgUnit: 50,
  },
  {
    code: 58,
    alias: 10,
    description: 'North Island Mid Coast Zone (Mid Coast)',
    fireCentreOrgUnit: 50,
  },
  {
    code: 59,
    alias: 11,
    description: 'Fraser Zone (Haida Gwaii)',
    fireCentreOrgUnit: 50,
  },
];

export function getPageInfoRequestForSearchState(
  searchState: any,
): PagingInfoRequest {
  return {
    pageRowCount: searchState.pageSize,
    pageNumber: searchState.pageIndex,
    sortColumn: searchState.sortParam,
    sortDirection: searchState.sortDirection,
    query: searchState.query,
  };
}

export const BOOTSTRAP_EFFECTS = new InjectionToken('Bootstrap Effects');

export function createInstances(...instances: any[]) {
  return instances;
}

export function bootstrapEffects(effects: Type<any>[], sources: EffectSources) {
  return () => {
    effects.forEach((effect) => sources.addEffects(effect));
  };
}

export function provideBootstrapEffects(effects: Type<any>[]): any {
  return [
    effects,
    {
      provide: BOOTSTRAP_EFFECTS,
      deps: effects,
      useFactory: createInstances,
    },
    {
      provide: APP_BOOTSTRAP_LISTENER,
      multi: true,
      useFactory: bootstrapEffects,
      deps: [[new Inject(BOOTSTRAP_EFFECTS)], EffectSources],
    },
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
  API_TIMESTAMP_WITH_SEP: 'Y-MM-DDTHH:mm:ss',
};

export function getElementInnerText(el: HTMLElement): string {
  return el.innerText;
}

export const hasValues = (obj) =>
  Object.values(obj).some((v) => v !== null && typeof v !== 'undefined');

export function isElementTruncated(el: HTMLElement): boolean {
  return el.offsetWidth < el.scrollWidth;
}

export const CONSTANTS = {
  NO_RECORDS_MESSAGE: 'No records to display.',
};

export function arrayEquals(a, b) {
  return (
    Array.isArray(a) &&
    Array.isArray(b) &&
    a.length === b.length &&
    a.every((val, index) => val === b[index])
  );
}

export const formatSort = (param: string, direction: SortDirection) =>
  param && direction ? `${param} ${direction}` : undefined;

export const WF_SNACKBAR_TYPES = {
  SUCCESS: 'success',
  ERROR: 'error',
  WARNING: 'warning',
  INFO: 'info',
  UPDATE: 'update',
};

export function convertFromTimestamp(date: string) {
  if (date) {
    return moment(date).format(DATE_FORMATS.simplifiedDateWithYear);
  }
}

export function convertToDateWithTime(date: string) {
  if (date) {
    return moment(date).format(DATE_FORMATS.simplifiedDateWithTime);
  }
}

export function convertToDateWithDayOfWeek(date: string) {
  if (date) {
    return (
      displayDay(date) +
      ' ' +
      moment(date).format(DATE_FORMATS.simplifiedDateWithYear)
    );
  }
}

export function convertToStageOfControlDescription(code: string) {
  switch (code) {
    case 'OUT_CNTRL':
      return 'Out Of Control';
    case 'HOLDING':
      return 'Being Held';
    case 'UNDR_CNTRL':
      return 'Under Control';
    case 'OUT':
      return 'Out';
    default:
      break;
  }
}

export function displayDay(date: string): string {
  if (date) {
    const result = moment(date).format('dddd');
    return (result.charAt(0).toUpperCase() + result.slice(1)).slice(0, 3); // abbreviate days of the week
  } else {
    return null;
  }
}

export function findFireCentreByName(fireCentreName: string): any {
  if (fireCentreName) {
    const nameResult = FireCentres.find(
      (fireCentre) =>
        fireCentre.description.toLowerCase().trim() ===
        fireCentreName.toLowerCase().trim() + '',
    );
    return nameResult ? nameResult : null;
  }
}

export function convertToFireCentreDescription(code: string): string {
  if (code) {
    const result = FireCentres.find(
      (fireCentre) => fireCentre.code === code + '',
    );
    // Some have the code from AGOL, which appears to be an objectid?
    const agolResult = FireCentres.find(
      (fireCentre) => fireCentre.agol === code + '',
    );
    const nameResult = FireCentres.find(
      (fireCentre) => fireCentre.description === code + '',
    );
    return result
      ? result.description
      : agolResult
        ? agolResult.description
        : nameResult
          ? nameResult.description
          : code;
  }
}

export function isMobileView() {
  return window.innerWidth < 768;
}

export async function snowPlowHelper(page: string, data: any = null) {
  const pageInfo = page;
  if (data) {
    window.snowplow('trackSelfDescribingEvent', {
      schema: 'iglu:ca.bc.gov.wfnews/action/jsonschema/1-0-0',
      data,
    });
  } else {
    window.snowplow('trackPageView', pageInfo);
  }
}

export function convertFireNumber(incident) {
  if (incident.incidentNumberLabelFull) {
    return incident.incidentNumberLabelFull;
  } else if (incident.incidentNumberLabel.length > 4) {
    return incident.incidentNumberLabel;
  } else {
    try {
      const fcAlias = FireCentres.find(
        (c) => c.code === incident.fireCentreCode,
      ).characterAlias;
      const zoneAlias = FireZones.find(
        (z) => z.code === incident.fireZoneUnitIdentifier,
      ).alias;
      const incidentNumber = String(incident.incidentNumberLabel).padStart(
        4,
        '0',
      );
      return fcAlias + zoneAlias + incidentNumber;
    } catch (err) {
      console.error(err);
      return 'Unknown Incident Label';
    }
  }
}

export function convertToYoutubeId(externalUri: string) {
  if (externalUri) {
    const regExp =
      /^.*((youtu.be\/)|(v\/)|(\/u\/\w\/)|(embed\/)|(watch\?))\??v?=?([^#&?]*).*/;
    const match = externalUri.match(regExp);
    if (match && match[7].length == 11) {
      return match[7];
    }
  }
}

export function hideOnMobileView() {
  return (
    (window.innerWidth < 768 && window.innerHeight < 1024) ||
    (window.innerWidth < 1024 && window.innerHeight < 768)
  );
}

export function convertToMobileFormat(dateString) {
  const formattedDate = moment(
    dateString,
    'dddd, MMMM D, YYYY [at] h:mm:ss A',
  ).format('MMMM D, YYYY');
  return formattedDate;
}

export function equalsIgnoreCase(text, other) {
  return text.localeCompare(other, undefined, { sensitivity: 'base' }) === 0;
}

export function currentFireYear() {
  const now = new Date();
  let currentFireYear = now.getFullYear();
  if (now.getMonth() < 3) {
    currentFireYear -= 1;
  }

  return currentFireYear;
}
export function convertToDateYear(date: string): string {
  // e.g. October 23, 2023
  if (date) {
    return moment(date).format('MMMM D, YYYY');
  } else {
    return null;
  }
}

export function convertToDateYearUtc(date: string): string {
  // e.g. October 23, 2023
  if (date) {
    return moment.utc(date).format('MMMM D, YYYY');
  } else {
    return null;
  }
}

export function getStageOfControlLabel(code: string) {
  if (code.toUpperCase().trim() === 'OUT') {
return 'Out';
} else if (code.toUpperCase().trim() === 'OUT_CNTRL') {
return 'Out of Control';
} else if (code.toUpperCase().trim() === 'HOLDING') {
return 'Being Held';
} else if (code.toUpperCase().trim() === 'UNDR_CNTRL') {
return 'Under Control';
} else {
return 'Unknown';
}
}

export function getStageOfControlIcon(code: string) {
  if (code) {
    if (code.toUpperCase().trim() === 'OUT') {
return 'bcws-activefires-publicview-inactive';
} else if (code.toUpperCase().trim() === 'OUT_CNTRL') {
return 'active-wildfires-out-of-control';
} else if (code.toUpperCase().trim() === 'HOLDING') {
return 'active-wildfires-holding';
} else if (code.toUpperCase().trim() === 'UNDR_CNTRL') {
return 'active-wildfires-under-control';
} else {
return 'Unknown';
}
  }
}

export function convertToDateTimeTimeZone(date) {
  // e.g. July 19, 2022 at 10:22 a.m. PST
  const updateOptions: Intl.DateTimeFormatOptions = {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  };
  let convertedDate: string;
  convertedDate = date
    ? new Date(date).toLocaleTimeString('en-US', updateOptions) + ' PST'
    : 'Pending';
  if (convertedDate !== 'Pending') {
    // add full stops and lowercase
    convertedDate = convertedDate.replace('AM', 'a.m.');
    convertedDate = convertedDate.replace('PM', 'p.m.');
  }
  return convertedDate;
}

export function convertToDateTime(date) {
  // e.g. July 19, 2022 at 10:22 am
  const updateOptions: Intl.DateTimeFormatOptions = {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  };
  let convertedDate: string;
  convertedDate = date
    ? new Date(date).toLocaleTimeString('en-US', updateOptions)
    : 'Pending';
  if (convertedDate !== 'Pending') {
    // add full stops and lowercase
    convertedDate = convertedDate.replace('AM', 'am');
    convertedDate = convertedDate.replace('PM', 'pm');
  }
  return convertedDate;
}

export function setDisplayColor(stageOfControlCode: string) {
  let colorToDisplay;
  switch (stageOfControlCode) {
    case 'OUT_CNTRL':
      colorToDisplay = '#FF0000';
      break;
    case 'HOLDING':
      colorToDisplay = '#ffff00';
      break;
    case 'UNDR_CNTRL':
      colorToDisplay = '#98E600';
      break;
    case 'OUT':
      colorToDisplay = '#999999';
      break;
    default:
      colorToDisplay = 'white';
  }
  return colorToDisplay;
}

export function getResponseTypeDescription(code: string) {
  if (code === 'MONITOR') {
return 'When a fire is being monitored, this means BC Wildfire Service is observing and analyzing the fire but it\'s not immediately suppressed. It may be allowed to burn to achieve ecological or resource management objectives and is used on remote fires that do not threaten values.';
} else if (code === 'MODIFIED') {
return 'During a modified response, a wildfire is managed using a combination of techniques with the goal to minimize costs and damage while maximizing ecological benefits from the fire. This response method is used when there is no immediate threat to values.';
} else if (code === 'FULL') {
return 'The BC Wildfire Service uses a full response when there is threat to public safety and/or property and other values, such as infrastructure or timber. Immediate action is taken. During a full response, a wildfire is suppressed and controlled until it is deemed "out".';
}
}

export function getResponseTypeTitle(code: string) {
  if (code === 'MONITOR') {
return 'Monitored Response';
} else if (code === 'MODIFIED') {
return 'Modified Response';
} else if (code === 'FULL') {
return 'Full Response';
}
}

export function checkLayerVisible(layerId: string | string[]): boolean {
  const smk = window['SMK'];
  let layerFound = false;
  // check for any of the layers being present in the group.
  for (const smkMapRef in smk.MAP) {
    if (Object.hasOwn(smk.MAP, smkMapRef)) {
      const smkMap = getActiveMap(smk);
      if (smkMap?.$viewer?.visibleLayer) {
        if (Array.isArray(layerId)) {
          let result = false;
          for (const layer of layerId) {
            result = Object.hasOwn(smkMap?.$viewer?.visibleLayer, layer);
            if (result) {
break;
}
          }
          layerFound = result;
        } else {
          // only a single layer, so turf the panel if it isnt turned on
          layerFound =
            smkMap?.$viewer?.visibleLayer &&
            Object.hasOwn(smkMap?.$viewer?.visibleLayer, layerId);
        }
        // and if the smk layers haven't loaded yet, just return false
      }
    }
  }

  return layerFound;
}

export function convertToStandardDateString(value: string) {
  if (value) {
    return moment(value).format('MMM Do YYYY h:mm:ss a');
  }
}

export function readableDate(date) {
  // e.g. Tue Dec 05 2023
  let arr = date.slice(0, 4);
  const year = arr;

  arr = date.slice(4, 6);
  const month = arr;

  arr = date.slice(6, 8);
  const day = arr;

  // Months are zero-based indexes in JS Date, so remember to decrement
  const formattedDate = new Date(year, month - 1, day);
  return formattedDate.toDateString();
}

export function readableHour(hourString) {
  //e.g. 2023-10-04 at 24:00
  const year = hourString.slice(0, 4);
  const day = hourString.slice(4, 6);
  const month = hourString.slice(6, 8);
  const hour = hourString.slice(-2);

  return year + '-' + day + '-' + month + ' at ' + hour + ':00';
}

export function getActiveMap(smk: any | null = null) {
  const SMK = smk || window['SMK'];
  const key = Object.keys(SMK.MAP)[Object.keys(SMK.MAP).length - 1];
  if (key) {
    const map = SMK.MAP[key];
    map.$viewer.map._layersMaxZoom = 20;
    return map;
  }
  // Sort of a fail-safe if the object doesn't have a key to force-retry with the window SMK object
  else {
return window['SMK'].MAP[
      Object.keys(window['SMK'].MAP)[Object.keys(window['SMK'].MAP).length - 1]
    ];
}
}

export function openLink(link: string) {
  window.open(
    this.appConfigService.getConfig().externalAppConfig[
      link
    ] as unknown as string,
    '_blank',
  );
}

export function displayDangerRatingDes(danger) {
  switch (danger) {
    case 'Extreme':
      return 'Extremely dry forest fuels and the fire risk is very serious. New fires will start easily, spread rapidly, and challenge fire suppression efforts.';
    case 'High':
      return 'Forest fuels are very dry and the fire risk is serious.  Extreme caution must be used in any forest activities.';
    case 'Moderate':
      return 'Forest fuels are drying and there is an increased risk of surface fires starting. Carry out any forest activities with caution.';
    case 'Low':
      return 'Fires may start easily and spread quickly but there will be minimal involvement of deeper fuel layers or larger fuels.';
    case 'Very Low':
      return 'Dry forest fuels are at a very low risk of catching fire.';
  }
}

export function getCurrentCondition(
  conditions: WeatherStationConditions,
): WeatherHourlyCondition {
  if (!conditions || !conditions.hourly) {
return;
}
  return conditions.hourly.find(function(hc) {
    return hc.temp != null;
  });
}

export const isAndroidViaNavigator = () => navigator.platform.includes('Linux') || navigator.platform.includes('Android');
