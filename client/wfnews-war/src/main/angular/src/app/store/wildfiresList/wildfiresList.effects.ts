import { HttpClient, HttpHeaders } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { Actions, Effect, ofType } from "@ngrx/effects";
import { Action, Store } from "@ngrx/store";
import { AppConfigService, SortDirection } from "@wf1/core-ui";
import { Observable, of } from "rxjs";
import { withLatestFrom, debounceTime, switchMap, catchError, map } from "rxjs/operators";
import { RootState } from "..";
import { formatSort, getPageInfoRequestForSearchState } from "../../utils";
import { SearchWildfiresAction, searchWildfiresError, searchWildfiresSuccess, SEARCH_WILDFIRES } from "./wildfiresList.action";
import { initWildfiresListPaging } from "./wildfiresList.stats";

@Injectable()
export class WildfiresListEffect {
    constructor(
        private actions: Actions,
        private store: Store<RootState>,
        private appConfigService: AppConfigService,
        protected http: HttpClient
    ) {

    }

    @Effect()
    getWildfiresList: Observable<Action> = this.actions.pipe(
        ofType(SEARCH_WILDFIRES),
        withLatestFrom(this.store),
        debounceTime(500),
        switchMap(
            ([action, store]) => {

                const typedaction = <SearchWildfiresAction>action;
                const pagingInfoRequest = typedaction.payload.pageInfoRequest ? typedaction.payload.pageInfoRequest : getPageInfoRequestForSearchState (store.searchWildfires);
                const pageNumber = pagingInfoRequest.pageNumber ? pagingInfoRequest.pageNumber : initWildfiresListPaging.pageNumber;
                const pageSize = pagingInfoRequest.pageRowCount ? pagingInfoRequest.pageRowCount : initWildfiresListPaging.pageRowCount;
                let sortParam = pagingInfoRequest.sortColumn;
                let searchText = '';
                if (pagingInfoRequest.query && pagingInfoRequest.query.length > 0) {
                    searchText = pagingInfoRequest.query;
                } else {
                    searchText = undefined;
                }
                if (sortParam == "fireName") {
                    sortParam = "incidentName";
                }
                if (sortParam == "fireNumber") {
                    sortParam = "incidentNumberLabel";
                }
                if (sortParam == "lastUpdated") {
                    sortParam = "lastUpdatedTimestamp";
                }
                if (sortParam == "stageOfControl") {
                    sortParam = "stageOfControlCode";
                }
                if (sortParam == "wildfireOfNote") {
                    sortParam = "fireOfNoteInd";
                }
                if (sortParam == "location") {
                    sortParam = "incidentLocation";
                }
                let orderBy = formatSort(sortParam, <SortDirection>pagingInfoRequest.sortDirection);
                let url = this.appConfigService.getConfig().rest['wfnews'].toString() + '/publicPublishedIncident' + '?pageNumber=' + pageNumber + '&pageRowCount=' + pageSize;

                // add filters
                const filters = typedaction.payload.filters
                for (const filter in filters) {
                  if (Object.prototype.hasOwnProperty.call(filters, filter) && filters[filter] !== undefined) {
                    url += `&${filter}=${filters[filter]}`;
                  }
                }

                if(searchText) {
                    url += `&searchText=${searchText}`;
                }

                if (orderBy) {
                    orderBy = encodeURIComponent(orderBy.trim());
                    url = url.concat('&orderBy=')
                    url = url.concat(orderBy)
                }
                let headers = new HttpHeaders();
                headers.append('Access-Control-Allow-Origin','*');
                headers.append('Accept','*/*');
                return this.http.get<any>(url,{headers})
                    .pipe(
                        map((response: any) => {
                            return searchWildfiresSuccess(typedaction.componentId, response);
                        }),
                        catchError(error => of(searchWildfiresError(typedaction.componentId, error)))
                    );
            }
        )
    );
}
