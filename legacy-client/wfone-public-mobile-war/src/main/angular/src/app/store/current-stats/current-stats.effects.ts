import {Injectable} from "@angular/core";
import {Actions, Effect, ofType} from "@ngrx/effects";
import {catchError, concatMap, map, mergeMap, switchMap} from "rxjs/operators";
import {Observable, of} from "rxjs";
import {Action, Store} from "@ngrx/store";
import {RootState} from "../index";
import {
    convertToChartInfo,
    convertToErrorState,
    convertToOverviewActiveFireStats,
    convertToOverviewCurrentYearFireStats
} from "../../conversion/conversion-from-rest";
import {ArcGisService} from "../../services/arc-gis.service";
import {
    LOAD_ACTIVE_FIRES_BY_FIRE_CENTRES_CHART_INFO,
    LOAD_ACTIVE_FIRES_BY_STAGE_OF_CONTROL_CHART_INFO,
    LOAD_ACTIVE_FIRES_BY_SUSPECTED_CAUSES_CHART_INFO,
    LOAD_CURRENT_YEAR_FIRES_BY_FIRE_CENTRES_CHART_INFO,
    LOAD_CURRENT_YEAR_FIRES_BY_STAGE_OF_CONTROL_CHART_INFO,
    LOAD_CURRENT_YEAR_FIRES_BY_SUSPECTED_CAUSES_CHART_INFO,
    LOAD_OVERVIEW_ACTIVE_FIRE_STATS,
    LOAD_OVERVIEW_CURRENT_YEAR_FIRE_STATS,
    LoadActiveFiresByFireCentresChartInfoAction,
    loadActiveFiresByFireCentresChartInfoError,
    loadActiveFiresByFireCentresChartInfoSuccess,
    LoadActiveFiresByStageOfControlChartInfoAction,
    loadActiveFiresByStageOfControlChartInfoError,
    loadActiveFiresByStageOfControlChartInfoSuccess,
    LoadActiveFiresBySuspectedCausesChartInfoAction,
    loadActiveFiresBySuspectedCausesChartInfoError,
    loadActiveFiresBySuspectedCausesChartInfoSuccess,
    LoadCurrentYearFiresByFireCentresChartInfoAction,
    loadCurrentYearFiresByFireCentresChartInfoError,
    loadCurrentYearFiresByFireCentresChartInfoSuccess,
    LoadCurrentYearFiresByStageOfControlChartInfoAction,
    loadCurrentYearFiresByStageOfControlChartInfoError,
    loadCurrentYearFiresByStageOfControlChartInfoSuccess,
    LoadCurrentYearFiresBySuspectedCausesChartInfoAction,
    loadCurrentYearFiresBySuspectedCausesChartInfoError,
    loadCurrentYearFiresBySuspectedCausesChartInfoSuccess,
    LoadOverviewActiveFireStatsAction,
    loadOverviewActiveFireStatsError,
    loadOverviewActiveFireStatsSuccess,
    LoadOverviewCurrentYearFireStatsAction,
    loadOverviewCurrentYearFireStatsError,
    loadOverviewCurrentYearFireStatsSuccess
} from "./current-stats.actions";
import {CONSTANTS} from "../../components/current-stats/current-stats-utils";
import {VmFireChartInfo} from "../../conversion/models";


@Injectable()
export class CurrentStatsEffects {
    constructor(
        private actions: Actions,
        private arcGisService: ArcGisService,
        private store$: Store<RootState>
    ) {
    }

    @Effect()
    getOverviewActiveFireStats: Observable<Action> = this.actions
        .pipe(
            ofType<LoadOverviewActiveFireStatsAction>(LOAD_OVERVIEW_ACTIVE_FIRE_STATS),
            mergeMap(payload => this.arcGisService.getActiveFireStats()
                .pipe(
                    map((response: any) => [response])
                )
            ),
            map((args) => {
                const responseActiveFiresStat = args[0];
                return [responseActiveFiresStat];
            }),
            mergeMap((args) => {
                const responseActiveFiresStat = args[0];

                return this.arcGisService.getActiveFireLastXDaysStats(CONSTANTS.CURRENT_STATS_ACTIVE_FIRES_LAST_X_DAYS_QUERY_VAL)
                    .pipe(
                        concatMap((responseActiveFiresLastXDaysStat: any) => {
                            const result = convertToOverviewActiveFireStats(responseActiveFiresStat,
                                responseActiveFiresLastXDaysStat, CONSTANTS.CURRENT_STATS_ACTIVE_FIRES_LAST_X_DAYS_QUERY_VAL);
                            // console.log("result: ", result);
                            return [loadOverviewActiveFireStatsSuccess(result)];
                        }),
                        catchError(error => {
                            return of(
                                loadOverviewActiveFireStatsError(convertToErrorState(error)),
                            );
                        })
                    );
            }),
        );


