import { routerReducer } from "@ngrx/router-store";
import { ActionReducer, ActionReducerMap } from '@ngrx/store';
import { searchReducer, SearchState, SortDirection } from '@wf1/core-ui';
import { storeLogger } from 'ngrx-store-logger';




export interface BaseRouterStoreState {
    url: string;
}

export interface RouterState {
    state: BaseRouterStoreState
}

export const rootReducers: ActionReducerMap<any> = {
    search: searchReducer,
    router: routerReducer
};

export interface RootState {
}

export const initialRootState: RootState = {
};

export const rootEffects: any[] = [
    // PlaceNameSearchEffects,
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

