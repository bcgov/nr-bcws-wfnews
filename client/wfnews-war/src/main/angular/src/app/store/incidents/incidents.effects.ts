import { Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { Store } from '@ngrx/store';
import { SortDirection, TokenService } from '@wf1/core-ui';
import { DefaultService as WildfireIncidentListService } from '@wf1/incidents-rest-api';
import { of } from 'rxjs';
import {
  withLatestFrom,
  debounceTime,
  switchMap,
  catchError,
  map,
} from 'rxjs/operators';
import { RootState } from '..';
import { formatSort, getPageInfoRequestForSearchState } from '../../utils';
import {
  SearchIncidentsAction,
  SearchIncidentsError,
  searchIncidentsSuccess,
  SEARCH_INCIDENTS,
} from './incidents.action';
import { initIncidentsPaging } from './incidents.stats';

@Injectable()
export class IncidentsEffect {
  getIncidentList$ = createEffect(() =>
    this.actions.pipe(
      ofType(SEARCH_INCIDENTS),
      withLatestFrom(this.store),
      debounceTime(1000),
      switchMap(([action, store]) => {
        const typedaction = action as SearchIncidentsAction;
        const pagingInfoRequest =
          typedaction?.payload?.pageInfoRequest ||
          getPageInfoRequestForSearchState(store.searchIncidents);
        const savedFilters = store.searchIncidents.filters;

        const pageNumber = pagingInfoRequest.pageNumber
          ? pagingInfoRequest.pageNumber
          : initIncidentsPaging.pageNumber;
        const pageSize = pagingInfoRequest.pageRowCount
          ? pagingInfoRequest.pageRowCount
          : initIncidentsPaging.pageRowCount;
        let sortParam = pagingInfoRequest.sortColumn;
        if (sortParam === 'fireNumber') {
          sortParam = 'incidentLabel';
        }
        if (sortParam === 'fireName') {
          sortParam = 'incidentName';
        }
        if (sortParam === 'fireCentre') {
          sortParam = 'fireCentreOrgUnitName';
        }
        if (sortParam === 'wildFireOfNote') {
          sortParam = 'fireOfNotePublishedInd';
        }
        if (sortParam === 'lastUpdated') {
          sortParam = 'lastUpdatedTimestamp';
        }

        const orderBy = formatSort(
          sortParam,
          pagingInfoRequest.sortDirection as SortDirection,
        );
        let searchText = [];
        if (pagingInfoRequest.query && pagingInfoRequest.query.length > 0) {
          searchText[0] = pagingInfoRequest.query;
        } else {
          searchText = undefined;
        }
        const savedFireCentreFilter = savedFilters?.selectedFireCentreCode;
        const savedFireOfNotePublishedIndFilter =
          savedFilters?.selectedFireOfNotePublishedInd;

        const fireCentreFilter =
          typedaction.payload.filters['selectedFireCentreCode'] ||
          savedFireCentreFilter;
        const fireOfNotePublishedInd =
          typedaction.payload.filters['selectedFireOfNotePublishedInd'] ||
          savedFireOfNotePublishedIndFilter;

        const now = new Date();
        let currentFireYear = now.getFullYear();
        if (now.getMonth() < 3) {
          currentFireYear -= 1;
        }

        return this.incidentListService
          .getWildfireIncidentList(
            undefined,
            searchText,
            [`${currentFireYear - 1}`, `${currentFireYear}`],
            undefined,
            undefined,
            undefined,
            undefined,
            undefined,
            undefined,
            undefined,
            undefined,
            undefined,
            undefined,
            undefined,
            undefined,
            undefined,
            fireCentreFilter,
            undefined,
            undefined,
            undefined,
            undefined,
            undefined,
            undefined,
            undefined,
            undefined,
            undefined,
            ['Active'],
            undefined,
            undefined,
            undefined,
            undefined,
            ['FIRE'],
            fireOfNotePublishedInd[0],
            undefined,
            undefined,
            `${pageNumber}`,
            `${pageSize}`,
            orderBy,
            undefined,
            'response',
          )
          .pipe(
            map((response: any) =>
              searchIncidentsSuccess(typedaction.componentId, response.body),
            ),
            catchError((error) =>
              of(SearchIncidentsError(typedaction.componentId, error)),
            ),
          );
      }),
    ),
  );

  constructor(
    private actions: Actions,
    private incidentListService: WildfireIncidentListService,
    private store: Store<RootState>,
    private tokenService: TokenService,
  ) {}
}
