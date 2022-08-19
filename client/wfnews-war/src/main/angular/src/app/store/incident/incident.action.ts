import { Action } from "@ngrx/store";
import { WildfireIncidentResource } from "@wf1/incidents-rest-api";
import { ErrorState } from "../application/application.state";

export const GET_INCIDENT = "GET_INCIDNT";
export const GET_INCIDENT_SUCCESS = "GET_INCIDENT_SUCCESS";
export const GET_INCIDENT_ERROR = "GET_INCIDENT_ERROR";

export interface GetIncidentAction extends Action {
    payload: {
        fireYear: string,
        incidentSequenceNumber: string
    }
}

export interface GetIncidentSuccessAction extends Action {
    payload: {
        incident: WildfireIncidentResource;
    }
}

export interface GetIncidentErrorAcion extends Action {
    payload: {
        error: ErrorState;
    }
}

export function getIncident(fireYear: string, incidentSequenceNumber: string): GetIncidentAction {
    return {
        type: GET_INCIDENT,
        payload: {
            fireYear,
            incidentSequenceNumber
        }
    }
}

export function getIncidentSuccess(incident: WildfireIncidentResource): GetIncidentSuccessAction {
    return {
        type: GET_INCIDENT_SUCCESS,
        payload: {
            incident
        }
    }
}

export function getIncidentError(error: ErrorState): GetIncidentErrorAcion {
    return {
        type: GET_INCIDENT_ERROR,
        payload: {
            error
        }
    }
}