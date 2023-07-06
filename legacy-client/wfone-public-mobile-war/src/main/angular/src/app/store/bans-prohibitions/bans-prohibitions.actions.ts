import {Action} from "@ngrx/store";

import {ErrorState} from "../application/application.state";
import {VmBanProhibition} from "../../conversion/models";

export const LOAD_CURRENT_BANS_PROHIBITIONS = 'LOAD_CURRENT_BANS_PROHIBITIONS';
export const LOAD_CURRENT_BANS_PROHIBITIONS_SUCCESS = 'LOAD_CURRENT_BANS_PROHIBITIONS_SUCCESS';
export const LOAD_CURRENT_BANS_PROHIBITIONS_ERROR = 'LOAD_CURRENT_BANS_PROHIBITIONS_ERROR';

// tslint:disable-next-line:no-empty-interface
export interface LoadCurrentBansProhibitionsAction extends Action {
}

export interface LoadCurrentBansProhibitionsSuccessAction extends Action {
    payload: {
        value: VmBanProhibition[];
    };
}

export interface LoadCurrentBansProhibitionsErrorAction extends Action {
    payload: {
        error: ErrorState;
    };
}


export function loadCurrentBansProhibitions(): LoadCurrentBansProhibitionsAction {
    return {
        type: LOAD_CURRENT_BANS_PROHIBITIONS
    };
}

export function loadCurrentBansProhibitionsSuccess(value: VmBanProhibition[]): LoadCurrentBansProhibitionsSuccessAction {
    return {
        type: LOAD_CURRENT_BANS_PROHIBITIONS_SUCCESS,
        payload: {
            value
        }
    };
}

export function loadCurrentBansProhibitionsError(error: ErrorState): LoadCurrentBansProhibitionsErrorAction {
    return {
        type: LOAD_CURRENT_BANS_PROHIBITIONS_ERROR,
        payload: {
            error
        }
    };
}
