import {Action} from "@ngrx/store";
import {BansProhibitionsState, getDefaultBanProhibitionsState} from "./bans-prohibitions.state";
import {
    LOAD_CURRENT_BANS_PROHIBITIONS_SUCCESS,
    LoadCurrentBansProhibitionsSuccessAction
} from "./bans-prohibitions.actions";

export function bansProhibitionsReducer(state: BansProhibitionsState = getDefaultBanProhibitionsState(), action: Action): BansProhibitionsState {
    switch (action.type) {

        case LOAD_CURRENT_BANS_PROHIBITIONS_SUCCESS: {
            const typedAction = <LoadCurrentBansProhibitionsSuccessAction>action;
            return {...state , currentBansProhibitions: typedAction.payload.value};
        }

        default: {
            return state;
        }
    }
}
