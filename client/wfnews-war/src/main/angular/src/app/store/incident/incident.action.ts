import { Action } from '@ngrx/store';
import { IncidentCauseResource, WildfireIncidentResource } from '@wf1/incidents-rest-api';
import { ErrorState } from '../application/application.state';

export const GET_INCIDENT = 'GET_INCIDNT';
export const GET_INCIDENT_SUCCESS = 'GET_INCIDENT_SUCCESS';
export const GET_INCIDENT_ERROR = 'GET_INCIDENT_ERROR';

export const GET_INCIDENT_CAUSE = 'GET_INCIDNT';
export const GET_INCIDENT_CAUSE_SUCCESS = 'GET_INCIDENT_CAUSE_SUCCESS';
export const GET_INCIDENT_CAUSE_ERROR = 'GET_INCIDENT_CAUSE_ERROR';

export interface GetIncidentAction extends Action {
    payload: {
        fireYear: string;
        incidentSequenceNumber: string;
    };
}

export interface GetIncidentSuccessAction extends Action {
    payload: {
        incident: WildfireIncidentResource;
    };
}

export interface GetIncidentErrorAcion extends Action {
    payload: {
        error: ErrorState;
    };
}

export interface GetIncidentCauseAction extends Action {
    payload: {
        fireYear: string;
        incidentSequenceNumber: string;
    };
}

export interface GetIncidentCauseSuccessAction extends Action {
    payload: {
        incidentCause: IncidentCauseResource;
    };
}

export interface GetIncidentCauseErrorAcion extends Action {
    payload: {
        error: ErrorState;
    };
}

export function getIncident(fireYear: string, incidentSequenceNumber: string): GetIncidentAction {
    return {
        type: GET_INCIDENT,
        payload: {
            fireYear,
            incidentSequenceNumber
        }
    };
}

export function getIncidentSuccess(incident: WildfireIncidentResource): GetIncidentSuccessAction {
    return {
        type: GET_INCIDENT_SUCCESS,
        payload: {
            incident
        }
    };
}

export function getIncidentError(error: ErrorState): GetIncidentErrorAcion {
    return {
        type: GET_INCIDENT_ERROR,
        payload: {
            error
        }
    };
}

export function getIncidentCause(fireYear: string, incidentSequenceNumber: string): GetIncidentCauseAction {
    return {
        type: GET_INCIDENT_CAUSE,
        payload: {
            fireYear,
            incidentSequenceNumber
        }
    };
}

export function getIncidentCauseSuccess(incidentCause: IncidentCauseResource): GetIncidentCauseSuccessAction {
    return {
        type: GET_INCIDENT_CAUSE_SUCCESS,
        payload: {
            incidentCause
        }
    };
}

export function getIncidentCauseError(error: ErrorState): GetIncidentCauseErrorAcion {
    return {
        type: GET_INCIDENT_CAUSE_ERROR,
        payload: {
            error
        }
    };
}
