import { Action } from "@ngrx/store";
import { ErrorState, PagingInfoRequest } from "../application/application.state";

export const GET_INCIDENTS = "GET_INCIDENTS";
export const GET_INCIDENTS_SUCCESS = "GET_INCIDENTS_SUCCESS";
export const GET_INCIDENTS_ERROR = "GET_INCIDENTS_ERROR";

export interface GetIncidentsAction extends Action {
    componentId: string;
    payload : {
        pageInfoRequest: PagingInfoRequest,
        filters: {
            [param: string]: any[];
        }
    }
}

export interface GetIncidentsSuccessAction extends Action {
    componentId: string;
    payload: {
        value: any // need a vm model
    }
}

export interface GetIncidentsSuccessErrorAction extends Action {
    componentId: string;
    payload: {
        error: ErrorState;
    }
}

export function getIncidents(componentId: string, pageInfoRequest?: PagingInfoRequest, selectedFireStatus?: string): GetIncidentsAction {
    let filters = {};
    console.log('IM here')
    return {
        type: GET_INCIDENTS,
        componentId: componentId,
        payload: {
            pageInfoRequest,
            filters: filters
        }
    }
}

export function getIncidentsSuccess(componentId: string, value: any): GetIncidentsSuccessAction {
    return {
        type: GET_INCIDENTS_SUCCESS,
        componentId: componentId,
        payload: {
            value
        }
    }
}

export function getIncidentsError(componentId: string, error: ErrorState): GetIncidentsSuccessErrorAction {
    return {
        type: GET_INCIDENTS_ERROR,
        componentId: componentId,
        payload: {
            error
        }
    }
}