import {
    LoadUserPrefsSuccessAction,
    SearchAndConfigActionTypes,
    UpdateColumnConfigAction
} from "./search-and-config.actions";
import { searchReducer, SearchState } from "@wf1/core-ui";
import { isMyComponent } from "../im/im.state";
import { SearchStateAndConfig } from "../index";
import { ROFActionTypes, UpdateRofAudibleAlert } from "../rof/rof.actions";


export function searchAndConfigReducer(state: SearchState, action) {
    let searchState = searchReducer(state, action);
    switch (action.type) {
        case SearchAndConfigActionTypes.UPDATE_COLUMN_CONFIG: {
            let typedAction = <UpdateColumnConfigAction>action;
            if (!isMyComponent(searchState, action.componentId)) {
                return searchState;
            }
            return { ...searchState, columns: typedAction.payload.value };
        }

        case SearchAndConfigActionTypes.LOAD_USER_PREFS_SUCCESS: {
            let typedAction = <LoadUserPrefsSuccessAction>action;
            let pref = typedAction.payload.value;
            let searchConfig: SearchStateAndConfig = null;
            if (pref && pref["setName"] && state && pref["setName"] == state.componentId) {
                searchConfig = JSON.parse(pref['value']);
            }

            if (searchConfig == null) {
                return searchState;
            } else {
                return { ...searchConfig };
            }

        }

        case ROFActionTypes.UPDATE_ROF_AUDIBLE_ALERT: {
            let typedAction = <UpdateRofAudibleAlert>action;
            if (!isMyComponent(state, action.componentId)) {
                return state;
            }
            return {
                ...state, audibleAlert: {
                    enableUnacknowledged: typedAction.enableUnacknowledged,
                    enableReceivedFromPM: typedAction.enableReceivedFromPM,
                    selectedZoneIds: typedAction.selectedZoneIds
                }
            };
        }

        default: {
            return searchState;
        }
    }
}
