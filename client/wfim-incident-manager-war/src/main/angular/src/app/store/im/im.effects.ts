import { HttpClient, HttpResponse } from '@angular/common/http';
import { Action, Store } from '@ngrx/store';
import { Actions, createEffect, ofType } from '@ngrx/effects';
// Services
import {
    IncidentApprovalService,
    IncidentCommentListResource,
    IncidentCommentListService,
    IncidentCommentResource,
    IncidentVerificationService,
    PublicReportOfFireListResource,
    PublicReportOfFireListService,
    SimpleWildfireIncidentListResource,
    SimpleWildfireIncidentListService,
    WildfireIncidentListResource,
    WildfireIncidentListService,
    WildfireIncidentResource,
    WildfireIncidentService,
} from '@wf1/incidents-rest-api';
import { Injectable } from '@angular/core';
// External
import { Observable, of } from 'rxjs';
import {
    catchError,
    debounceTime,
    delay,
    exhaustMap,
    filter,
    map,
    mergeMap,
    switchMap,
    tap,
    withLatestFrom
} from 'rxjs/operators';
import { MatSnackBar } from "@angular/material/snack-bar";
// Models
import { AppConfigService, SearchActions, SortDirection } from '@wf1/core-ui';
import * as IncidentActions from './im.actions';
import {
    IncidentCommentLoadAction,
    IncidentCommentLoadErrorAction,
    IncidentCommentLoadSuccessAction,
    IncidentLoadAction,
    IncidentPollingSuccessAction,
    IncidentRofsLoadAction,
    IncidentRofsLoadErrorAction,
    IncidentRofsLoadSuccessAction,
    SaveCommentAction,
    saveCommentError,
    saveCommentSuccess,
    selectIncidentForEditingError,
    selectIncidentForEditingSuccess
} from './im.actions';
import { RootState } from '..';
import { INCIDENT_COMPONENT_ID, INCIDENT_MAP_COMPONENT_ID, isMyComponent } from "./im.state";
import * as moment from "moment";

// Redux

@Injectable()
export class IncidentManagementEffects {
    constructor(
        private actions$: Actions,
        private store: Store<RootState>,
        private incidentApprovalService: IncidentApprovalService,
        private incidentListService: WildfireIncidentListService,
        private simpleIncidentListService: SimpleWildfireIncidentListService,
        private incidentService: WildfireIncidentService,
        private incidentCommentService: IncidentCommentListService,
        private incidentVerificationService: IncidentVerificationService,
        private publicReportOfFireListService: PublicReportOfFireListService,
        private snackbar: MatSnackBar,
        private config: AppConfigService,
        private http: HttpClient
    ) { }


