import { SearchState } from '@wf1/core-ui';
import { getDefaultPagingInfoRequest } from '../application/application.state';

export const SEARCH_INCIDENTS_COMPONENT_ID = 'searchIncidents';
export const INCIDENTS_COMPONENT_ID = 'Incidents';
export const LOAD_INCIDENTS_COMPONENT_ID = 'loadIncidents';

const EMPTY_INCIDENTS: any = {
  pageNumber: null,
  pageRowCount: null,
  totalPageCount: null,
  totalRowCount: null,
  collection: [],
};

export interface IncidentsState {
  // will need to specify the type . use any for now
  currentIncidentsSearch?: any;
  selectedIncident?: any;
  incidents?: any;
}

export const initialIncidentsSearchState: SearchState = {
  query: null,
  sortParam: 'discoveryTimestamp',
  sortDirection: 'DESC',
  sortModalVisible: false,
  filters: {},
  hiddenFilters: {},
  componentId: SEARCH_INCIDENTS_COMPONENT_ID,
};

export const initIncidentsPaging = getDefaultPagingInfoRequest(
  1,
  20,
  'discoveryTimestamp',
  'DESC',
  undefined,
);

export function getDefaultIncidentsState(): IncidentsState {
  return {
    currentIncidentsSearch: EMPTY_INCIDENTS,
  };
}
