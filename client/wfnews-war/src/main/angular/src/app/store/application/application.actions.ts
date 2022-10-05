import {Action} from '@ngrx/store';

export const SET_FORM_STATE_UNSAVED = 'SET_FORM_STATE_UNSAVED';

export class SetFormStateUnsavedAction implements Action {
    type = SET_FORM_STATE_UNSAVED;
    payload: {
        componentId: string;
        isUnsaved: boolean;
    };
}

export function setFormStateUnsaved(componentId: string, isUnsaved: boolean): SetFormStateUnsavedAction {
    return {
        type: SET_FORM_STATE_UNSAVED,
        payload: {
            componentId,
            isUnsaved
        }
    };
}
