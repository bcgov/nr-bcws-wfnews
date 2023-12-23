import { Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { Store } from '@ngrx/store';
import { TokenService } from '@wf1/core-ui';
import { DefaultService as IncidentService } from '@wf1/incidents-rest-api';
import { of } from 'rxjs';
import {
  withLatestFrom,
  debounceTime,
  switchMap,
  catchError,
  map,
} from 'rxjs/operators';
import { RootState } from '..';
import {
  GET_INCIDENT,
  GetIncidentAction,
  getIncidentSuccess,
  getIncidentError,
  getIncidentCauseError,
  getIncidentCauseSuccess,
  GetIncidentCauseAction,
  GET_INCIDENT_CAUSE,
} from './incident.action';

@Injectable()
export class IncidentEffect {
  getIncident$ = createEffect(() =>
    this.actions.pipe(
      ofType(GET_INCIDENT),
      withLatestFrom(this.store),
      debounceTime(500),
      switchMap(([action, store]) => {
        const typedAction = action as GetIncidentAction;
        return this.incidentService
          .getWildfireIncident1(
            typedAction.payload.fireYear,
            typedAction.payload.incidentSequenceNumber,
            1,
            'response',
          )
          .pipe(
            map((response: any) => getIncidentSuccess(response.body)),
            catchError((error) => of(getIncidentError(error))),
          );
      }),
    ),
  );

  getIncidentCause$ = createEffect(() =>
    this.actions.pipe(
      ofType(GET_INCIDENT_CAUSE),
      withLatestFrom(this.store),
      debounceTime(500),
      switchMap(([action, store]) => {
        const typedAction = action as GetIncidentCauseAction;
        return this.incidentService
          .getIncidentCause(
            typedAction.payload.fireYear,
            typedAction.payload.incidentSequenceNumber,
            1,
            'response',
          )
          .pipe(
            map((response: any) => getIncidentCauseSuccess(response.body)),
            catchError((error) => of(getIncidentCauseError(error))),
          );
      }),
    ),
  );

  constructor(
    private actions: Actions,
    private incidentService: IncidentService,
    private store: Store<RootState>,
    private tokenService: TokenService,
  ) {}
}
