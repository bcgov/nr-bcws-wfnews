import { Action } from '@ngrx/store';
import * as MapActions from './map.actions';
import { mapInitialState, MapState } from './map.state';

export function mapReducer(state: MapState = mapInitialState, action: Action) {
    switch (action.type) {
        case MapActions.SET_MAP_POSITION: {
            return {
                ...state,
                location: (<MapActions.SetMapLocation>action).location
            };
        }
        case MapActions.SET_ACTIVE_MAP_POLYGON: {
            return {
                ...state,
                activePolygon: (<MapActions.SetActiveMapPolygon>action).polygon
            };
        }
        case MapActions.CLEAR_MAP_SELECT_POLYGON: {
            return {
                ...state,
                activePolygon: undefined
            };
        }
        case MapActions.CLEAR_MAP_SELECT_POINT: {
            return state;
        }

        default:
            return state;
    }
}
