import { Action } from '@ngrx/store';
import { LabeledAction } from '..';
import {
  ErrorState,
  PagingInfoRequest,
} from '../application/application.state';

export const SEARCH_WILDFIRES = 'SEARCH_WILDFIRES';
export const SEARCH_WILDFIRES_SUCCESS = 'SEARCH_WILDFIRES_SUCCESS';
export const SEARCH_WILDFIRES_ERROR = 'SEARCH_WILDFIRES_ERROR';
export interface SearchWildfiresAction extends LabeledAction {
  componentId: string;
  callback: Function;
  payload: {
    pageInfoRequest: PagingInfoRequest;
    filters: {
      [param: string]: any[];
    };
    lat: number;
    long: number;
    radius: number;
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

export function searchWildfires(
  componentId: string,
  pageInfoRequest: PagingInfoRequest,
  selectedFireCentre: string,
  fireOfNoteInd: boolean,
  stageOfControlList: string[],
  newFires: boolean,
  bbox: string,
  displayLabel: string,
  lat: number,
  long: number,
  radius: number,
  callback: Function | null = null,
): SearchWildfiresAction {
  const filters = {};
  filters['fireCentreCode'] = selectedFireCentre
    ? selectedFireCentre
    : undefined;
  filters['fireOfNote'] = fireOfNoteInd ? fireOfNoteInd : undefined;
  filters['stageOfControlList'] = stageOfControlList ? stageOfControlList : [];
  filters['newFires'] = newFires ? newFires : false;
  filters['bbox'] = bbox ? bbox : undefined;

  return {
    type: SEARCH_WILDFIRES,
    componentId,
    displayLabel,
    callback: callback ? callback : () => {},
    payload: {
      pageInfoRequest,
      filters,
      lat,
      long,
      radius,
    },
  };
}

export function searchWildfiresSuccess(
  componentId: string,
  value: any,
): SearchWildfiresSuccessAction {
  return {
    type: SEARCH_WILDFIRES_SUCCESS,
    componentId,
    payload: {
      value,
    },
  };
}

export function searchWildfiresError(
  componentId: string,
  error: ErrorState,
): SearchWildfiresErrorAction {
  return {
    type: SEARCH_WILDFIRES_ERROR,
    componentId,
    payload: {
      error,
    },
  };
}
