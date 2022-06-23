import { Injectable } from '@angular/core';
import { MatSnackBar } from "@angular/material/snack-bar";
import { Action, Store } from '@ngrx/store';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { Observable, of } from 'rxjs';
import { catchError, debounceTime, map, mergeMap, switchMap, tap, withLatestFrom } from 'rxjs/operators';
import { AppConfigService, SearchActions, SortDirection, WindowMessagingService } from '@wf1/core-ui';
import {
    ProvisionalZoneListResource,
    ProvisionalZoneListService,
    ProvisionalZoneResource,
    ProvisionalZoneService
} from '@wf1/incidents-rest-api';
// Models
import { RootState } from '..';
import {
    NROFActionTypes,
    NROFLoadAction,
    NROFLoadErrorAction,
    NROFLoadSuccessAction, NROFPollingErrorAction, NROFPollingIgnoreAction, NROFPollingSuccessAction,
    NROFSearchErrorAction,
    NROFSearchIgnoreAction,
    NROFSearchSuccessAction
} from "./nrof.actions";
import { isMyComponent } from "../im/im.state";
import * as moment from "moment";
import { NROF_MAP_COMPONENT_ID } from "./nrof.state";

@Injectable()
export class NrofEffects {

    constructor(
        private actions$: Actions,
        private store: Store<RootState>,
        private nrofService: ProvisionalZoneService,
        private nrofListService: ProvisionalZoneListService,
        private messagingService: WindowMessagingService,
        private snackBar: MatSnackBar,
        private config: AppConfigService
    ) { }


    fetchNrofs$ = createEffect(() => this.actions$.pipe(
        ofType(
            NROFActionTypes.NROF_SEARCH,
            SearchActions.SearchActionTypes.UPDATE_SEARCH_QUERY,
            SearchActions.SearchActionTypes.RESET_SEARCH_QUERY,
            SearchActions.SearchActionTypes.UPDATE_SORT,
            SearchActions.SearchActionTypes.UPDATE_ACTIVE_FILTERS,
            SearchActions.SearchActionTypes.CLEAR_FILTER,
            SearchActions.SearchActionTypes.CLEAR_ALL_FILTERS,
            SearchActions.SearchActionTypes.REFRESH_SEARCH
        ),
        debounceTime(400),
        withLatestFrom(this.store),
        switchMap(([action, store]) => {
            const componentId = action['componentId'];
            if (!isMyComponent(store.nrofMap, componentId)) {
                return of( new NROFSearchIgnoreAction() )
            }
            const maxPageSize = (this.config.getConfig()) ? this.config.getConfig().application.maxListPageSize.rofs : 999;
            let dismissedFilter = undefined;
            if (store[componentId].filters.dismissedInd) {
                if (store[componentId].filters.dismissedInd == "Yes") {
                    dismissedFilter = true;
                } else if (store[componentId].filters.dismissedInd == "No") {
                    dismissedFilter = false;
                }
            }
            return this.nrofListService.getProvisionalZoneList(
                undefined,
                undefined,
                undefined,
                store[componentId].filters.fireCentreOrgUnitIdentifier || undefined, // fireCentreOrgUnitIdentifier?: Array<string>,
                undefined,
                dismissedFilter,
                undefined,
                undefined,
                undefined,
                store[componentId].query ? [store[componentId].query] : undefined,
                undefined,
                undefined,
                undefined,
                undefined,
                maxPageSize.toString(), // pageRowCount?: string,
                formatSort(store[componentId].sortParam, store[componentId].sortDirection), // orderBy?: string,
            ).pipe(
                map((response: ProvisionalZoneListResource) => {
                    if (response.totalPageCount > 1) {
                        this.snackBar.open("Returned more than the maximum allowed number of results.  Please refine your filters", null, { duration: 5000 });
                    }
                    return new NROFSearchSuccessAction(componentId, response);
                }),
                catchError(error => {
                    return of(new NROFSearchErrorAction(componentId))
                })
            );
        })
    ));


    fetchSimpleNrofs$ = createEffect(() => this.actions$.pipe(
        ofType(
            NROFActionTypes.POLLING_NROF
        ),
        withLatestFrom(this.store),
        switchMap(([action, store]) => {
            if (!store || !store.nrofMap || !store.nrofMap.lastSyncDate) {
                return of(new NROFPollingIgnoreAction())
            }
            const lastChangeTime = moment(store.nrofMap.lastSyncDate).subtract(1, 'minutes').unix() * 1000; //convert to epoch from unix
            return this.nrofListService.getProvisionalZoneList(
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
                lastChangeTime.toString(),
                undefined,
                undefined,
                undefined
            ).pipe(
                switchMap((response: ProvisionalZoneListResource) =>
                    of(new NROFPollingSuccessAction(response, store[NROF_MAP_COMPONENT_ID]))
                ),
                catchError(error => of(new NROFPollingErrorAction()))
            );
        })
    ));


    getNrof$: Observable<Action> = createEffect(() => this.actions$.pipe(
        ofType(
            NROFActionTypes.LOAD_NROF
        ),
        debounceTime(400),
        withLatestFrom(this.store),
        mergeMap(([action, store]) => {
            const nrofAction = action as NROFLoadAction;
            return this.nrofService.getProvisionalZone(
                `${nrofAction.provisionalZoneGuid}`,
            ).pipe(
                map((response: ProvisionalZoneResource) => new NROFLoadSuccessAction(response)),
                catchError(error => of(new NROFLoadErrorAction()))
            );
        })
    ));

}

const formatSort = (param: string, direction: SortDirection) => param && direction ? `${param} ${direction}` : undefined;
