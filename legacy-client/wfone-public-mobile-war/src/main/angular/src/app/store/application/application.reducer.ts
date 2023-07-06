import {Action} from "@ngrx/store";
import {ApplicationState, getDefaultApplicationState,} from "./application.state";
import {
    CLEAR_NEAR_ME_HIGHLIGHT,
    LOAD_WELCOME,
    SET_NEAR_ME_HIGHLIGHT,
    SetNearMeHighlightAction,
} from "./application.actions";


export function applicationReducer(state: ApplicationState = getDefaultApplicationState(), action: Action): ApplicationState {
    switch (action.type) {


        case LOAD_WELCOME: {
            return state;
        }

        case SET_NEAR_ME_HIGHLIGHT: {
            let typedAction = <SetNearMeHighlightAction>action;
            return {...state, landingState:{currentNearMeHighlight:typedAction.payload.nearMeItem, currentBackRoute: typedAction.payload.backRoute}};
        }

        case CLEAR_NEAR_ME_HIGHLIGHT: {
            return {...state, landingState:{currentNearMeHighlight:undefined, currentBackRoute: undefined}};
        }

        default: {
            return state;
        }
    }
}