    @Effect()
    getActiveFiresByFireCentresChartInfo: Observable<Action> = this.actions.pipe(
        ofType(LOAD_ACTIVE_FIRES_BY_FIRE_CENTRES_CHART_INFO),
        switchMap(
        (action: LoadActiveFiresByFireCentresChartInfoAction) => {
                // console.log('getActiveFiresByFireCentresStats effect - 1');
                return this.arcGisService.getActiveFiresByFireCentresStats()
                    .pipe(
                        map((response: any) => {
                            // console.log('getActiveFiresByFireCentresStats effect - 2: ', response);
                            const fireChartInfo: VmFireChartInfo
                                = convertToChartInfo(action.payload.value, response);
                            // console.log('fireChartInfo: ', fireChartInfo);
                            return loadActiveFiresByFireCentresChartInfoSuccess(fireChartInfo);
                        }),
                        catchError(error => of(loadActiveFiresByFireCentresChartInfoError(convertToErrorState(error))))
                    );
            }
        )
    );

    @Effect()
    getActiveFiresBySuspectedCausesChartInfo: Observable<Action> = this.actions.pipe(
        ofType(LOAD_ACTIVE_FIRES_BY_SUSPECTED_CAUSES_CHART_INFO),
        switchMap(
            (action: LoadActiveFiresBySuspectedCausesChartInfoAction) => {
                // console.log('getActiveFiresBySuspectedCausesStats effect - 1');
                return this.arcGisService.getActiveFiresBySuspectedCausesStats()
                    .pipe(
                        map((response: any) => {
                            // console.log('getActiveFiresBySuspectedCausesStats effect - 2: ', response);
                            const fireChartInfo: VmFireChartInfo
                                = convertToChartInfo(action.payload.value, response);
                            // console.log('fireChartInfo: ', fireChartInfo);
                            return loadActiveFiresBySuspectedCausesChartInfoSuccess(fireChartInfo);
                        }),
                        catchError(error => of(loadActiveFiresBySuspectedCausesChartInfoError(convertToErrorState(error))))
                    );
            }
        )
    );

    @Effect()
    getActiveFiresByStageOfControlChartInfo: Observable<Action> = this.actions.pipe(
        ofType(LOAD_ACTIVE_FIRES_BY_STAGE_OF_CONTROL_CHART_INFO),
        switchMap(
            (action: LoadActiveFiresByStageOfControlChartInfoAction) => {
                // console.log('getActiveFiresByStageOfControlChartInfo effect - 1');
                return this.arcGisService.getActiveFiresByStageOfControlStats()
                    .pipe(
                        map((response: any) => {
                            // console.log('getActiveFiresByStageOfControlChartInfo effect - 2: ', response);
                            const fireChartInfo: VmFireChartInfo
                                = convertToChartInfo(action.payload.value, response);
                            // console.log('fireChartInfo: ', fireChartInfo);
                            return loadActiveFiresByStageOfControlChartInfoSuccess(fireChartInfo);
                        }),
                        catchError(error => of(loadActiveFiresByStageOfControlChartInfoError(convertToErrorState(error))))
                    );
            }
        )
    );

