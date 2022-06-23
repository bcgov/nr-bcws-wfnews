import {
  IntersectionSearchErrorAction,
  PlaceNameAction,
  PlaceNameActionTypes,
  PlaceNameSearchErrorAction,
  RoadNameSearchErrorAction,
  SearchResultsAction,
} from "./place-name.actions";
import {initialPlaceNameState, PlaceNameState} from "./place-name.state";

export function placeNameSearchReducer(state: PlaceNameState = initialPlaceNameState, action: PlaceNameAction): PlaceNameState {
	switch(action.type) {
		case PlaceNameActionTypes.PLACE_NAME_SEARCH_SUCCESS: {
			return {
        ...state,
        loading: true,
      };
		}

		case PlaceNameActionTypes.PLACE_NAME_SEARCH_ERROR: {
			return {
        ...state,
        loading: false,
        error: (action as PlaceNameSearchErrorAction).error
      };
		}

		case PlaceNameActionTypes.ROAD_NAME_SEARCH_SUCCESS: {
			return {
        ...state,
        loading: true,
      };
		}

		case PlaceNameActionTypes.ROAD_NAME_SEARCH_ERROR: {
			return {
        ...state,
        loading: false,
        error: (action as RoadNameSearchErrorAction).error
      };
		}

		case PlaceNameActionTypes.INTERSECTION_SEARCH_SUCCESS: {
			return {
        ...state,
        loading: true,
      };
		}

		case PlaceNameActionTypes.INTERSECTION_SEARCH_ERROR: {
			return {
        ...state,
        loading: false,
        error: (action as IntersectionSearchErrorAction).error
      };
		}

		case PlaceNameActionTypes.START_LISTENING_FOR_RESULTS: {
			return {
        ...state,
        listeningForResults: true,
      };
		}

		case PlaceNameActionTypes.STOP_LISTENING_FOR_RESULTS: {
			return {
        ...state,
        listeningForResults: false,
      };
		}

		case PlaceNameActionTypes.SEARCH_RESULTS: {
			return {
        ...state,
        ...(action as SearchResultsAction).results,
        loading: false,
      };
		}

		default: {
			return state;
		}
	}
}
