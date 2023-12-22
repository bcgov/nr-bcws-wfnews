import { Action } from '@ngrx/store';
import {
  SearchIncidentsSuccessAction,
  SEARCH_INCIDENTS_SUCCESS,
} from './incidents.action';
import { getDefaultIncidentsState, IncidentsState } from './incidents.stats';

export function incidentsReducer(
  state: IncidentsState = getDefaultIncidentsState(),
  action: Action,
): IncidentsState {
  if (action.type === SEARCH_INCIDENTS_SUCCESS) {
    const typedaction = action as SearchIncidentsSuccessAction;
    return { ...state, currentIncidentsSearch: typedaction.payload.value };
  }
}
