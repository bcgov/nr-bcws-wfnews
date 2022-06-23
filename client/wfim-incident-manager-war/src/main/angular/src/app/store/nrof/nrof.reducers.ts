import {SearchActions, SearchState} from '@wf1/core-ui';
import {
  NROFActionTypes,
  NROFLoadAction,
  NROFLoadSuccessAction, NROFPollingSuccessAction,
  NROFSearchSuccessAction, NROFSyncAction,
} from "./nrof.actions";
import {nrofInitialState, NrofState} from "./nrof.state";
import {ProvisionalZoneResource} from "@wf1/incidents-rest-api";

export function nrofReducer(state: NrofState = nrofInitialState, action) {
  switch (action.type) {
    case NROFActionTypes.LOAD_NROF:
      let typedAction = (<NROFLoadAction>action);
      let loading = typedAction.silent ? false : true;
      return {...state, loading: loading};

    case NROFActionTypes.NROF_SEARCH: {
      return {...state, loading: true};
    }

    case NROFActionTypes.LOAD_NROF_ERROR:
    case NROFActionTypes.NROF_SEARCH_ERROR: {
      if (!isMyComponent(state, action.componentId)) {
        return state;
      }
      return {...state, loading: false};
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
      return {...state, loading: true};
    }

    case NROFActionTypes.NROF_SEARCH_SUCCESS: {
      if (!isMyComponent(state, action.componentId)) {
        return state;
      }
      const nrofs = (<NROFSearchSuccessAction>action).response.collection;
      return {
        ...state,
        nrofs,
        lastSyncDate: Date.now(),
        loading: false
      };
    }

    case NROFActionTypes.LOAD_NROF_SUCCESS: {
      const nrof = (<NROFLoadSuccessAction>action).response || null;
      return {
        ...state,
        loading: false,
        activeNrof: nrof,
      };
    }

    case NROFActionTypes.POLLING_NROF_SUCCESS: {
      let simpleNrofs = (<NROFPollingSuccessAction>action).response.collection;
      let nrofSearchState = (<NROFPollingSuccessAction>action).searchState as SearchState;
      let filters = nrofSearchState ? nrofSearchState.filters : undefined;
      let messageStatusCodes = filters && filters.messageStatusCode ? filters.messageStatusCode : undefined;
      let publicReportTypeCodes = filters && filters.publicReportTypeCode ? filters.publicReportTypeCode : undefined;
      let newSimpleNrofs = [];
      let newNrofs = [...state.nrofs];
      let removedNrofs = state.removedNrofs;
      let nrofsChanged = false;
      
      if(removedNrofs && removedNrofs.length > 0){
        removedNrofs.forEach((rnrof: ProvisionalZoneResource) =>{
          let removedNrofIndex = newNrofs.findIndex((nnrof: ProvisionalZoneResource) => {
            return nnrof.provisionalZoneGuid === rnrof.provisionalZoneGuid;
          });

          if(removedNrofIndex !== -1){
            newNrofs.splice(removedNrofIndex, 1);
          }
        });

        nrofsChanged = true;
      }

      if (simpleNrofs) {
        simpleNrofs.forEach((snrof: ProvisionalZoneResource) => {

          const index = newNrofs.findIndex((nrof: ProvisionalZoneResource) => {
            return nrof.provisionalZoneGuid === snrof.provisionalZoneGuid;
          });

          if(index > -1) {
            
            if (newNrofs[index].expiryTimestamp !== snrof.expiryTimestamp) {
              newNrofs[index].expiryTimestamp = snrof.expiryTimestamp;
              nrofsChanged = true;
            }

          }

        });
      }

      let newState = {
        ...state,
        lastSyncDate: Date.now(),
        removedNrofs: [],
        simpleNrofs,
        loading: false
      };

      if(nrofsChanged){
        newState.nrofs = newNrofs;
      }

      if(newSimpleNrofs && newSimpleNrofs.length > 0){
        newState.newSimpleNrofs = newSimpleNrofs;
      }
      // console.log("newState: ", newState);
      return newState;
    }

    case NROFActionTypes.SYNC_NEW_NROFS: {
      const newNrofs: ProvisionalZoneResource[] = (<NROFSyncAction>action).nrofs;
      const nrofs = state.nrofs;
      newNrofs.forEach((newNrof: ProvisionalZoneResource) => {
        const index = nrofs.findIndex((nrof: ProvisionalZoneResource) => {
          return nrof.provisionalZoneGuid === newNrof.provisionalZoneGuid;
        });
        if (index === -1) {
          nrofs.unshift(newNrof);
        } else {
          nrofs[index] = newNrof
        }
      });

      return { ...state, nrofs: [...nrofs], newSimpleNrofs: [] };
    }

    default: {
      return state;
    }
  }
}

const isMyComponent = (state: any, componentId: string): boolean => {
  if (state && state.componentId && componentId) {
    if (state.componentId === componentId) {
      return true;
    }
  }
  return false;
};
