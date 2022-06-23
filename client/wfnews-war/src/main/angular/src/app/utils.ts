import { APP_BOOTSTRAP_LISTENER, Inject, InjectionToken, Type } from '@angular/core';
import { EffectSources } from '@ngrx/effects';
import { FilterConfig, FilterOption, IncidentType, IncidentTypeAgencyAssist, IncidentTypeFieldActivity, IncidentTypeWithStatus, SearchActions } from "@wf1/core-ui";
import { SimpleWildfireIncidentResource } from "@wf1/incidents-rest-api";
import { INCIDENT_TYPE_CODES } from "./constants";
import { CodeData, Option } from "./store/code-data/code-data.state";

const BOOTSTRAP_EFFECTS = new InjectionToken('Bootstrap Effects');

export const CODE_TABLE_CACHE = {

}

export function bootstrapEffects(effects: Type<any>[], sources: EffectSources) {
    return () => {
        effects.forEach(effect => sources.addEffects(effect));
    };
}

export function createInstances(...instances: any[]) {
    return instances;
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

export function isEmpty(obj) {
    for (var key in obj) {
        if (obj.hasOwnProperty(key))
            return false;
    }
    return true;
}

export function copyToClipboard(str) {
    const el = document.createElement('textarea');
    el.value = str;
    document.body.appendChild(el);
    el.select();
    document.execCommand('copy');
    document.body.removeChild(el);
}

export interface ColumnConfig {
    def: string;
    label: string;
    type: "number" | "string" | "datetime" | "boolean" | "options";
    editable: boolean;
    index: number;
    options?: any[];
    sortable?: boolean;
}

export function convertToPreferenceResource(componentId: string, state: any) {

    return {
        applicationCode: "WFIM",
        componentId: componentId,
        name: "most.recently.used",
        value: JSON.stringify(state),
    };
}

//code data utils
export const sortByDisplayOrder = (a: CodeData, b: CodeData) => a.displayOrder - b.displayOrder;

export const sortByDescription = function (a, b) {
    var nameA = a.description.toUpperCase(); // ignore upper and lowercase
    var nameB = b.description.toUpperCase(); // ignore upper and lowercase
    if (nameA < nameB) {
        return -1;
    }
    if (nameA > nameB) {
        return 1;
    }

    // names must be equal
    return 0;
}

export function getCodeDataForCode(codeStr: string, options: (CodeData | Option)[]) {
    if (codeStr && options) {
        let code = options.find(obj => obj.code === codeStr);
        return code ? code : null;
    } else {
        return null;
    }

}

export function getDescriptionForCodeData(value: CodeData | Option) {
    return value ? value.description : null;
}

export function getDescriptionForCode(codeStr: string, options: (CodeData | Option)[]) {
    return getDescriptionForCodeData(getCodeDataForCode(codeStr, options));
}

export function getCodeOptions(codeType: string): ((CodeData | Option)[]) {
    let codes = CODE_TABLE_CACHE['codeTables'] ? CODE_TABLE_CACHE['codeTables'][codeType] : [];

    if (codeType == 'WEATHER_STATION_POINT_CODE') {
        return codes.sort(sortByDescription);
    } else {
        return codes.sort(sortByDisplayOrder);
    }
}

export function getOrgCodeOptions(codeType: string): ((CodeData | Option)[]) {
    let codes = CODE_TABLE_CACHE['orgCodeTables'] ? CODE_TABLE_CACHE['orgCodeTables'][codeType] : [];
    return codes.sort(sortByDisplayOrder);
}

export function getOptionsCodeHierarchyIndex(codeType: string): ((CodeData | Option)[])[] {
    let codes = CODE_TABLE_CACHE['orgCodeHierarchyIndex'] ? CODE_TABLE_CACHE['orgCodeHierarchyIndex'][codeType] : [];
    return codes;
}

export function getOptionsCodeHierarchyIndexForCode(codeType: string, code: string): ((CodeData | Option)[]) {
    let codes = getOptionsCodeHierarchyIndex(codeType);
    return codes && codes[code] ? codes[code].sort(sortByDisplayOrder) : undefined;
}

export function getCodeLabel(table: string, value: string): string {
    let codes = getCodeOptions(table);
    return getDescriptionForCode(value, codes);
}

export function formatFilter(label: string, param: string, options: FilterOption[], type?: string): FilterConfig {
    return { label, param, options, type };
}

export function formatFilterOptions(codes: (CodeData | Option)[]): FilterOption[] {
    if (!codes) {
        return [];
    }

    return codes.map(option => ({ label: option.description, value: option.code }));
}

export function filterCodeOptionsByCode(options, codesToInclude) {

    const result = options.filter(option => codesToInclude.find(code => option.code === code));
    return result;

}

export function getIncidentStatusOptions() {

    let options = getCodeOptions('INCIDENT_STATUS_CODE');
    const optionsToInclude = ['Active', 'Completed'];

    const result = filterCodeOptionsByCode(options, optionsToInclude);
    return result;

}

export function getZoneOptions(store, componentId, filters, filterOptions, firstLoad) {
    let allZones = getOrgCodeOptions('ZONE_CODE');

    const zoneOrgUnitIndex = filterOptions.findIndex((value) => value.param === 'zoneOrgUnitIdentifier');
    if (filters && filters.fireCentreOrgUnitIdentifier && filters.fireCentreOrgUnitIdentifier.length > 0 ) {
        const listZoneIds = (acc, centreId) => [...acc, ...getOptionsCodeHierarchyIndexForCode('FIRE_CENTRE_ZONE_XREF', centreId)];
        const zoneIdsToDisplay = filters.fireCentreOrgUnitIdentifier.reduce(listZoneIds, []);
        const zones = allZones ? allZones.filter(zone => zoneIdsToDisplay.includes(zone.code)) : [];
        if (zones && zones.length !== filterOptions[zoneOrgUnitIndex].options.length) {
            if (!firstLoad && filters.zoneOrgUnitIdentifier && filters.zoneOrgUnitIdentifier.length > 0) {
                if (!filters.zoneOrgUnitIdentifier.every((zone) => zoneIdsToDisplay.includes(zone))) {
                    setTimeout(() => {
                        store.dispatch(new SearchActions.ClearFilterAction('zoneOrgUnitIdentifier', componentId));
                    }, 250);
                }
            }
        }
        return zones;
    } else {
        return allZones
    }
}

export function convertToBoolean(input: string): boolean | undefined {
    try {
        return JSON.parse(input);
    }
    catch (e) {
        return undefined;
    }
}

export function getIncidentIcon(incidentType) {
    if (incidentType === 'AGY_ASSIST') { return 'incident-agency-assist'; };
    if (incidentType === 'FLD_TRAIN') { return 'incident-field-activity'; };
    if (isIncidentTypeWithStatus(incidentType)) { return 'incident-with-status'; }

    return 'incident';
}

export function convertStageControlToColourCode(stageOfControlCode: string): IncidentType {
    if (stageOfControlCode === 'OUT_CNTRL') { return IncidentType.OUT_OF_CONTROL };
    if (stageOfControlCode === 'HOLDING') { return IncidentType.BEING_HELD };
    if (stageOfControlCode === 'UNDR_CNTRL') { return IncidentType.UNDER_CONTROL };
    if (stageOfControlCode === 'OUT') { return IncidentType.OUT };

    return IncidentType.NOT_SET;
}

export function convertIncidentStatusToColourCode(statusCode: string): IncidentTypeWithStatus {
    if (statusCode === 'Active') { return IncidentTypeWithStatus.ACTIVE };
    if (statusCode === 'Completed') { return IncidentTypeWithStatus.COMPLETED };
}

export function convertAgencyAssistIncidentStatusToColourCode(statusCode: string): IncidentTypeAgencyAssist {
    if (statusCode === 'Active') { return IncidentTypeAgencyAssist.ACTIVE };
    if (statusCode === 'Completed') { return IncidentTypeAgencyAssist.COMPLETED };
}

export function convertFieldActivityIncidentStatusToColourCode(statusCode: string): IncidentTypeFieldActivity {
    if (statusCode === 'Active') { return IncidentTypeFieldActivity.ACTIVE };
    if (statusCode === 'Completed') { return IncidentTypeFieldActivity.COMPLETED };
}

export function convertIncidentToColourCode(incident: SimpleWildfireIncidentResource):
    IncidentType | IncidentTypeWithStatus | IncidentTypeAgencyAssist | IncidentTypeFieldActivity {

    if (incident.incidentTypeCode === 'AGY_ASSIST') {
        return convertAgencyAssistIncidentStatusToColourCode(incident.incidentStatusCode);
    }

    if (incident.incidentTypeCode === 'FLD_TRAIN') {
        return convertFieldActivityIncidentStatusToColourCode(incident.incidentStatusCode);
    }

    if (isIncidentTypeWithStatus(incident.incidentTypeCode)) {
        return convertIncidentStatusToColourCode(incident.incidentStatusCode);
    }

    return convertStageControlToColourCode(incident.stageOfControlCode);
}

export function durationToExpire(duration) {
    if (duration.milliseconds() <= 0) {
        return "Expired";
    } else {
        return duration.humanize();
    }
}

export function isIncidentTypeWithStageOfControl(incidentTypeCode) {

    if (incidentTypeCode === INCIDENT_TYPE_CODES.FIRE
        || incidentTypeCode === INCIDENT_TYPE_CODES.NUISANCE_FIRE) {
        return true;
    }

    if (incidentTypeCode === INCIDENT_TYPE_CODES.SMOKE_CHASE
        || incidentTypeCode === INCIDENT_TYPE_CODES.DUPLICATE
        || incidentTypeCode === INCIDENT_TYPE_CODES.ENTERED_IN_ERROR
        || incidentTypeCode === INCIDENT_TYPE_CODES.OTHER
        || incidentTypeCode === INCIDENT_TYPE_CODES.AGENCY_ASSIST
        || incidentTypeCode === INCIDENT_TYPE_CODES.FIELD_ACTIVITY) {
        return false;
    }

    return false;
}

export function isIncidentTypeWithStatus(incidentTypeCode) {

    if (incidentTypeCode === INCIDENT_TYPE_CODES.FIRE
        || incidentTypeCode === INCIDENT_TYPE_CODES.NUISANCE_FIRE) {
        return false;
    }

    if (incidentTypeCode === INCIDENT_TYPE_CODES.SMOKE_CHASE
        || incidentTypeCode === INCIDENT_TYPE_CODES.DUPLICATE
        || incidentTypeCode === INCIDENT_TYPE_CODES.ENTERED_IN_ERROR
        || incidentTypeCode === INCIDENT_TYPE_CODES.OTHER
        || incidentTypeCode === INCIDENT_TYPE_CODES.AGENCY_ASSIST
        || incidentTypeCode === INCIDENT_TYPE_CODES.FIELD_ACTIVITY) {
        return true;
    }

    return false;
}