    getIncidentSearch$ = createEffect(() => this.actions$.pipe(
        ofType(
            IncidentActions.IncidentActionTypes.INCIDENT_SEARCH,
            SearchActions.SearchActionTypes.UPDATE_SEARCH_QUERY,
            SearchActions.SearchActionTypes.RESET_SEARCH_QUERY,
            SearchActions.SearchActionTypes.UPDATE_SORT,
            SearchActions.SearchActionTypes.UPDATE_ACTIVE_FILTERS,
            SearchActions.SearchActionTypes.UPDATE_HIDDEN_FILTERS,
            SearchActions.SearchActionTypes.CLEAR_FILTER,
            SearchActions.SearchActionTypes.CLEAR_ALL_FILTERS,
            SearchActions.SearchActionTypes.REFRESH_SEARCH
        ),
        delay(1000),
        withLatestFrom(this.store),
        switchMap(([action, store]) => {
            const componentId = action['componentId'];
            if (!isMyComponent(store.incidentManagement, componentId)) {
                return of(new IncidentActions.IncidentSearchIgnoreAction())
            }

            let maxPageSize = 500;
            if (this.config.getConfig()) {
                if (componentId == INCIDENT_COMPONENT_ID) {
                    maxPageSize = this.config.getConfig().application.maxListPageSize['incidents-table'] ? this.config.getConfig().application.maxListPageSize['incidents-table'] : 500;
                }
            }

            // console.log("store[componentId].query: ", store[componentId].query);
            const searchText = store[componentId].query ? store[componentId].query.split(/\s+/) : null;
            // console.log("searchText: ", searchText);

            //console.log(store[componentId].filters, store[componentId].hiddenFilters);
            return this.incidentListService.getWildfireIncidentList(
                searchText,
                formatFilter('wildfireYear', store[componentId].filters, store[componentId].hiddenFilters), // wildfireYear?: Array<string>,
                undefined, // incidentNumberSequence?: Array<string>,
                undefined, // incidentId?: Array<string>,
                undefined, // incidentName?: Array<string>,
                undefined, // claimExpectedInd?: string,
                undefined, // rehabilitationPlanRequiredInd?: string,
                undefined, // paperTrailedInd?: string,
                undefined, // fieldPhotoInd?: string,
                undefined, // fireReportCompleteInd?: string,
                formatFilter('incidentCommanderName', store[componentId].filters, store[componentId].hiddenFilters), // incidentCommanderName?: Array<string>,
                getIndicatorValue('incidentCommanderSignOffInd', store[componentId].filters), // incidentCommanderSignOffInd?: string,
                undefined, // agencyAssistanceTaskIdentifier?: Array<string>,
                undefined, // zoneWildfireOfficerName?: Array<string>,
                getIndicatorValue('zoneWildfireOfficerSignOffInd', store[componentId].filters), // zoneWildfireOfficerSignOffInd?: string,
                formatFilter('fireCentreOrgUnitIdentifier', store[componentId].filters, store[componentId].hiddenFilters), // fireCentreOrgUnitIdentifier?: Array<string>,
                formatFilter('zoneOrgUnitIdentifier', store[componentId].filters, store[componentId].hiddenFilters), // zoneOrgUnitIdentifier?: Array<string>,
                undefined, // detectionSourceCode?: Array<string>,
                undefined, // fireClassificationCode?: Array<string>,
                undefined, // agencyAssistTypeCode?: Array<string>,
                undefined, // responseTypeCode?: Array<string>,
                undefined, // assistingPartyName?: Array<string>,
                undefined, // discoveredByPartyName?: Array<string>,
                undefined, // firstActionedByPartyName?: Array<string>,
                undefined, // leadByPartyName?: Array<string>,
                formatFilter('incidentStatusCode', store[componentId].filters, store[componentId].hiddenFilters), // incidentStatusCode?: Array<string>,
                undefined, // incidentNumberLabel?: Array<string>,
                undefined, // probabilityOfInitialAttackSuccessCode?: Array<string>,
                formatFilter('suspectedCauseCategoryCode', store[componentId].filters, store[componentId].hiddenFilters), // suspectedCauseCategoryCode?: Array<string>,
                formatFilter('incidentCategoryCode', store[componentId].filters, store[componentId].hiddenFilters), // incidentCategoryCode?: Array<string>,
                formatFilter('incidentTypeCode', store[componentId].filters, store[componentId].hiddenFilters), // incidentTypeCode?: Array<string>,
                undefined, // fireOfNotePublishedCode?: Array<string>,
                formatFilter('stageOfControlCode', store[componentId].filters, store[componentId].hiddenFilters), // stageOfControlCode?: Array<string>,
                undefined, // pageNumber?: string,
                maxPageSize.toString(), // pageRowCount?: string,
                formatSort(store[componentId].sortParam, store[componentId].sortDirection), // orderBy?: string,
                0 //expand?: number
            ).pipe(
                map((response: WildfireIncidentListResource) => {
                    if (response.totalPageCount > 1) {
                        this.snackbar.open("Returned more than the maximum allowed number of results.  Please refine your filters", null, { duration: 5000 });
                    }
                    return new IncidentActions.IncidentSearchSuccessAction(response, componentId);
                }),
                catchError(error => of(new IncidentActions.IncidentSearchErrorAction()))
            );
        })
    ));


