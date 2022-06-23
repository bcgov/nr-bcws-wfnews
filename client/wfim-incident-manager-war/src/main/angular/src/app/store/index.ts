import { routerReducer } from "@ngrx/router-store";
import { ActionReducer, ActionReducerMap } from '@ngrx/store';
import { searchReducer, SearchState, SortDirection } from '@wf1/core-ui';
import { storeLogger } from 'ngrx-store-logger';
import { AuthEffects } from './auth/auth.effects';
import { authReducer } from './auth/auth.reducers';
import { AuthState, initialAuthState } from './auth/auth.state';
import { CodeDataEffects } from './code-data/code-data.effects';
import { codeDataReducer } from './code-data/code-data.reducers';
import { CodeDataState, initialCodeDataState } from './code-data/code-data.state';
import { IncidentManagementEffects } from './im/im.effects';
import { incidentManagementReducer } from './im/im.reducers';
import {
    IMState,
    INCIDENT_COMPONENT_ID,
    INCIDENT_MAP_COMPONENT_ID,
    initialIMSearchState,
    initialIMState
} from './im/im.state';
import { MapEffects } from './map/map.effects';
import { mapReducer } from './map/map.reducers';
import { mapInitialState, MapState } from './map/map.state';
import { NrofEffects } from "./nrof/nrof.effects";
import { nrofReducer } from "./nrof/nrof.reducers";
import {
    initialNROFSearchState, nrofInitialState,
    NrofState, NROF_MAP_COMPONENT_ID
} from "./nrof/nrof.state";
import { placeNameSearchReducer } from "./place-name/place-name.reducers";
import { initialPlaceNameState, PlaceNameState } from "./place-name/place-name.state";
import { PointIdEffects } from "./point-id/point-id.effects";
import { pointIdReducer } from "./point-id/point-id.reducers";
import { initialPointIdState, PointIdState } from "./point-id/point-id.state";
import { RofEffects } from './rof/rof.effects';
import { rofReducer } from './rof/rof.reducers';
import {
    initialROFSearchState, rofInitialState,
    RofState, ROF_MAP_COMPONENT_ID
} from './rof/rof.state';
import { SearchAndConfigEffects } from "./searchAndConfig/search-and-config.effects";
import { searchAndConfigReducer } from "./searchAndConfig/search-and-config.reducers";
import { uiInitialState, uiReducer, UIState } from './ui/ui.reducers';
import { imValidationReducer } from "./validation/validation.reducer";
import { IMValidationState, initialIMValidationState } from "./validation/validation.state";


export interface BaseRouterStoreState {
    url: string;
}

export interface RouterState {
    state: BaseRouterStoreState
}

export const rootReducers: ActionReducerMap<any> = {
    auth: authReducer,
    codeData: codeDataReducer,
    incidentManagement: incidentManagementReducer,
    imValidationState: imValidationReducer,
    search: searchReducer,
    searchIM: searchAndConfigReducer,
    incidentManagementMap: incidentManagementReducer,
    searchIMMap: searchAndConfigReducer,
    searchROFMap: searchAndConfigReducer,
    searchNROFMap: searchAndConfigReducer,
    placeName: placeNameSearchReducer,
    pointId: pointIdReducer,
    ui: uiReducer,
    rof: rofReducer,
    nrofMap: nrofReducer,
    map: mapReducer,
    router: routerReducer
};

export interface RootState {
    auth: AuthState;
    codeData: CodeDataState;
    incidentManagement: IMState;
    imValidationState: IMValidationState,
    [INCIDENT_COMPONENT_ID]: SearchStateAndConfig;
    incidentManagementMap: IMState;
    [INCIDENT_MAP_COMPONENT_ID]: SearchStateAndConfig;
    [ROF_MAP_COMPONENT_ID]: SearchStateAndConfig;
    [NROF_MAP_COMPONENT_ID]: SearchStateAndConfig;
    placeName: PlaceNameState;
    pointId: PointIdState;
    ui: UIState;
    rof: RofState;
    nrofMap: NrofState;
    map: MapState;
}

export const initialRootState: RootState = {
    auth: initialAuthState,
    codeData: initialCodeDataState,
    incidentManagement: initialIMState,
    imValidationState: initialIMValidationState,
    searchIM: initialIMSearchState,
    incidentManagementMap: { ...initialIMState, componentId: INCIDENT_MAP_COMPONENT_ID },
    searchIMMap: { ...initialIMSearchState, componentId: INCIDENT_MAP_COMPONENT_ID },
    searchROFMap: initialROFSearchState,
    searchNROFMap: { ...initialNROFSearchState, componentId: NROF_MAP_COMPONENT_ID },
    nrofMap: { ...nrofInitialState, componentId: NROF_MAP_COMPONENT_ID },
    placeName: initialPlaceNameState,
    pointId: initialPointIdState,
    ui: uiInitialState,
    rof: rofInitialState,
    map: mapInitialState
};

export const rootEffects: any[] = [
    AuthEffects,
    CodeDataEffects,
    IncidentManagementEffects,
    RofEffects,
    NrofEffects,
    MapEffects,
    SearchAndConfigEffects,
    // PlaceNameSearchEffects,
    PointIdEffects,
];

export function logger(reducer: ActionReducer<RootState>): any {
    // default, no options
    return storeLogger({
        collapsed: true,
        level: 'log',
        filter: {
            blacklist: []
        }
    })(reducer);
}

export interface AudibleAlertState {
    enableUnacknowledged: boolean
    enableReceivedFromPM: boolean
    selectedZoneIds?: string[];
}

export class SearchStateAndConfig implements SearchState {
    query: string;
    sortParam: string;
    sortDirection: SortDirection;
    sortModalVisible: boolean;
    filters: {
        [param: string]: any[];
    };
    hiddenFilters: {
        [param: string]: any[];
    };
    columns?: string[]; //ordered list of columns to display
    componentId?: string;
    audibleAlert?: AudibleAlertState;
}

export function isEmpty(obj) {
    for (var key in obj) {
        if (obj.hasOwnProperty(key))
            return false;
    }
    return true;
}

