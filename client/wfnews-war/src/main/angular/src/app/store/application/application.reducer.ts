import {Action} from "@ngrx/store";
import { GET_INCIDENT, GET_INCIDENT_ERROR } from "../incident/incident.action";
import { SEARCH_INCIDENTS, SEARCH_INCIDENTS_ERROR, SEARCH_INCIDENTS_SUCCESS } from "../incidents/incidents.action";
import { INCIDENTS_COMPONENT_ID } from "../incidents/incidents.stats";
import { SEARCH_WILDFIRES, SEARCH_WILDFIRES_ERROR, SEARCH_WILDFIRES_SUCCESS } from "../wildfiresList/wildfiresList.action";
import {
    ApplicationState,
    ERROR_TYPE,
    ErrorState,
    getDefaultApplicationState,
    getDefaultFormState,
    getDefaultLoadStates
} from "./application.state";


export function applicationReducer(state: ApplicationState = getDefaultApplicationState(), action: Action): ApplicationState {
    switch (action.type) {

        case SEARCH_INCIDENTS: 
        case GET_INCIDENT:
        case SEARCH_WILDFIRES:
        {
            return updateLoadState(state, action, true);
        }

        case SEARCH_INCIDENTS_SUCCESS: 
        case GET_INCIDENT_ERROR:
        case SEARCH_WILDFIRES_SUCCESS:
        {
            return updateLoadState(state, action, false);
        }
        case SEARCH_INCIDENTS_ERROR:
        case GET_INCIDENT_ERROR:
        case SEARCH_WILDFIRES_ERROR:
        {
            return updateErrorState(state, action, action["payload"]["error"]);
        }

        default: {
            return state;
        }
    }
}

export function getStatePropertyNameForActionName(action: Action): string {
    let actionType = action.type;
    let typedaction = null;
    switch(actionType){
        case SEARCH_INCIDENTS:
            return INCIDENTS_COMPONENT_ID;
        default:
            return null;
    }
}

export function updateLoadState(state: ApplicationState, action: Action, value: boolean): ApplicationState {
    let component = getStatePropertyNameForActionName(action);
    let st = state;
    if (value) { // if starting load, reset error state
        st = clearErrorState(state, action);
    } else { //if ending load, reset form state
        st = clearFormState(state, action);
    }
    // Only update state if there is a value change
    if (component && (!state.loadStates || !state.loadStates[component] || state.loadStates[component].isLoading !== value)) {
        return {
            ...st,
            loadStates: {...st.loadStates, [component]: {isLoading: value}}
        };
    } else {
        return st;
    }
}

export function updateErrorState(state: ApplicationState, action: Action, value: ErrorState): ApplicationState {
    let component = getStatePropertyNameForActionName(action);
    if (component) {
        if (value.type == ERROR_TYPE.FATAL) {
            let ns = {
                ...state,
                errorStates: {...state.errorStates, ["severe"]: [...state.errorStates["severe"], value]},
                loadStates: getDefaultLoadStates() // set all load states to false on a fatal error
            };
            return ns;
        }

        if (state.errorStates && state.errorStates[component]) {
            if (state.errorStates[component].find && state.errorStates[component].find((errorState: ErrorState) => errorState.message == value.message)) {
                return state;
            }
        }

        return {
            ...state,
            errorStates: {...state.errorStates, [component]: [...state.errorStates[component], value]},
            loadStates: {...state.loadStates, [component]: {isLoading: false}}
        };
    } else {
        return state;
    }
}

export function clearErrorState(state: ApplicationState, action: Action): ApplicationState {
    let component = getStatePropertyNameForActionName(action);
    if (component) {
        return {
            ...state,
            errorStates: {...state.errorStates, [component]: []},
        };
    } else {
        return state;
    }
}

export function clearFormState(state: ApplicationState, action: Action): ApplicationState {
    let component = getStatePropertyNameForActionName(action);
    if (component) {
        return {
            ...state,
            formStates: {...state.formStates, [component]: getDefaultFormState()},
        };
    } else {
        return state;
    }
}