    @Effect()
    getOverviewCurrentYearFireStats: Observable<Action> = this.actions
        .pipe(
            ofType<LoadOverviewCurrentYearFireStatsAction>(LOAD_OVERVIEW_CURRENT_YEAR_FIRE_STATS),
            mergeMap(payload => this.arcGisService.getCurrentYearFireStats()
                .pipe(
                    map((response: any) => [response])
                )
            ),
            map((args) => {
                const responseCurrentYearFiresStat = args[0];
                return [responseCurrentYearFiresStat];
            }),
            mergeMap((args) => {
                const responseCurrentYearFiresStat = args[0];

                return this.arcGisService
                    .getCurrentYearFireLastXDaysStats(CONSTANTS.CURRENT_STATS_CURRENT_YEAR_FIRES_LAST_X_DAYS_QUERY_VAL)
                    .pipe(
                        concatMap((responseCurrentYearFiresLastXDaysStat: any) => {
                            const result = convertToOverviewCurrentYearFireStats(responseCurrentYearFiresStat,
                                responseCurrentYearFiresLastXDaysStat,
                                CONSTANTS.CURRENT_STATS_CURRENT_YEAR_FIRES_LAST_X_DAYS_QUERY_VAL);
                            // console.log("result: ", result);
                            return [loadOverviewCurrentYearFireStatsSuccess(result)];
                        }),
                        catchError(error => {
                            return of(
                                loadOverviewCurrentYearFireStatsError(convertToErrorState(error)),
                            );
                        })
                    );
            }),
        );

    @Effect()
    getCurrentYearFiresByFireCentresChartInfo: Observable<Action> = this.actions.pipe(
        ofType(LOAD_CURRENT_YEAR_FIRES_BY_FIRE_CENTRES_CHART_INFO),
        switchMap(
            (action: LoadCurrentYearFiresByFireCentresChartInfoAction) => {
                // console.log('getCurrentYearFiresByFireCentresChartInfo effect - 1');
                return this.arcGisService.getCurrentYearFiresByFireCentresStats()
                    .pipe(
                        map((response: any) => {
                            // console.log('getCurrentYearFiresByFireCentresChartInfo effect - 2: ', response);
                            const fireChartInfo: VmFireChartInfo
                                = convertToChartInfo(action.payload.value, response);
                            // console.log('fireChartInfo: ', fireChartInfo);
                            return loadCurrentYearFiresByFireCentresChartInfoSuccess(fireChartInfo);
                        }),
                        catchError(error => of(loadCurrentYearFiresByFireCentresChartInfoError(convertToErrorState(error))))
                    );
            }
        )
    );

    @Effect()
    getCurrentYearFiresBySuspectedCausesChartInfo: Observable<Action> = this.actions.pipe(
        ofType(LOAD_CURRENT_YEAR_FIRES_BY_SUSPECTED_CAUSES_CHART_INFO),
        switchMap(
            (action: LoadCurrentYearFiresBySuspectedCausesChartInfoAction) => {
                // console.log('getCurrentYearFiresBySuspectedCauseStats effect - 1');
                return this.arcGisService.getCurrentYearFiresBySuspectedCausesStats()
                    .pipe(
                        map((response: any) => {
                            // console.log('getCurrentYearFiresBySuspectedCauseStats effect - 2: ', response);
                            const fireChartInfo: VmFireChartInfo
                                = convertToChartInfo(action.payload.value, response);
                            // console.log('fireChartInfo: ', fireChartInfo);
                            return loadCurrentYearFiresBySuspectedCausesChartInfoSuccess(fireChartInfo);
                        }),
                        catchError(error => of(loadCurrentYearFiresBySuspectedCausesChartInfoError(convertToErrorState(error))))
                    );
            }
        )
    );

    @Effect()
    getCurrentYearFiresByStageOfControlChartInfo: Observable<Action> = this.actions.pipe(
        ofType(LOAD_CURRENT_YEAR_FIRES_BY_STAGE_OF_CONTROL_CHART_INFO),
        switchMap(
            (action: LoadCurrentYearFiresByStageOfControlChartInfoAction) => {
                // console.log('getCurrentYearFiresBySuspectedCauseStats effect - 1');
                return this.arcGisService.getCurrentYearFiresByStageOfControlStats()
                    .pipe(
                        map((response: any) => {
                            // console.log('getCurrentYearFiresBySuspectedCauseStats effect - 2: ', response);
                            const fireChartInfo: VmFireChartInfo
                                = convertToChartInfo(action.payload.value, response);
                            // console.log('fireChartInfo: ', fireChartInfo);
                            return loadCurrentYearFiresByStageOfControlChartInfoSuccess(fireChartInfo);
                        }),
                        catchError(error => of(loadCurrentYearFiresByStageOfControlChartInfoError(convertToErrorState(error))))
                    );
            }
        )
    );
    
}

