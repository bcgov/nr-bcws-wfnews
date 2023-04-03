import { Injectable } from "@angular/core";
import { Actions, Effect, ofType } from "@ngrx/effects";
import { Action, Store } from "@ngrx/store";
import { SortDirection, TokenService } from "@wf1/core-ui";
import { DefaultService as WildfireIncidentListService } from "@wf1/incidents-rest-api";
import { Observable, of } from "rxjs";
import { withLatestFrom, debounceTime, switchMap, catchError, map } from "rxjs/operators";
import { RootState } from "..";
import { formatSort, getPageInfoRequestForSearchState } from "../../utils";
import { SearchIncidentsAction, SearchIncidentsError, searchIncidentsSuccess, SEARCH_INCIDENTS } from "./incidents.action";
import { initIncidentsPaging } from "./incidents.stats";

@Injectable()
export class IncidentsEffect {
    constructor(
        private actions: Actions,
        private incidentListService: WildfireIncidentListService,
        private store: Store<RootState>,
        private tokenService: TokenService,
    ) {

    }

    @Effect()
    getIncidentList: Observable<Action> = this.actions.pipe(
        ofType(SEARCH_INCIDENTS),
        withLatestFrom(this.store),
        debounceTime(1000),
        switchMap(
            ([action, store]) => {

                let typedaction = <SearchIncidentsAction>action;
                let pagingInfoRequest = typedaction.payload.pageInfoRequest ? typedaction.payload.pageInfoRequest : getPageInfoRequestForSearchState (store.searchIncidents);
                let savedFilters = store.searchIncidents.filters;

                let pageNumber = pagingInfoRequest.pageNumber ? pagingInfoRequest.pageNumber : initIncidentsPaging.pageNumber;
                let pageSize = pagingInfoRequest.pageRowCount ? pagingInfoRequest.pageRowCount : initIncidentsPaging.pageRowCount;
                let sortParam = pagingInfoRequest.sortColumn;
                if (sortParam == "fireNumber") {
                    sortParam = "incidentLabel";
                }
                if (sortParam == "fireName") {
                    sortParam = "incidentName";
                }
                if (sortParam == "fireCentre") {
                    sortParam = "fireCentreOrgUnitName";
                }
                if (sortParam == "wildFireOfNote") {
                    sortParam = "fireOfNotePublishedInd";
                }
                if (sortParam == "lastUpdated") {
                    sortParam = "lastUpdatedTimestamp";
                }


                let orderBy = formatSort(sortParam, <SortDirection>pagingInfoRequest.sortDirection);
                let searchText = [];
                if (pagingInfoRequest.query && pagingInfoRequest.query.length > 0) {
                    searchText[0] = pagingInfoRequest.query;
                } else {
                    searchText = undefined;
                }
                let savedFireCentreFilter = savedFilters && savedFilters.selectedFireCentreCode ? savedFilters.selectedFireCentreCode : undefined;
                let savedFireOfNotePublishedIndFilter = savedFilters && savedFilters.selectedFireOfNotePublishedInd ? savedFilters.selectedFireOfNotePublishedInd : undefined;


                let fireCentreFilter = typedaction.payload.filters["selectedFireCentreCode"] ? typedaction.payload.filters["selectedFireCentreCode"] : savedFireCentreFilter;
                let fireOfNotePublishedInd = typedaction.payload.filters["selectedFireOfNotePublishedInd"] ? typedaction.payload.filters["selectedFireOfNotePublishedInd"] : savedFireOfNotePublishedIndFilter;

                const now = new Date()
                let currentFireYear = now.getFullYear()
                if (now.getMonth() < 3) {
                  currentFireYear -= 1
                }

                return this.incidentListService.getWildfireIncidentList(
                    undefined,
                    searchText,
                    [`${currentFireYear-1}`, `${currentFireYear}`],
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
                    `${pageNumber}`,
                    `${pageSize}`,
                    orderBy,
                    undefined,
                    'response'
                )
                    .pipe(
                        map((response: any) => {
                            return searchIncidentsSuccess(typedaction.componentId, response.body);
                        }),
                        catchError(error => of(SearchIncidentsError(typedaction.componentId, error)))
                    );


            }
        )
    );
}