    getIncidentSimpleSearch$ = createEffect(() => this.actions$.pipe(
        ofType(
            IncidentActions.IncidentActionTypes.INCIDENT_SIMPLE_SEARCH,
            SearchActions.SearchActionTypes.UPDATE_SEARCH_QUERY,
            SearchActions.SearchActionTypes.RESET_SEARCH_QUERY,
            SearchActions.SearchActionTypes.UPDATE_SORT,
            SearchActions.SearchActionTypes.UPDATE_ACTIVE_FILTERS,
            SearchActions.SearchActionTypes.UPDATE_HIDDEN_FILTERS,
            SearchActions.SearchActionTypes.CLEAR_FILTER,
            SearchActions.SearchActionTypes.CLEAR_ALL_FILTERS,
            SearchActions.SearchActionTypes.REFRESH_SEARCH
        ),
        delay(1000),
        withLatestFrom(this.store),
        switchMap(([action, store]) => {
            const componentId = action['componentId'];
            if (!isMyComponent(store.incidentManagementMap, componentId)) {
                return of(new IncidentActions.IncidentSimpleSearchIgnoreAction())
            }

            let maxPageSize = 500;
            if (this.config.getConfig()) {
                if (componentId == INCIDENT_MAP_COMPONENT_ID) {
                    maxPageSize = this.config.getConfig().application.maxListPageSize.incidents ? this.config.getConfig().application.maxListPageSize.incidents : 500;
                }
            }

            // console.log("store[componentId].query: ", store[componentId].query);
            const searchText = store[componentId].query ? store[componentId].query.split(/\s+/) : null;
            // console.log("searchText: ", searchText);

            //console.log(store[componentId].filters, store[componentId].hiddenFilters);
            return this.simpleIncidentListService.getSimpleWildfireIncidentList(
                // store[componentId].query ? [store[componentId].query] : null,
                searchText,
                formatFilter('wildfireYear', store[componentId].filters, store[componentId].hiddenFilters), // wildfireYear?: Array<string>,
                undefined, // incidentNumberSequence?: Array<string>,
                formatFilter('fireCentreOrgUnitIdentifier', store[componentId].filters, store[componentId].hiddenFilters), // fireCentreOrgUnitIdentifier?: Array<string>,
                formatFilter('zoneOrgUnitIdentifier', store[componentId].filters, store[componentId].hiddenFilters), // zoneOrgUnitIdentifier?: Array<string>,
                formatFilter('incidentStatusCode', store[componentId].filters, store[componentId].hiddenFilters), // incidentStatusCode?: Array<string>,
                formatFilter('incidentTypeCode', store[componentId].filters, store[componentId].hiddenFilters), // incidentTypeCode?: Array<string>,
                formatFilter('stageOfControlCode', store[componentId].filters, store[componentId].hiddenFilters), // stageOfControlCode?: Array<string>,
                formatFilter('suspectedCauseCategoryCode', store[componentId].filters, store[componentId].hiddenFilters), // suspectedCauseCategoryCode?: Array<string>,
                undefined,
                undefined, // pageNumber?: string,
                maxPageSize.toString(), // pageRowCount?: string,
                formatSort(store[componentId].sortParam, store[componentId].sortDirection), // orderBy?: string,
                0 //expand?: number
            ).pipe(
                map((response: SimpleWildfireIncidentListResource) => {
                    if (response.totalPageCount > 1) {
                        this.snackbar.open("Returned more than the maximum allowed number of results.  Please refine your filters", null, { duration: 5000 });
                    }
                    return new IncidentActions.IncidentSimpleSearchSuccessAction(response, componentId);
                }),
                catchError(error => of(new IncidentActions.IncidentSimpleSearchErrorAction()))
            );
        })
    ));


