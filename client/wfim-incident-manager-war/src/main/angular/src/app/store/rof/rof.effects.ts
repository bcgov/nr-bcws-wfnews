import { Injectable } from '@angular/core';
import { MatSnackBar } from "@angular/material/snack-bar";
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { Action, Store } from '@ngrx/store';
import { AppConfigService, SearchActions, SortDirection } from '@wf1/core-ui';
import {
    PublicReportOfFireCommentListService,
    PublicReportOfFireListResource,
    PublicReportOfFireListService,
    PublicReportOfFireResource,
    PublicReportOfFireService,
    SimpleReportOfFireListResource,
    SimpleReportOfFireListService
} from '@wf1/incidents-rest-api';
import * as moment from 'moment';
import { Observable, of } from 'rxjs';
import { catchError, debounceTime, map, mergeMap, switchMap, withLatestFrom } from 'rxjs/operators';
import { RootState } from '..';
import { isMyComponent } from "../im/im.state";
import {
    ROFActionTypes,
    ROFLoadAction,
    ROFLoadCommentsAction,
    ROFLoadCommentsErrorAction,
    ROFLoadCommentsSuccessAction,
    ROFLoadErrorAction,
    ROFLoadSuccessAction,
    ROFPollingErrorAction,
    ROFPollingIgnoreAction,
    ROFPollingSuccessAction,
    ROFSearchErrorAction, ROFSearchIgnoreAction,
    ROFSearchSuccessAction
} from "./rof.actions";
import { ROF_MAP_COMPONENT_ID } from "./rof.state";

@Injectable()
export class RofEffects {

    constructor(
        private actions$: Actions,
        private store: Store<RootState>,
        private rofService: PublicReportOfFireService,
        private rofCommentListService: PublicReportOfFireCommentListService,
        private rofListService: PublicReportOfFireListService,
        private simpleRofListService: SimpleReportOfFireListService,
        private snackBar: MatSnackBar,
        private config: AppConfigService
    ) { }

