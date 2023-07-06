import {Action} from "@ngrx/store";


export const LOAD_FAKE_SUCCESS = 'LOAD_FAKE_SUCCESS';

export interface LoadFakeSuccessAction extends Action {
    payload: {};
}

export function loadFakeSuccess(): LoadFakeSuccessAction {
    return {
        type: LOAD_FAKE_SUCCESS,
        payload: {}
    };
}
