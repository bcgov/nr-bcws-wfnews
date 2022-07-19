import { HttpClient, HttpHeaders } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { Actions, createEffect, ofType } from "@ngrx/effects";
import { Action, Store } from "@ngrx/store";
import { TokenService } from "@wf1/core-ui";
import { Observable, of } from "rxjs";
import { debounceTime, withLatestFrom, switchMap, catchError, map } from "rxjs/operators";
import { RootState } from "..";
import { convertToErrorState } from "../../conversion/conversion-from-rest";
import { GetIncidentsAction, getIncidentsError, getIncidentsSuccess, GET_INCIDENTS } from "./incidents.actions";

@Injectable()
export class IncidentsEffects{
    constructor(
        private http: HttpClient,
        private actions: Actions,
        private store: Store<RootState>,
        private tokenService: TokenService,
    ){   
    }

    // getIncidents: Observable<Action> = createEffect(() => this.actions.pipe(
    //     ofType(GET_INCIDENTS),
    //     withLatestFrom(this.store),
    //     debounceTime(500),
    //     switchMap(
    //         ([action, store]) => {
    //             let url = `localhost:8080/wfnews-api-rest-endpoints-1.0.0-SNAPSHOT/incidents`;
    //             let headers = new HttpHeaders();

    //             let typedAction = <GetIncidentsAction>action;
    //             return this.http.get<any>(url,{headers }).pipe(
    //                 map((response: any) => {
    //                     return getIncidentsSuccess(typedAction.componentId, response);
    //                 }),
    //                 catchError（error => of(getIncidentsError(typedAction.componentId,convertToErrorState(error)))))
    //             );

    //         }
    //     )
    // ));
    getIncidents$: Observable<Action> = createEffect( () => this.actions.pipe(
        ofType(GET_INCIDENTS),
        withLatestFrom(this.store),
        debounceTime(500),
        switchMap(
            ([action,store]) =>{
                let url = `localhost:8080/wfnews-api-rest-endpoints-1.0.0-SNAPSHOT/incidents`;
                let headers = new HttpHeaders();
                let typedAction = <GetIncidentsAction> action;
                console.log("SAWAW@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@")
                return this.http.get<any>(url,{headers}).pipe(
                    map((response:any) => {
                        return getIncidentsSuccess(typedAction.componentId,response);
                    }),
                    catchError(error => of(getIncidentsError(typedAction.componentId,convertToErrorState(error))))
                );
            }
        )
    ));

}