import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { Action, Store } from '@ngrx/store';
import { AppConfigService } from "@wf1/core-ui";
import { of, Observable } from "rxjs";
import { catchError, debounceTime, map, switchMap } from 'rxjs/operators';

import { RootState } from '../index';
import {
    PointIdActionTypes,
    PointIdGeographyAction,
    PointIdGeographyErrorAction,
    PointIdGeographySuccessAction,
    PointIdOwnershipAction,
    PointIdOwnershipErrorAction,
    PointIdOwnershipSuccessAction,
    PointIdWeatherAction,
    PointIdWeatherErrorAction,
    PointIdWeatherSuccessAction,
} from "./point-id.actions";
import { GeographyResult, OwnershipResult, WeatherResult } from "./point-id.state";

@Injectable()
export class PointIdEffects {
    constructor(
        private config: AppConfigService,
        private actions$: Actions,
        private store: Store<RootState>,
        private http: HttpClient,
    ) { }


    pointIdGeography$: Observable<Action> = createEffect(() => this.actions$.pipe(
        ofType<PointIdGeographyAction>(PointIdActionTypes.POINT_ID_GEOGRAPHY),
        debounceTime(200),
        switchMap((action: PointIdGeographyAction) => {
            return this.http.get(`${this.config.getConfig().externalAppConfig.pointId.url}/geography?lat=${action.location[1]}&lon=${action.location[0]}`).pipe(
                map((response: GeographyResult) => new PointIdGeographySuccessAction(response)),
            );
            // try {
            //   return new PointIdGeographySuccessAction(geography);
            // } catch (error) {
            //   return new PointIdGeographyErrorAction(error.type, error.toString());
            // }
        }),
        catchError(error => of(new PointIdGeographyErrorAction(error, error.toString())))
    ));


    pointIdOwnership$: Observable<Action> = createEffect(() => this.actions$.pipe(
        ofType<PointIdOwnershipAction>(PointIdActionTypes.POINT_ID_OWNERSHIP),
        debounceTime(200),
        switchMap((action: PointIdOwnershipAction) => {
            return this.http.get(`${this.config.getConfig().externalAppConfig.pointId.url}/ownership?lat=${action.location[1]}&lon=${action.location[0]}`).pipe(
                map((response: OwnershipResult) => new PointIdOwnershipSuccessAction(response)),
            );
        }),
        catchError(error => of(new PointIdOwnershipErrorAction(error, error.toString())))
    ));


    pointIdWeather$: Observable<Action> = createEffect(() => this.actions$.pipe(
        ofType<PointIdWeatherAction>(PointIdActionTypes.POINT_ID_WEATHER),
        debounceTime(200),
        switchMap((action: PointIdWeatherAction) => {
            return this.http.get(`${this.config.getConfig().externalAppConfig.pointId.url}/weather?lat=${action.location[1]}&lon=${action.location[0]}`).pipe(
                map((response: WeatherResult) => new PointIdWeatherSuccessAction(response)),
            );
        }),
        catchError(error => of(new PointIdWeatherErrorAction(error, error.toString())))
    ));
}