    getSimpleIncidents$ = createEffect(() => this.actions$.pipe(
        ofType(
            IncidentActions.IncidentActionTypes.POLLING_INCIDENT
        ),
        withLatestFrom(this.store),
        exhaustMap(([action, store]) => {
            let componentId = INCIDENT_MAP_COMPONENT_ID;
            if (!store || !store.incidentManagementMap || !store.incidentManagementMap.lastSyncDate) {
                return of(new IncidentActions.IncidentPollingIgnoreAction())
            }

            const lastChangeTime = moment(store.incidentManagementMap.lastSyncDate).subtract(1, 'minutes').unix() * 1000; //convert to epoch from unix
            return this.simpleIncidentListService.getSimpleWildfireIncidentList(
                store[componentId].query ? [store[componentId].query] : null,
                formatFilter('wildfireYear', store[componentId].filters, store[componentId].hiddenFilters), // wildfireYear?: Array<string>,
                undefined, // incidentNumberSequence?: Array<string>,
                formatFilter('fireCentreOrgUnitIdentifier', store[componentId].filters, store[componentId].hiddenFilters), // fireCentreOrgUnitIdentifier?: Array<string>,
                formatFilter('zoneOrgUnitIdentifier', store[componentId].filters, store[componentId].hiddenFilters), // zoneOrgUnitIdentifier?: Array<string>,
                formatFilter('incidentStatusCode', store[componentId].filters, store[componentId].hiddenFilters), // incidentStatusCode?: Array<string>,
                formatFilter('incidentTypeCode', store[componentId].filters, store[componentId].hiddenFilters), // incidentTypeCode?: Array<string>,
                formatFilter('stageOfControlCode', store[componentId].filters, store[componentId].hiddenFilters), // stageOfControlCode?: Array<string>,
                formatFilter('suspectedCauseCategoryCode', store[componentId].filters, store[componentId].hiddenFilters), // suspectedCauseCategoryCode?: Array<string>,
                lastChangeTime.toString(),
                undefined, // pageNumber?: string,
                undefined, // pageRowCount?: string,
                undefined, // orderBy?: string,
                0 //expand?: number
            ).pipe(
                switchMap((response: SimpleWildfireIncidentListResource) =>
                    of(new IncidentPollingSuccessAction(response, store[INCIDENT_MAP_COMPONENT_ID]))
                ),
                catchError(error => of(new IncidentActions.IncidentPollingErrorAction()))
            );
        })
    ));


    getIncident$ = createEffect(() => this.actions$.pipe(
        ofType(
            IncidentActions.IncidentActionTypes.INCIDENT_LOAD,
        ),
        debounceTime(400),
        withLatestFrom(this.store),
        mergeMap(([action, store]) => {
            const incidentAction = action as IncidentLoadAction;
            return this.incidentService.getWildfireIncident(
                `${incidentAction.wildfireYear}`,
                `${incidentAction.incidentNumberSequence}`,
                undefined // restVersion?: number,
            ).pipe(
                map((response: WildfireIncidentResource) => new IncidentActions.IncidentLoadSuccessAction(response)),
                catchError(error => of(new IncidentActions.IncidentLoadErrorAction()))
            );
        })
    ));


    getTabIncident$ = createEffect(() => this.actions$.pipe(
        ofType(IncidentActions.IncidentActionTypes.OPEN_INCIDENT_TAB, IncidentActions.IncidentActionTypes.SELECT_INCIDENT_FOR_EDITING),
        mergeMap((action: IncidentActions.OpenIncidentTabAction | IncidentActions.SelectIncidentForEditingAction) => {
            let typedAction;
            let wildfireYear;
            let incidentNumberSequence;
            //console.log(action);
            if (action.type == IncidentActions.IncidentActionTypes.OPEN_INCIDENT_TAB) {
                typedAction = <IncidentActions.OpenIncidentTabAction>action;
                wildfireYear = typedAction.incident.wildfireYear;
                incidentNumberSequence = typedAction.incident.incidentNumberSequence;
            } else {
                typedAction = <IncidentActions.SelectIncidentForEditingAction>action;
                wildfireYear = typedAction.payload.resource.wildfireYear;
                incidentNumberSequence = typedAction.payload.resource.incidentNumberSequence;
            }
            //console.log(wildfireYear, incidentNumberSequence);
            return this.incidentService.getWildfireIncident(
                `${wildfireYear}`, // wildfireYear: string,
                `${incidentNumberSequence}`, // incidentNumberSequence: string,
                undefined, // restVersion?: number,
                "response", // observe?: 'body'
            ).pipe(
                map(response => {
                    if (action.type == IncidentActions.IncidentActionTypes.OPEN_INCIDENT_TAB) return new IncidentActions.OpenIncidentTabSuccessAction(response.headers.get("ETag"), response.body);
                    else return selectIncidentForEditingSuccess(response.headers.get("ETag"), response.body);
                }),
                catchError(error => {
                    if (action.type == IncidentActions.IncidentActionTypes.OPEN_INCIDENT_TAB) return of(new IncidentActions.OpenIncidentTabErrorAction());
                    else return of(selectIncidentForEditingError(error));
                })
            );
        })
    ));


