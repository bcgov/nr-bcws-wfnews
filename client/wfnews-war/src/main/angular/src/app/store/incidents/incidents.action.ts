import { Action } from '@ngrx/store';
import { LabeledAction } from '..';
import { ErrorState, PagingInfoRequest } from '../application/application.state';

export const SEARCH_INCIDENTS = 'SEARCH_INCIDENTS';
export const SEARCH_INCIDENTS_SUCCESS = 'SEARCH_INCIDENTS_SUCCESS';
export const SEARCH_INCIDENTS_ERROR = 'SEARCH_INCIDENTS_ERROR';
export interface SearchIncidentsAction extends LabeledAction {
    componentId: string;
    payload: {
        pageInfoRequest: PagingInfoRequest;
        filters: {
            [param: string]: any[];
        };
    };
}

export interface SearchIncidentsSuccessAction extends Action {
    componentId: string;
    payload: {
        value: any;
    };
}

export interface SearchIncidentsErrorAction extends Action {
    componentId: string;
    payload: {
        error: ErrorState;
    };
}


export function searchIncidents(componentId: string,
    pageInfoRequest: PagingInfoRequest,
    selectedFireCentre: string,
    fireOfNotePublishedInd: boolean,
    displayLabel: string): SearchIncidentsAction {
        const filters = {};
        filters['selectedFireCentreCode'] = selectedFireCentre ? [selectedFireCentre] : [];
        filters['selectedFireOfNotePublishedInd'] = fireOfNotePublishedInd? [fireOfNotePublishedInd] : [];

        return {
            type: SEARCH_INCIDENTS,
            componentId,
            displayLabel,
            payload: {
                pageInfoRequest,
                filters
            }
        };
}

export function searchIncidentsSuccess(componentId: string, value: any): SearchIncidentsSuccessAction{
    return {
        type: SEARCH_INCIDENTS_SUCCESS,
        componentId,
        payload: {
            value
        }
    };
}

export function SearchIncidentsError(componentId: string, error: ErrorState): SearchIncidentsErrorAction {
    return {
        type: SEARCH_INCIDENTS_ERROR,
        componentId,
        payload: {
            error
        }
    };
}