    fetchRofs$ = createEffect(() => this.actions$.pipe(
        ofType(
            ROFActionTypes.ROF_SEARCH,
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
            if (!isMyComponent(store.rof, componentId)) {
                return of(new ROFSearchIgnoreAction())
            }

            const maxPageSize = (this.config.getConfig()) ? this.config.getConfig().application.maxListPageSize.rofs : 999;

            /**
             * Get list of Public Report of Fires.
             * Get list of Public Report of Fires.
             * @param searchText Filter the results by the searchText.
             * @param messageStatusCode Filter the results by the messageStatusCode.
             * @param reportOfFireNumber Filter the results by the reportOfFireNumber.
             * @param wildfireYear Filter the results by the wildfireYear.
             * @param interfaceFireInd Filter the results by the interfaceFireInd.
             * @param minimumReportedDate Filter the results by the minimumReportedDate.
             * @param reportedByName Filter the results by the reportedByName.
             * @param receivedByUserId Filter the results by the receivedByUserId.
             * @param receivedByUserGuid Filter the results by the receivedByUserGuid.
             * @param acknowledgedByUserId Filter the results by the acknowledgedByUserId.
             * @param acknowledgedByUserGuid Filter the results by the acknowledgedByUserGuid.
             * @param fireCentreOrgUnitIdentifier Filter the results by the fireCentreOrgUnitIdentifier.
             * @param zoneOrgUnitIdentifier Filter the results by the zoneOrgUnitIdentifier.
             * @param reportedByPartyName Filter the results by the reportedByPartyName.
             * @param callerName Filter the results by the callerName.
             * @param lostCallInd Filter the results by the lostCallInd.
             * @param availableForCallbackInd Filter the results by the availableForCallbackInd.
             * @param publicReportTypeCode Filter the results by the publicReportTypeCode.
             * @param fireSizeComparisionCode Filter the results by the fireSizeComparisionCode.
             * @param rateOfSpreadCode Filter the results by the rateOfSpreadCode.
             * @param smokeColourCode Filter the results by the smokeColourCode.
             * @param submittedAsOfTimestamp Filter the results by the submittedTimestamp.
             * @param receievedAsOfTimestamp Filter the results by the receievedTimestamp.
             * @param submittedOrReceivedAsOfTimestamp Filter the results by the submittedTimestamp or for RoFs that have not been submitted, by receievedTimestamp.
             * @param incidentWildfireYear Filter the results by the incidentWildfireYear.
             * @param incidentNumberSequence Filter the results by the incidentNumberSequence.
             * @param relayedInd Filter the results by the relayedInd.
             * @param pageNumber The page number of the results to be returned.
             * @param pageRowCount The number of results per page.
             * @param orderBy Comma separated list of property names to order the result set by.
             * @param expand The level of child resources to load. Zero for no child resources.
             * @param restVersion The version of the Rest API supported by the requesting client.
             * @param observe set whether or not to return the data Observable as the body, response or events. defaults to returning the body.
             * @param reportProgress flag to report request and response progress.
             */
            return this.rofListService.getPublicReportOfFireList(
                store[ROF_MAP_COMPONENT_ID].query ? [store[ROF_MAP_COMPONENT_ID].query] : null, // searchText,
                store[ROF_MAP_COMPONENT_ID].filters.messageStatusCode || undefined, // messageStatusCode?: Array<string>,
                undefined, // reportOfFireNumber?: Array<string>,
                undefined, // wildfireYear?: Array<string>,
                undefined, // interfaceFireInd?: string,
                undefined, // minimumReportedDate?: string,
                undefined, // reportedByName?: Array<string>,
                undefined, // receivedByName?: Array<string>,
                undefined, // receivedByUserGuid?: Array<string>,
                undefined, // acknowledgedByName?: Array<string>,
                undefined, // acknowledgedByUserGuid?: Array<string>,
                store[ROF_MAP_COMPONENT_ID].filters.fireCentreOrgUnitIdentifier || undefined, // fireCentreOrgUnitIdentifier?: Array<string>,
                store[ROF_MAP_COMPONENT_ID].filters.zoneOrgUnitIdentifier || undefined, // zoneOrgUnitIdentifier?: Array<string>,
                undefined, // reportedByPartyName?: Array<string>,
                undefined, // callerName?: Array<string>,
                undefined, // lostCallInd?: string,
                undefined, // availableForCallbackInd?: string,
                formatFilter("publicReportTypeCode", store[ROF_MAP_COMPONENT_ID].filters) || undefined, // publicReportTypeCode?: Array<string>,
                undefined, // fireSizeComparisionCode?: Array<string>,
                undefined, // rateOfSpreadCode?: Array<string>,
                undefined, // smokeColourCode?: Array<string>,
                undefined,
                undefined,
                getTimeFilterValue(store[ROF_MAP_COMPONENT_ID].filters.submittedAsOfTimestamp),
                undefined,
                undefined,
                undefined,
                undefined, // pageNumber?: string,
                maxPageSize.toString(), // pageRowCount?: string,
                formatSort(store[ROF_MAP_COMPONENT_ID].sortParam, store[ROF_MAP_COMPONENT_ID].sortDirection), // orderBy?: string,
            ).pipe(
                map((response: PublicReportOfFireListResource) => {
                    if (response.totalPageCount > 1) {
                        this.snackBar.open("Returned more than the maximum allowed number of results.  Please refine your filters", null, { duration: 5000 });
                    }
                    return new ROFSearchSuccessAction(componentId, response);
                }),
                catchError(error => of(new ROFSearchErrorAction()))
            );
        })
    ));

    fetchSimpleRofs$ = createEffect(() => this.actions$.pipe(
        ofType(
            ROFActionTypes.POLLING_ROF
        ),
        withLatestFrom(this.store),
        switchMap(([action, store]) => {
            if (!store || !store.rof || !store.rof.lastSyncDate) {
                return of(new ROFPollingIgnoreAction())
            }
            const lastChangeTime = moment(store.rof.lastSyncDate).subtract(1, 'minutes').unix() * 1000; //convert to epoch from unix
            return this.simpleRofListService.getSimpleReportOfFireList(
                undefined,
                undefined,
                undefined, // reportOfFireNumber?: Array<string>,
                undefined, // wildfireYear?: Array<string>,
                undefined, // interfaceFireInd?: string,
                undefined, // minimumReportedDate?: string,
                undefined, // reportedByName?: Array<string>,
                undefined, // receivedByName?: Array<string>,
                undefined, // receivedByUserGuid?: Array<string>,
                undefined, // acknowledgedByName?: Array<string>,
                undefined, // acknowledgedByUserGuid?: Array<string>,
                undefined, // fireCentreOrgUnitIdentifier?: Array<string>,
                undefined, // zoneOrgUnitIdentifier?: Array<string>,
                undefined, // reportedByPartyName?: Array<string>,
                undefined, // callerName?: Array<string>,
                undefined, // lostCallInd?: string,
                undefined, // availableForCallbackInd?: string,
                undefined, // publicReportTypeCode?: Array<string>,
                undefined, // fireSizeComparisionCode?: Array<string>,
                undefined, // rateOfSpreadCode?: Array<string>,
                undefined, // smokeColourCode?: Array<string>,
                undefined,
                undefined,
                undefined,
                undefined,
                lastChangeTime.toString())
                .pipe(
                    switchMap((response: SimpleReportOfFireListResource) =>
                        of(new ROFPollingSuccessAction(response, store[ROF_MAP_COMPONENT_ID]))
                    ),
                    catchError(error => of(new ROFPollingErrorAction()))
                );
        })
    ));

    getRof$: Observable<Action> = createEffect(() => this.actions$.pipe(
        ofType(
            ROFActionTypes.LOAD_ROF
        ),
        debounceTime(400),
        withLatestFrom(this.store),
        mergeMap(([action, store]) => {
            const rofAction = action as ROFLoadAction;
            return this.rofService.getPublicReportOfFire(
                `${rofAction.wildfireYear}`,
                `${rofAction.reportOfFireNumber}`
            ).pipe(
                map( ( response: PublicReportOfFireResource ) => {
                    return new ROFLoadSuccessAction(response)
                } ),
                catchError( ( error ) => {
                    this.snackBar.open(
                        "Failed to load Report of Fire.",
                        null,
                        { duration: 5000 }
                    )

                    return of( new ROFLoadErrorAction() )
                } )
            );
        })
    ));

    getRofComments$: Observable<Action> = createEffect(() => this.actions$.pipe(
        ofType(
            ROFActionTypes.LOAD_ROF_COMMENTS
        ),
        debounceTime(400),
        withLatestFrom(this.store),
        mergeMap(([action, store]) => {
            const rofAction = action as ROFLoadCommentsAction;
            return this.rofCommentListService.getPublicReportOfFireCommentList(
                `${rofAction.wildfireYear}`,
                `${rofAction.reportOfFireNumber}`,
                undefined,
                undefined,
                undefined,
                undefined,
                'enteredTimestamp DESC',
                undefined,
                undefined,
                undefined
            ).pipe(
                map( ( response: PublicReportOfFireListResource ) => {
                    return new ROFLoadCommentsSuccessAction( rofAction.wildfireYear, rofAction.reportOfFireNumber, response )
                } ),
                catchError(error => of(new ROFLoadCommentsErrorAction()))
            );
        })
    ));
}