    updateIncident$ = createEffect(() => this.actions$.pipe(
        ofType(IncidentActions.IncidentActionTypes.UPDATE_INCIDENT),
        mergeMap((action: IncidentActions.UpdateIncidentAction) => {
            const { etag, incident } = action;

            const { incidentNumberSequence, wildfireYear } = incident;
            return this.incidentService.updateWildfireIncident(
                `${wildfireYear}`, //wildfireYear: string,
                `${incidentNumberSequence}`, // incidentNumberSequence: string,
                incident, //wildfireIncident: WildfireIncidentResource,
                undefined, // restVersion?: number,
                etag, // ifMatch: string,
                "response", // observe?: 'body'
            ).pipe(
                map((response: any) => new IncidentActions.UpdateIncidentSuccessAction(response.headers.get("ETag"), response.body)),
                tap((() => this.snackbar.open("Operation Successful", null, { duration: 5000 }))),
                catchError((response: any) =>{
                        localStorage.removeItem('isLoading'+incidentNumberSequence)
                        return of(new IncidentActions.UpdateIncidentErrorAction(response))
                    }
                )
            )
        })
    ));


    signOffIncident$ = createEffect(() => this.actions$.pipe(
        ofType(IncidentActions.IncidentActionTypes.SIGN_OFF_INCIDENT),
        mergeMap(
            (action: IncidentActions.SignOffIncidentAction) => {
                const { incidentNumberSequence, wildfireYear } = action;
                return this.incidentVerificationService.signoffIncidentVerification(
                    `${wildfireYear}`, // wildfireYear: string,
                    `${incidentNumberSequence}`, // incidentNumberSequence: string,
                    null, // restVersion?: number,
                    "response", // observe?: 'body'
                )
                    .pipe(
                        map((response: HttpResponse<WildfireIncidentResource>) => new IncidentActions.UpdateIncidentSuccessAction(response.headers.get("ETag"), response.body)),
                        tap((() => this.snackbar.open("Operation Successful", null, { duration: 5000 }))),
                        catchError(error => of(new IncidentActions.UpdateIncidentErrorAction(error)))
                    );
            }
        )
    ));


    approveIncident$ = createEffect(() => this.actions$.pipe(
        ofType(IncidentActions.IncidentActionTypes.APPROVE_INCIDENT),
        mergeMap(
            (action: IncidentActions.ApproveIncidentAction) => {
                const { incidentNumberSequence, wildfireYear } = action;
                return this.incidentApprovalService.signoffIncidentApproval(
                    `${wildfireYear}`, // wildfireYear: string,
                    `${incidentNumberSequence}`, // incidentNumberSequence: string,
                    null, // restVersion?: number,
                    "response", // observe?: 'body'
                )
                    .pipe(
                        map((response: HttpResponse<WildfireIncidentResource>) => new IncidentActions.UpdateIncidentSuccessAction(response.headers.get("ETag"), response.body)),
                        tap((() => this.snackbar.open("Operation Successful", null, { duration: 5000 }))),
                        catchError(error => of(new IncidentActions.UpdateIncidentErrorAction(error)))
                    );
            }
        )
    ));


