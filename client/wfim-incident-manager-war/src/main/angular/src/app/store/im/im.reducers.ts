import {SearchActions} from "@wf1/core-ui";
import {SimpleWildfireIncidentResource, WildfireIncidentResource} from '@wf1/incidents-rest-api';
import * as uuid from 'uuid';
import * as Incidents from './im.actions';
import {
  IncidentCommentLoadSuccessAction,
  IncidentPollingSuccessAction,
  IncidentRofsLoadSuccessAction,
  SaveCommentAction,
  SelectIncidentForEditingSuccessAction
} from './im.actions';
import {IMState, initialIMState, isMyComponent} from "./im.state";
import {OpenIncident} from '../../modules/im-external/models';
import {convertToWFErrors} from "../../conversion/conversion-error-from-rest";

export function incidentManagementReducer(state: IMState = initialIMState, action): IMState {
  switch (action.type) {

    case Incidents.IncidentActionTypes.INCIDENT_SIMPLE_SEARCH:
    case Incidents.IncidentActionTypes.INCIDENT_SEARCH: {
      return {
        ...state,
        loading: true
      };
    }

    case Incidents.IncidentActionTypes.INCIDENT_SIMPLE_SEARCH_SUCCESS: {
      if (!isMyComponent(state, action.componentId)) {
        return state;
      }

      const simpleIncidents = (<Incidents.IncidentSimpleSearchSuccessAction>action).response.collection || [];
      return {
        ...state,
        lastSyncDate: Date.now(),
        loading: false,
        simpleIncidents
      };
    }

    case Incidents.IncidentActionTypes.INCIDENT_SEARCH_SUCCESS: {
      if (!isMyComponent(state, action.componentId)) {
        return state;
      }

      const incidents = (<Incidents.IncidentSearchSuccessAction>action).response.collection || [];
      return {
        ...state,
        lastSyncDate: Date.now(),
        loading: false,
        incidents
      };
    }

    case Incidents.IncidentActionTypes.POLLING_INCIDENT_SUCCESS: {
      const simpleIncidents = state.simpleIncidents;
      const newIncidents = (<IncidentPollingSuccessAction>action).response.collection;
      const updatedIncidents = [...simpleIncidents];
      let incidentsChanged = false;
      if(newIncidents){
        newIncidents.forEach((newIncident: SimpleWildfireIncidentResource) => {
          const index = simpleIncidents.findIndex((currentIncident: SimpleWildfireIncidentResource) => {
            return currentIncident.wildfireYear === newIncident.wildfireYear && currentIncident.incidentNumberSequence === newIncident.incidentNumberSequence;
          });

          if(index === -1){
            updatedIncidents.unshift(newIncident);
            incidentsChanged = true;
          }else{
            if(simpleIncidents[index].discoveryTimestamp !== newIncident.discoveryTimestamp){
              updatedIncidents[index].discoveryTimestamp = newIncident.discoveryTimestamp;
              incidentsChanged = true;
            }
            if(simpleIncidents[index].fireCentreOrgUnitName !== newIncident.fireCentreOrgUnitName){
              updatedIncidents[index].fireCentreOrgUnitName = newIncident.fireCentreOrgUnitName;
              incidentsChanged = true;
            }
            if(simpleIncidents[index].zoneOrgUnitName !== newIncident.zoneOrgUnitName){
              updatedIncidents[index].zoneOrgUnitName = newIncident.zoneOrgUnitName;
              incidentsChanged = true;
            }
            if(simpleIncidents[index].incidentLabel !== newIncident.incidentLabel){
              updatedIncidents[index].incidentLabel = newIncident.incidentLabel;
              incidentsChanged = true;
            }
            if(simpleIncidents[index].latitude !== newIncident.latitude){
              updatedIncidents[index].latitude = newIncident.latitude;
              incidentsChanged = true;
            }
            if(simpleIncidents[index].longitude !== newIncident.longitude){
              updatedIncidents[index].longitude = newIncident.longitude;
              incidentsChanged = true;
            }
            if(simpleIncidents[index].incidentTypeCode !== newIncident.incidentTypeCode){
              updatedIncidents[index].incidentTypeCode = newIncident.incidentTypeCode;
              incidentsChanged = true;
            }
            if(simpleIncidents[index].incidentCommanderName !== newIncident.incidentCommanderName){
              updatedIncidents[index].incidentCommanderName = newIncident.incidentCommanderName;
              incidentsChanged = true;
            }
            if(simpleIncidents[index].incidentStatusCode !== newIncident.incidentStatusCode){
              updatedIncidents[index].incidentStatusCode = newIncident.incidentStatusCode;
              incidentsChanged = true;
            }
            if(simpleIncidents[index].suspectedCauseCategoryCode !== newIncident.suspectedCauseCategoryCode){
              updatedIncidents[index].suspectedCauseCategoryCode = newIncident.suspectedCauseCategoryCode;
              incidentsChanged = true;
            }
            if(simpleIncidents[index].interfaceFireInd !== newIncident.interfaceFireInd){
              updatedIncidents[index].interfaceFireInd = newIncident.interfaceFireInd;
              incidentsChanged = true;
            }
            if(simpleIncidents[index].stageOfControlCode !== newIncident.stageOfControlCode){
              updatedIncidents[index].stageOfControlCode = newIncident.stageOfControlCode;
              incidentsChanged = true;
            }
            if(simpleIncidents[index].geographicDescription !== newIncident.geographicDescription){
              updatedIncidents[index].geographicDescription = newIncident.geographicDescription;
              incidentsChanged = true;
            }

            if(simpleIncidents[index].fireSizeHectares !== newIncident.fireSizeHectares){
              updatedIncidents[index].fireSizeHectares = newIncident.fireSizeHectares;
              incidentsChanged = true;
            }
          }
        });
      }
      let newState = {
        ...state,
        lastSyncDate: Date.now()
      }

      if(!incidentsChanged){
        return newState;
      }

      newState.simpleIncidents = updatedIncidents;

      return newState;
    }

    case SearchActions.SearchActionTypes.REFRESH_SEARCH:
    case SearchActions.SearchActionTypes.UPDATE_SEARCH_QUERY:
    case SearchActions.SearchActionTypes.UPDATE_SORT:
    case SearchActions.SearchActionTypes.UPDATE_ACTIVE_FILTERS:
    case SearchActions.SearchActionTypes.CLEAR_FILTER:
    case SearchActions.SearchActionTypes.CLEAR_ALL_FILTERS: {
      if (!isMyComponent(state, action.componentId)) {
        return state;
      }
      return {
        ...state,
        loading: true
      };
    }

    case Incidents.IncidentActionTypes.INCIDENT_SIMPLE_SEARCH_ERROR:
    case Incidents.IncidentActionTypes.INCIDENT_SEARCH_ERROR: {
      return {
        ...state,
        loading: false
      };
    }

    case Incidents.IncidentActionTypes.OPEN_INCIDENT_TAB_SUCCESS: {
      const {etag, incident} = <Incidents.OpenIncidentTabSuccessAction>action;
      if (!isMyComponent(state, action.componentId)) {
        return state;
      }
      const updatedOpenIncidents = isIncidentAlreadyOpen(incident, state.openIncidents) ? state.openIncidents : [...state.openIncidents, formatOpenIncident(etag, incident)];
      return {
        ...state,
        openIncidents: updatedOpenIncidents
      };
    }

    case Incidents.IncidentActionTypes.CLOSE_INCIDENT_TAB: {
      if (!isMyComponent(state, action.componentId)) {
        return state;
      }
      const id = (<Incidents.CloseIncidentTabAction>action).id;
      const updatedOpenIncidents = state.openIncidents.filter(openIncident => openIncident.id !== id);
      return {
        ...state,
        openIncidents: updatedOpenIncidents
      };
    }

    case Incidents.IncidentActionTypes.INCIDENT_LOAD: {
      return {
        ...state,
        loading: true,
        activeIncident: null,
        activeIncidentComments: null,
      };
    }

    case Incidents.IncidentActionTypes.INCIDENT_LOAD_SUCCESS: {
      const incident = (<Incidents.IncidentLoadSuccessAction>action).response || null;
      return {
        ...state,
        loading: false,
        activeIncident: incident,
        error:[]
      };
    }

    case Incidents.IncidentActionTypes.INCIDENT_LOAD_ERROR: {
      return {
        ...state,
        loading: false
      };
    }

    case Incidents.IncidentActionTypes.SAVE_COMMENT_SUCCESS: {
      let typedAction = (<SaveCommentAction>action);
      let activeIncidentComments = state.activeIncidentComments;
      activeIncidentComments.comments.push(typedAction.payload.value);

      return {
        ...state,
        activeIncidentComments: {...activeIncidentComments, comments: [...activeIncidentComments.comments]}
      }
    }


    case Incidents.IncidentActionTypes.LOAD_INCIDENT_COMMENT_SUCCESS: {
      const {wildfireYear, incidentNumberSequence, response} = (<IncidentCommentLoadSuccessAction>action);
      if (response) {
        return {
          ...state,
          activeIncidentComments: {
            wildfireYear,
            incidentNumberSequence,
            comments: response.collection
          }
        }
      } else {
        return state;
      }
    }

    case Incidents.IncidentActionTypes.LOAD_INCIDENTrofs_SUCCESS: {
      const {response} = (<IncidentRofsLoadSuccessAction>action);
      if (response) {
        return {
          ...state,
          activeIncidentRofs: response
        }
      } else {
        return state;
      }
    }

    case Incidents.IncidentActionTypes.UPDATE_INCIDENT_SUCCESS: {
      if (!isMyComponent(state, action.componentId)) {
        return state;
      }
      const {etag, incident} = <Incidents.UpdateIncidentSuccessAction>action;
      const label = incident.incidentLabel;
      let updatedOpenIncidents = [];
      if(state.openIncidents){
        updatedOpenIncidents = state.openIncidents.map(
          openIncident => openIncident.label == label ? {id: openIncident.id, label, etag, incident} : openIncident
        );
      }
      let incidents = state.incidents.map(obj => {
        if(obj.wildfireYear == incident.wildfireYear && obj.incidentNumberSequence == incident.incidentNumberSequence){
          return incident;
        }else{
          return obj;
        }
      });

      return {
        ...state,
        incidents: incidents,
        openIncidents: updatedOpenIncidents,
        error:[]
      };
    }

    case Incidents.IncidentActionTypes.UPDATE_INCIDENT_ERROR: {
      const error = (<Incidents.UpdateIncidentErrorAction>action).error;
      let errorsArray = convertToWFErrors(error);
      return {
        ...state,
        error: errorsArray
      };
    }

    case Incidents.IncidentActionTypes.FOCUS_OPEN_INCIDENT: {
      return {
        ...state,
        activeIncidentId: (<Incidents.FocusOpenIncident>action).id
      };
    }

    case Incidents.IncidentActionTypes.SELECT_INCIDENT_FOR_EDITING_SUCCESS: {
      const typedAction = <SelectIncidentForEditingSuccessAction>action;
      return {...state, editingRsrc: typedAction.payload.resource, editingRsrcEtag: typedAction.payload.etag};
    }

    case Incidents.IncidentActionTypes.UNSELECT_INCIDENT_FOR_EDITING_SUCCESS: {
      return {...state, editingRsrc: null, editingRsrcEtag: null};
    }


    default: {
      return state;
    }
  }
}

const formatOpenIncident = (etag: string, incident: WildfireIncidentResource) : OpenIncident => ({
  id: uuid.v4(),
  label: incident.incidentLabel,
  etag: etag,
  incident: incident
});

const isIncidentAlreadyOpen = (incident: WildfireIncidentResource, openIncidents: OpenIncident[]) => openIncidents.some(openIncident => openIncident.label == incident.incidentLabel);

