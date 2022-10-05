import { Injectable } from '@angular/core';
import { Actions, Effect, ofType } from '@ngrx/effects';
import { Action, Store } from '@ngrx/store';
import { TokenService} from '@wf1/core-ui';
import { IncidentCauseService, WildfireIncidentService } from '@wf1/incidents-rest-api';
import { Observable, of } from 'rxjs';
import { withLatestFrom, debounceTime, switchMap, catchError, map } from 'rxjs/operators';
import { RootState } from '..';
import { GET_INCIDENT, GetIncidentAction, getIncidentSuccess, getIncidentError, getIncidentCauseError, getIncidentCauseSuccess, GetIncidentCauseAction, GET_INCIDENT_CAUSE} from './incident.action';


@Injectable()
export class IncidentEffect {

    constructor(
        private actions: Actions,
        private incidentService: WildfireIncidentService,
        private incidentCauseService: IncidentCauseService,
        private store: Store<RootState>,
        private tokenService: TokenService,
    ) {

    }


    @Effect()
    getIncident: Observable<Action> = this.actions.pipe(
        ofType(GET_INCIDENT),
        withLatestFrom(this.store),
        debounceTime(500),
        switchMap(
            ([action, store]) => {
                const typedAction = <GetIncidentAction>action;
                return this.incidentService.getWildfireIncident(
                    typedAction.payload.fireYear,
                    typedAction.payload.incidentSequenceNumber,
                    1,
                    'response'
                )
                .pipe(
                    map((response: any) => getIncidentSuccess(response.body)),
                    catchError(error => of(getIncidentError(error)))
                );
            }
        )
    );

    @Effect()
    getIncidentCause: Observable<Action> = this.actions.pipe(
        ofType(GET_INCIDENT_CAUSE),
        withLatestFrom(this.store),
        debounceTime(500),
        switchMap(
            ([action, store]) => {
                const typedAction = <GetIncidentCauseAction>action;
                return this.incidentCauseService.getIncidentCause(
                    typedAction.payload.fireYear,
                    typedAction.payload.incidentSequenceNumber,
                    1,
                    'response'
                )
                .pipe(
                    map((response: any) => getIncidentCauseSuccess(response.body)),
                    catchError(error => of(getIncidentCauseError(error)))
                );
            }
        )
    );
}