    unsignIncident$ = createEffect(() => this.actions$.pipe(
        ofType(IncidentActions.IncidentActionTypes.UNSIGN_INCIDENT),
        mergeMap(
            (action: IncidentActions.SignOffIncidentAction) => {
                const { incidentNumberSequence, wildfireYear } = action;
                return this.incidentVerificationService.unsignIncidentVerification(
                    `${wildfireYear}`, // wildfireYear: string,
                    `${incidentNumberSequence}`, // incidentNumberSequence: string,
                    null, // restVersion?: number,
                    "response", // observe?: 'body'
                )
                    .pipe(
                        map((response: HttpResponse<WildfireIncidentResource>) => new IncidentActions.UpdateIncidentSuccessAction(response.headers.get("ETag"), response.body)),
                        tap((() => this.snackbar.open("Operation Successful", null, { duration: 5000 }))),
                        catchError(error => of(new IncidentActions.UpdateIncidentErrorAction(error)))
                    );
            }
        )
    ));


    unapproveIncident$ = createEffect(() => this.actions$.pipe(
        ofType(IncidentActions.IncidentActionTypes.UNAPPROVE_INCIDENT),
        mergeMap(
            (action: IncidentActions.ApproveIncidentAction) => {
                const { incidentNumberSequence, wildfireYear } = action;
                return this.incidentApprovalService.unsignIncidentApproval(
                    `${wildfireYear}`, // wildfireYear: string,
                    `${incidentNumberSequence}`, // incidentNumberSequence: string,
                    null, // restVersion?: number,
                    "response", // observe?: 'body'
                )
                    .pipe(
                        map((response: HttpResponse<WildfireIncidentResource>) => new IncidentActions.UpdateIncidentSuccessAction(response.headers.get("ETag"), response.body)),
                        tap((() => this.snackbar.open("Operation Successful", null, { duration: 5000 }))),
                        catchError(error => of(new IncidentActions.UpdateIncidentErrorAction(error)))
                    );
            }
        )
    ));


    openCauseCodes$ = createEffect(() => this.actions$.pipe(
        ofType(IncidentActions.IncidentActionTypes.OPEN_INCIDENT_CAUSE_CODE),
        debounceTime(200),
        switchMap((action: IncidentActions.OpenIncidentCauseCodeAction) => {
            return this.http.get(`${this.config.getConfig().causeCodeConfig.causeCodeToken.url}`).pipe(
                map((getTokenResponse: any) => {
                    if (getTokenResponse && getTokenResponse.userAttributes) {
                        try {
                            this.http.post(`${this.config.getConfig().causeCodeConfig.rest.url}`, getTokenResponse.userAttributes.userToken).pipe(
                                postTokenResponse => postTokenResponse
                                , catchError(error => of(new IncidentActions.OpenIncidentCauseCodeErrorAction('Invalid token response', error)))
                            ).subscribe((postTokenResponse) => {
                                const options = 'resizable=yes,scrollbars=yes,statusbar=yes,status=yes';
                                const windowName = 'im-cause-codes';
                                const causeCodeWebUrl = `${this.config.getConfig().causeCodeConfig.web.url}/pages/causecodes/causecodes.xhtml?AUTH_GUID=${getTokenResponse.userAttributes.guid}&incidentId=${action.incidentId}`;
                                const causeCodeWindow = window.open(causeCodeWebUrl, windowName, options);
                                let interval = setInterval(() => {
                                    if (!causeCodeWindow) {
                                        action.refreshCauseEmitter.emit();
                                        clearInterval(interval);
                                    } else if (causeCodeWindow.closed) {
                                        action.refreshCauseEmitter.emit();
                                        clearInterval(interval);
                                    }
                                }, 1000);
                                return new IncidentActions.OpenIncidentCauseCodeSuccessAction();
                            });
                        } catch (error) {
                            return new IncidentActions.OpenIncidentCauseCodeErrorAction('Open Incident Cause Code Error', error);
                        }
                        return new IncidentActions.OpenIncidentCauseCodeSuccessAction();
                    } else {
                        return new IncidentActions.OpenIncidentCauseCodeErrorAction('Open Incident Cause Code Error', getTokenResponse);
                    }
                }),
            );
        }),
        catchError(error => of(new IncidentActions.OpenIncidentCauseCodeErrorAction(error, error.toString())))
    ));


