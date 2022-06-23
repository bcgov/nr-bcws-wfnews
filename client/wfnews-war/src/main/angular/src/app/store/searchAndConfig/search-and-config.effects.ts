import { Actions, createEffect, ofType } from "@ngrx/effects";
import { Observable, of } from "rxjs";
import { Action, Store } from "@ngrx/store";
import { AppConfigService, SearchActions } from "@wf1/core-ui";
import { catchError, debounceTime, map, switchMap, withLatestFrom } from "rxjs/operators";

import { Injectable } from "@angular/core";
import { RootState } from "../index";
import {
    IncidentApprovalService,
    IncidentCommentListService,
    IncidentVerificationService,
    PublicReportOfFireListService,
    SimpleWildfireIncidentListService,
    WildfireIncidentListService,
    WildfireIncidentService
} from "@wf1/incidents-rest-api";
import { MatSnackBar } from "@angular/material/snack-bar";
import { HttpClient } from "@angular/common/http";
import { saveUserPrefsError, saveUserPrefsSuccess, SearchAndConfigActionTypes } from "./search-and-config.actions";
import { convertToPreferenceResource } from "../../utils";
import { ROFActionTypes } from "../rof/rof.actions";


@Injectable()
export class SearchAndConfigEffects {
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
    ) {
    }


    saveUserPrefs$: Observable<Action> = createEffect(() => this.actions$.pipe(
        ofType(
            SearchActions.SearchActionTypes.UPDATE_SEARCH_QUERY,
            SearchActions.SearchActionTypes.RESET_SEARCH_QUERY,
            SearchActions.SearchActionTypes.UPDATE_SORT,
            SearchActions.SearchActionTypes.UPDATE_ACTIVE_FILTERS,
            SearchActions.SearchActionTypes.UPDATE_HIDDEN_FILTERS,
            SearchActions.SearchActionTypes.CLEAR_FILTER,
            SearchActions.SearchActionTypes.CLEAR_ALL_FILTERS,
            SearchAndConfigActionTypes.SAVE_USER_PREFS,
            ROFActionTypes.UPDATE_ROF_AUDIBLE_ALERT
        ),
        debounceTime(400),
        withLatestFrom(this.store),
        switchMap(([action, store]) => {
            let state = store[action['componentId']];
            return this.http.post(this.config.getConfig()['userPreferences']['preferencesUrl'], convertToPreferenceResource(action['componentId'], state))
                .pipe(
                    map((response) => saveUserPrefsSuccess(action['componentId'])),
                    catchError(error => of(saveUserPrefsError(action['componentId'], error)))
                )
        })
    ));



}
