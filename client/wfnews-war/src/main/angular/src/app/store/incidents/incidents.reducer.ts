import { Action } from "@ngrx/store";
import { GetIncidentsSuccessAction, GET_INCIDENTS_SUCCESS } from "./incidents.actions";
import { getDefaultIncidentsState, IncidentsState } from "./incidents.state";

export function incidentsReducer(state: IncidentsState = getDefaultIncidentsState(), action: Action) : IncidentsState {
    switch (action.type) {
        case GET_INCIDENTS_SUCCESS : {
            const typedAction = <GetIncidentsSuccessAction> action;
            return {...state, incidents: typedAction.payload.value}
        }

        default: {
            return state;
        }
    }
}