    getIncidentComments$ = createEffect(() => this.actions$.pipe(
        ofType(
            IncidentActions.IncidentActionTypes.LOAD_INCIDENT_COMMENT
        ),
        debounceTime(400),
        withLatestFrom(this.store),
        mergeMap(([action, store]) => {
            const incidentAction = action as IncidentCommentLoadAction;
            return this.incidentCommentService.getIncidentCommentList(
                `${incidentAction.wildfireYear}`,
                `${incidentAction.incidentNumberSequence}`,
                undefined,
                undefined,
                'enteredTimestamp DESC',
            ).pipe(
                map((response: IncidentCommentListResource) => new IncidentCommentLoadSuccessAction(incidentAction.wildfireYear, incidentAction.incidentNumberSequence, response)),
                catchError(error => of(new IncidentCommentLoadErrorAction()))
            );
        })
    ));


    saveIncidentComments$ = createEffect(() => this.actions$.pipe(
        ofType(
            IncidentActions.IncidentActionTypes.SAVE_COMMENT
        ),
        switchMap((action: SaveCommentAction) =>
            this.incidentCommentService.createIncidentComment(
                `${action.payload.wildfireYear}`,
                `${action.payload.incidentNumberSequence}`,
                action.payload.value,
                undefined,

            ).pipe(
                map((response: IncidentCommentResource) => saveCommentSuccess(response)),
                catchError(error => of(saveCommentError(error)))
            )
        )
    ));


    getIncidentRofs$ = createEffect(() => this.actions$.pipe(
        ofType(
            IncidentActions.IncidentActionTypes.LOAD_INCIDENTrofs
        ),
        debounceTime(400),
        withLatestFrom(this.store),
        mergeMap(([action, store]) => {
            const incidentAction = action as IncidentRofsLoadAction;

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
            return this.publicReportOfFireListService.getPublicReportOfFireList(
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
                [`${incidentAction.wildfireYear}`],
                [`${incidentAction.incidentNumberSequence}`],
                undefined,
                undefined,
                undefined,
                'receivedTimestamp DESC',
                undefined,
                undefined,
                'body',
                undefined)
                .pipe(
                    map((response: PublicReportOfFireListResource) => new IncidentRofsLoadSuccessAction(incidentAction.wildfireYear, incidentAction.incidentNumberSequence, response.collection)),
                    catchError(error => of(new IncidentRofsLoadErrorAction()))
                );
        })
    ));
}

const formatFilter = (param: string, activeFilters, hiddenFilters) => {
    let active = [];
    let hidden = [];

    if (activeFilters) {
        active = activeFilters[param];
    }
    if (hiddenFilters) {
        hidden = hiddenFilters[param];
    }

    if (active && hidden && active.length > 0 && hidden.length > 0) {
        return [...active, ...hidden];
    } else if (active && active.length > 0) {
        return active;
    } else if (hidden && hidden.length > 0) {
        return hidden;
    }

    return undefined;
};

const getIndicatorValue = (param: string, filters) => {
    if (param && filters) {
        if (filters[param]) {
            const yes = filters[param].includes('true');
            const no = filters[param].includes('false');
            if (yes && no) return;
            if (yes) return 'true';
            if (no) return 'false';
        }
    }
    return;
};

const concatFilter = (param: string, filters) => {
    return filter.hasOwnProperty(param) ? filters[param].join(",") : undefined;
};

const formatSort = (param: string, direction: SortDirection) => param && direction ? `${param} ${direction}` : undefined;

const imUrls = ['/incidents/list', '/(root:external)'];
const isIMSearch = (url: string) => imUrls.includes(url);
