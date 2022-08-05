import { routerReducer } from '@ngrx/router-store';
import { Action, ActionReducer, ActionReducerMap } from '@ngrx/store';
import { searchReducer, SearchState, SortDirection } from '@wf1/core-ui';
import { storeLogger } from 'ngrx-store-logger';
import { ApplicationState, PagingSearchState } from './application/application.state';
import { pageSearchReducer } from './common/page-search.reducer';
import { IncidentsEffect } from './incidents/incidents.effects';
import { incidentsReducer } from './incidents/incidents.reducer';
import { initialIncidentsSearchState, IncidentsState } from './incidents/incidents.stats';

export interface BaseRouterStoreState {
    url: string;
}

export interface RouterState {
    state: BaseRouterStoreState;
}

export const rootReducers: ActionReducerMap<any> = {
    search: searchReducer,
    router: routerReducer,
    incidents: incidentsReducer,
    searchIncidents: pageSearchReducer
};

export interface RootState {
    application?: ApplicationState;
    incidents?: IncidentsState;
    searchIncidents?: PagingSearchState
};

export const initialRootState: RootState = {
    searchIncidents: initialIncidentsSearchState,
};

export const rootEffects: any[] = [
    // PlaceNameSearchEffects,
    IncidentsEffect

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
    enableUnacknowledged: boolean;
    enableReceivedFromPM: boolean;
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
    for (const key in obj) {
        if (obj.hasOwnProperty(key)) {
return false;
}
    }
    return true;
}

export interface LabeledAction extends Action {
    displayLabel: string;
}


