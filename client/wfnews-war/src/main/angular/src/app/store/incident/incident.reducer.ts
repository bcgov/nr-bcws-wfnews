import { Action } from '@ngrx/store';
import {
  GetIncidentCauseSuccessAction,
  GetIncidentSuccessAction,
  GET_INCIDENT_CAUSE_SUCCESS,
  GET_INCIDENT_SUCCESS,
} from './incident.action';
import { getDefaultIncidentState, IncidentState } from './incident.stats';

export function incidentReducer(
  state: IncidentState = getDefaultIncidentState(),
  action: Action,
): IncidentState {
  if (action.type === GET_INCIDENT_SUCCESS) {
    const typedaction = action as GetIncidentSuccessAction;
    return { ...state, currentIncident: typedaction.payload.incident };
  } else if (action.type === GET_INCIDENT_CAUSE_SUCCESS) {
    const typedaction = action as GetIncidentCauseSuccessAction;
    return {
      ...state,
      currentIncidentCause: typedaction.payload.incidentCause,
    };
  }
}