const formatSort = (param: string, direction: SortDirection) => param && direction ? `${param} ${direction}` : undefined;

const formatFilter = (param: string, activeFilters) => {
    const active = activeFilters[param] || [];
    return active.length ? active : null;
};

const getTimeFilterValue = (code: string[]) => {
    function getFiscalYear(): moment.Moment {
        if (moment().quarter() == 1) {
            result = moment().subtract(1, 'year').month('April').startOf('month');
        } else {
            result = moment().month('April').startOf('month');
        }

        return result;
    }

    const EPOCH_MULTIPLIER = 1000;
    let result = undefined;
    if (code && code.length > 0) {
        if (code.includes('LFISYEAR')) {
            result = getFiscalYear().subtract(1, 'years').unix() * EPOCH_MULTIPLIER;
        } else if (code.includes('LCALYEAR')) {
            result = moment().startOf('year').subtract(1, 'years').unix() * EPOCH_MULTIPLIER;
        } else if (code.includes('FISYEAR')) {
            result = getFiscalYear().unix() * EPOCH_MULTIPLIER;
        } else if (code.includes('CALYEAR')) {
            result = moment().startOf('year').unix() * EPOCH_MULTIPLIER;
        } else if (code.includes('L365D')) {
            result = moment().startOf('day').subtract(365, 'days').unix() * EPOCH_MULTIPLIER;
        } else if (code.includes('L30D')) {
            result = moment().startOf('day').subtract(30, 'days').unix() * EPOCH_MULTIPLIER;
        } else if (code.includes('L7D')) {
            result = moment().startOf('day').subtract(7, 'days').unix() * EPOCH_MULTIPLIER;
        } else if (code.includes('L24H')) {
            result = moment().startOf('hour').subtract(24, 'hours').unix() * EPOCH_MULTIPLIER;
        }

        if (result) {
            return result.toString();
        }
    }
    return undefined;
}
