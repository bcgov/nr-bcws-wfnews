import { searchReducer, SearchState } from '@wf1/core-ui';
import { Action } from '@ngrx/store';
import { SearchActions } from '@wf1/core-ui/lib/search/store/actions';
import deepEqual from 'deep-equal';
import {
  SearchIncidentsAction,
  SEARCH_INCIDENTS,
} from '../incidents/incidents.action';

export function pageSearchReducer(state, action: Action): SearchState {
  if (action.type == SEARCH_INCIDENTS) {
    const typedAction = action as SearchIncidentsAction;
    return pagingSearchHelper(state, typedAction);
  } else {
    const searchAction = action as SearchActions;
    return searchReducer(state, searchAction);
  }
}

export function pagingSearchHelper(
  state,
  typedAction,
  updateFilters: boolean = true,
): SearchState {
  if (
    state &&
    state.componentId == typedAction.componentId &&
    typedAction.payload.pageInfoRequest &&
    (state.pageSize !== typedAction.payload.pageInfoRequest.pageRowCount ||
      state.pageIndex !== typedAction.payload.pageInfoRequest.pageNumber ||
      state.sortParam !== typedAction.payload.pageInfoRequest.sortColumn ||
      state.sortDirection !==
        typedAction.payload.pageInfoRequest.sortDirection ||
      state.query !== typedAction.payload.pageInfoRequest.query ||
      state.filters !== typedAction.payload.filters)
  ) {
    if (updateFilters) {
      return {
        ...state,
        pageSize: typedAction.payload.pageInfoRequest.pageRowCount,
        pageIndex: typedAction.payload.pageInfoRequest.pageNumber,
        sortParam: typedAction.payload.pageInfoRequest.sortColumn,
        sortDirection: typedAction.payload.pageInfoRequest.sortDirection,
        query: typedAction.payload.pageInfoRequest.query,
        filters: typedAction.payload.filters ? typedAction.payload.filters : {},
      };
    } else {
      return {
        ...state,
        pageSize: typedAction.payload.pageInfoRequest.pageRowCount,
        pageIndex: typedAction.payload.pageInfoRequest.pageNumber,
        sortParam: typedAction.payload.pageInfoRequest.sortColumn,
        sortDirection: typedAction.payload.pageInfoRequest.sortDirection,
        query: typedAction.payload.pageInfoRequest.query,
      };
    }
  } else {
    return state;
  }
}

export function pagingFilterHelper(state, typedAction): SearchState {
  if (
    state &&
    state.componentId == typedAction.componentId &&
    !deepEqual(state.filters, typedAction.payload.filters)
  ) {
    return {
      ...state,
      filters: { ...typedAction.payload.filters },
    };
  } else {
    return state;
  }
}
