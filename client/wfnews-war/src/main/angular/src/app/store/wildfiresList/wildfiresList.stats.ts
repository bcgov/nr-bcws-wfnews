import { SearchState } from '@wf1/core-ui';
import { getDefaultPagingInfoRequest } from '../application/application.state';

export const SEARCH_WILDFIRES_COMPONENT_ID = 'searchWildfires';
export const WILDFIRESLIST_COMPONENT_ID = 'WildfiresList';
export const LOAD_WILDFIRES_COMPONENT_ID = 'loadWildfires';

const EMPTY_WILDFIRESLIST: any = {
  pageNumber: null,
  pageRowCount: null,
  totalPageCount: null,
  totalRowCount: null,
  collection: [],
};

export interface WildfiresState {
  // will need to specify the type . use any for now
  currentWildfiresSearch?: any;
  selectedWildfire?: any;
  wildfires?: any;
}

export const initialWildfiresSearchState: SearchState = {
  query: null,
  sortParam: 'lastUpdatedTimestamp',
  sortDirection: 'DESC',
  sortModalVisible: false,
  filters: {},
  hiddenFilters: {},
  componentId: SEARCH_WILDFIRES_COMPONENT_ID,
};

export const initWildfiresListPaging = getDefaultPagingInfoRequest(
  1,
  20,
  'discoveryTimestamp',
  'DESC',
  undefined,
);

export function getDefaultWildfiresListState(): WildfiresState {
  return {
    currentWildfiresSearch: EMPTY_WILDFIRESLIST,
  };
}
