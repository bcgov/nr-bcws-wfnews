import { Action } from "@ngrx/store";
import { SearchWildfiresSuccessAction, SEARCH_WILDFIRES_SUCCESS } from "./wildfiresList.action";
import { getDefaultWildfiresListState, WildfiresState } from "./wildfiresList.stats";

export function wildfiresListReducer (state: WildfiresState = getDefaultWildfiresListState(), action: Action): WildfiresState {
    switch(action.type) {
        case SEARCH_WILDFIRES_SUCCESS: {
            const typedaction = <SearchWildfiresSuccessAction> action;
            return {...state, currentWildfiresSearch: typedaction.payload.value}
        }
    }
}