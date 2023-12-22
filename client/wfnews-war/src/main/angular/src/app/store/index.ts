import { routerReducer } from '@ngrx/router-store';
import { Action, ActionReducer, ActionReducerMap } from '@ngrx/store';
import { searchReducer, SearchState, SortDirection } from '@wf1/core-ui';
import { storeLogger } from 'ngrx-store-logger';
import {
  ApplicationState,
  PagingSearchState,
} from './application/application.state';
import { pageSearchReducer } from './common/page-search.reducer';
import { IncidentEffect } from './incident/incident.effect';
import { incidentReducer } from './incident/incident.reducer';
import { IncidentState } from './incident/incident.stats';
import { IncidentsEffect } from './incidents/incidents.effects';

import { incidentsReducer } from './incidents/incidents.reducer';
import {
  initialIncidentsSearchState,
  IncidentsState,
} from './incidents/incidents.stats';
import { WildfiresListEffect } from './wildfiresList/wildfiresList.effects';
import { wildfiresListReducer } from './wildfiresList/wildfiresList.reducer';
import {
  initialWildfiresSearchState,
  WildfiresState,
} from './wildfiresList/wildfiresList.stats';

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
  searchIncidents: pageSearchReducer,
  incident: incidentReducer,
  wildfires: wildfiresListReducer,
  searchWildfires: pageSearchReducer,
};

export interface RootState {
  application?: ApplicationState;
  incidents?: IncidentsState;
  searchIncidents?: PagingSearchState;
  incident?: IncidentState;
  wildfires?: WildfiresState;
  searchWildfires?: PagingSearchState;
}

export const initialRootState: RootState = {
  searchIncidents: initialIncidentsSearchState,
  searchWildfires: initialWildfiresSearchState,
};

export const rootEffects: any[] = [
  // PlaceNameSearchEffects,
  IncidentsEffect,
  IncidentEffect,
  WildfiresListEffect,
];

export function logger(reducer: ActionReducer<RootState>): any {
  // default, no options
  return storeLogger({
    collapsed: true,
    level: 'log',
    filter: {
      blacklist: [],
    },
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
