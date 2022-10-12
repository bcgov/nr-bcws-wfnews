import { Action } from "@ngrx/store";
import { SearchWildfiresSuccessAction, SEARCH_WILDFIRES_SUCCESS } from "./wildfiresList.action";
import { getDefaultWildfiresListState, SEARCH_WILDFIRES_COMPONENT_ID, WildfiresState } from "./wildfiresList.stats";

export function wildfiresListReducer (state: WildfiresState = getDefaultWildfiresListState(), action: Action): WildfiresState {
  if (action.type === SEARCH_WILDFIRES_SUCCESS) {
    const typedaction = <SearchWildfiresSuccessAction> action;
    if (typedaction.componentId === SEARCH_WILDFIRES_COMPONENT_ID){
      return {...state, currentWildfiresSearch: typedaction.payload.value}
    } else{
      return {...state, currentWildfiresSearch: typedaction.payload.value}
    }
  }
}
