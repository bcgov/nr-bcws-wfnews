import { Action } from "@ngrx/store";
import { WildfireIncidentResource } from "@wf1/incidents-rest-api";
import { LabeledAction } from "..";
import { ErrorState, PagingInfoRequest } from "../application/application.state";

export const SEARCH_WILDFIRES = "SEARCH_WILDFIRES";
export const SEARCH_WILDFIRES_SUCCESS = "SEARCH_WILDFIRES_SUCCESS";
export const SEARCH_WILDFIRES_ERROR = "SEARCH_WILDFIRES_ERROR";
export interface SearchWildfiresAction extends LabeledAction {
    componentId: string;
    payload: {
        pageInfoRequest: PagingInfoRequest,
        filters: {
            [param: string]: any[];
        }
    };
}

export interface SearchWildfiresSuccessAction extends Action {
    componentId: string;
    payload: {
        value: any;
    };
}

export interface SearchWildfiresErrorAction extends Action {
    componentId: string;
    payload: {
        error: ErrorState;
    };
}


export function searchWildfires(componentId: string,
    pageInfoRequest: PagingInfoRequest,
    selectedFireCentre: string,
    fireOfNotePublishedInd: boolean,
    displayLabel: string): SearchWildfiresAction {
        let filters = {};
        filters["selectedFireCentreCode"] = selectedFireCentre ? [selectedFireCentre] : [];
        filters["selectedFireOfNotePublishedInd"] = fireOfNotePublishedInd? [fireOfNotePublishedInd] : []

        return {
            type: SEARCH_WILDFIRES,
            componentId: componentId,
            displayLabel: displayLabel,
            payload: {
                pageInfoRequest,
                filters: filters
            }
        };
}

export function searchWildfiresSuccess(componentId: string, value: any): SearchWildfiresSuccessAction{
    return {
        type: SEARCH_WILDFIRES_SUCCESS,
        componentId: componentId,
        payload: {
            value
        }
    };
}

export function searchWildfiresError(componentId: string, error: ErrorState): SearchWildfiresErrorAction {
    return {
        type: SEARCH_WILDFIRES_ERROR,
        componentId: componentId,
        payload: {
            error
        }
    };
}

