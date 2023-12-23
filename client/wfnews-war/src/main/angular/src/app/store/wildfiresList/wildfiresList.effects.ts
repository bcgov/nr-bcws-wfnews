import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { Store } from '@ngrx/store';
import { AppConfigService, SortDirection } from '@wf1/core-ui';
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
  SearchWildfiresAction,
  searchWildfiresError,
  searchWildfiresSuccess,
  SEARCH_WILDFIRES,
} from './wildfiresList.action';
import { initWildfiresListPaging } from './wildfiresList.stats';

@Injectable()
export class WildfiresListEffect {
  getWildfiresList$ = createEffect(() =>
    this.actions.pipe(
      ofType(SEARCH_WILDFIRES),
      withLatestFrom(this.store),
      debounceTime(500),
      switchMap(([action, store]) => {
        const typedaction = action as SearchWildfiresAction;
        try {
          const pagingInfoRequest = typedaction.payload.pageInfoRequest
            ? typedaction.payload.pageInfoRequest
            : getPageInfoRequestForSearchState(store.searchWildfires);
          const pageNumber = pagingInfoRequest.pageNumber
            ? pagingInfoRequest.pageNumber
            : initWildfiresListPaging.pageNumber;
          const pageSize = pagingInfoRequest.pageRowCount
            ? pagingInfoRequest.pageRowCount
            : initWildfiresListPaging.pageRowCount;
          let sortParam = pagingInfoRequest.sortColumn;
          let searchText = '';
          const lat = typedaction.payload.lat;
          const long = typedaction.payload.long;
          const radius = typedaction.payload.radius;
          if (pagingInfoRequest.query && pagingInfoRequest.query.length > 0) {
            searchText = pagingInfoRequest.query;
          } else {
            searchText = undefined;
          }
          if (sortParam === 'fireName') {
            sortParam = 'incidentName';
          }
          if (sortParam === 'fireNumber') {
            sortParam = 'incidentNumberLabel';
          }
          if (sortParam === 'lastUpdated') {
            sortParam = 'lastUpdatedTimestamp';
          }
          if (sortParam === 'stageOfControl') {
            sortParam = 'stageOfControlCode';
          }
          if (sortParam === 'wildfireOfNote') {
            sortParam = 'fireOfNoteInd';
          }
          if (sortParam === 'location') {
            sortParam = 'incidentLocation';
          }
          let orderBy = formatSort(
            sortParam,
            pagingInfoRequest.sortDirection as SortDirection,
          );
          let url =
            this.appConfigService.getConfig().rest['wfnews'].toString() +
            '/publicPublishedIncident' +
            '?pageNumber=' +
            pageNumber +
            '&pageRowCount=' +
            pageSize;

          // add filters
          const filters = typedaction.payload.filters;
          for (const filter in filters) {
            if (
              Object.hasOwn(filters, filter) &&
              filters[filter] !== undefined
            ) {
              if (filter === 'stageOfControlList') {
                for (const soc of filters[filter]) {
                  url += `&${filter}=${soc}`;
                }
              } else {
                url += `&${filter}=${filters[filter]}`;
              }
            }
          }

          if (lat && long && radius) {
            url = url.concat('&latitude=').concat(lat.toString());
            url = url.concat('&longitude=').concat(long.toString());
            url = url.concat('&radius=').concat((radius * 1000).toString());
          } else if (searchText) {
            url += `&searchText=${searchText}`;
          }

          if (orderBy) {
            orderBy = encodeURIComponent(orderBy.trim());
            url = url.concat('&orderBy=');
            url = url.concat(orderBy);
          }

          const headers = new HttpHeaders();
          headers.append('Accept', '*/*');
          headers.append(
            'apikey',
            this.appConfigService.getConfig().application['wfnewsApiKey'],
          );

          return this.http
            .get<any>(url, {
              headers: {
                Accept: '*/*',
                apikey:
                  this.appConfigService.getConfig().application['wfnewsApiKey'],
              },
            })
            .pipe(
              map((response: any) => {
                typedaction.callback();
                return searchWildfiresSuccess(
                  typedaction.componentId,
                  response,
                );
              }),
              catchError((error) => {
                typedaction.callback();
                return of(searchWildfiresError(typedaction.componentId, error));
              }),
            );
        } catch (err) {
          typedaction.callback();
          console.error(err);
        }
      }),
    ),
  );

  constructor(
    private actions: Actions,
    private store: Store<RootState>,
    private appConfigService: AppConfigService,
    protected http: HttpClient,
  ) {}
}
