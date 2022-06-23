import { HttpClient } from "@angular/common/http";
import { Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { Action, Store } from '@ngrx/store';
import { AppConfigService } from "@wf1/core-ui";
import { PublicReportOfFireResource, SimpleWildfireIncidentResource } from "@wf1/incidents-rest-api";
import * as assert from "assert";
import { from, Observable, of } from 'rxjs';
import { catchError, switchMap, withLatestFrom } from "rxjs/operators";
import * as uuid from 'uuid';
import { WfimMapService } from '../../services/wfim-map.service';
import { RootState } from "../index";
import * as UIActions from '../ui/ui.actions';
import * as MapActions from './map.actions';

const MAX_PREF_SIZE = 4000

@Injectable()
export class MapEffects {

    constructor(
        private actions$: Actions,
        private http: HttpClient,
        private config: AppConfigService,
        private store: Store<RootState>,
        protected wfimMapService: WfimMapService
    ) { }


    setLocation$: Observable<Action> = createEffect(() => this.actions$.pipe(
        ofType(MapActions.SET_MAP_POSITION),
        switchMap((actions) => {
            return from(this.wfimMapService.clearHighlight()
                .then(() => {
                    return this.wfimMapService.zoomToPoint((<MapActions.SetMapLocation>actions).location)
                })
                .then(() => {
                    return this.wfimMapService.putHighlight((<MapActions.SetMapLocation>actions).location)
                })
                .then(() => {
                    return new MapActions.SetMapLocationComplete()
                })
            )
        }),
        catchError(error => of(new UIActions.AddError(uuid.v4(), { type: MapActions.SET_MAP_POSITION, data: error })))
    ));


    setPolygon$: Observable<Action> = createEffect(() => this.actions$.pipe(
        ofType(MapActions.SET_MAP_POLYGON),
        switchMap((actions) => {
            return from(this.wfimMapService.clearHighlight()
                .then(() => {
                    return this.wfimMapService.zoomToGeometry((<MapActions.SetMapPolygon>actions).polygon)
                })
                .then(() => {
                    return new MapActions.SetMapPolygonComplete();
                })
            )
        }),
        catchError(error => of(new UIActions.AddError(uuid.v4(), { type: MapActions.SET_MAP_POLYGON, data: error })))
    ));


    clearSelectPoint$: Observable<Action> = createEffect(() => this.actions$.pipe(
        ofType(MapActions.CLEAR_MAP_SELECT_POINT),
        switchMap((actions) => {
            return from(this.wfimMapService.clearSelectedPoint()
                .then(() => {
                    clearClipboard()
                    return new MapActions.ClearMapSelectPointComplete()
                })
            )
        }),
        catchError(error => of(new UIActions.AddError(uuid.v4(), { type: MapActions.CLEAR_MAP_SELECT_POINT, data: error })))
    ));


    activateSelectPoint$: Observable<Action> = createEffect(() => this.actions$.pipe(
        ofType(MapActions.ACTIVATE_SELECT_POINT),
        switchMap((actions) => {
            return from(this.wfimMapService.activateTool('MarkupTool--point')
                .then(() => {
                    return new MapActions.ActivateSelectComplete()
                })
            )
        }),
        catchError(error => of(new UIActions.AddError(uuid.v4(), { type: MapActions.ACTIVATE_SELECT_POINT, data: error })))
    ));


    clearSelectPolygonPoint$: Observable<Action> = createEffect(() => this.actions$.pipe(
        ofType(MapActions.CLEAR_MAP_SELECT_POLYGON),
        switchMap((actions) => {
            return from(this.wfimMapService.clearSelectedPolygon()
                .then(() => {
                    clearClipboard()
                    return new MapActions.ClearMapSelectPolygonComplete()
                })
            )
        }),
        catchError(error => of(new UIActions.AddError(uuid.v4(), { type: MapActions.CLEAR_MAP_SELECT_POLYGON, data: error })))
    ));


    activateSelectPolygon$: Observable<Action> = createEffect(() => this.actions$.pipe(
        ofType(MapActions.ACTIVATE_SELECT_POLYGON),
        switchMap((actions) => {
            return from(this.wfimMapService.activateTool('MarkupTool--polygon')
                .then(() => {
                    return new MapActions.ActivateSelectPolygonComplete()
                })
            )
        }),
        catchError(error => of(new UIActions.AddError(uuid.v4(), { type: MapActions.ACTIVATE_SELECT_POLYGON, data: error })))
    ));

    loadRoFItem$: Observable<Action> = createEffect(() => this.actions$.pipe(
        ofType(MapActions.LOAD_ROF_ITEM),
        withLatestFrom(this.store),
        switchMap(([action, store]) => {
            let rofs: PublicReportOfFireResource[] = store.rof.rofs;
            let loadRofItemAction = action as MapActions.LoadRoFItem;

            if (rofs && rofs.length > 0) {
                assert(loadRofItemAction.rofItems.length == 1)
                let item = loadRofItemAction.rofItems[0]
                if (rofs.some((r) => r.wildfireYear == item.wildfireYear && r.reportOfFireNumber == item.reportOfFireNumber))
                    return of(new MapActions.LoadRoFItemComplete())
            }

            return from(this.wfimMapService.loadRofs(loadRofItemAction.rofItems, null, true)
                .then(() => {
                    return new MapActions.LoadRoFItemComplete()
                })
            )
        }),
        catchError(error => of(new UIActions.AddError(uuid.v4(), { type: MapActions.LOAD_ROF_ITEM, data: error })))
    ));


    loadIncidentItem$: Observable<Action> = createEffect(() => this.actions$.pipe(
        ofType(MapActions.LOAD_INCIDENT_ITEM),
        withLatestFrom(this.store),
        switchMap(([action, store]) => {
            let simpleIncidents: SimpleWildfireIncidentResource[] = store.incidentManagementMap.simpleIncidents;
            let loadIncidentItemAction = action as MapActions.LoadIncidentItem

            if (simpleIncidents && simpleIncidents.length > 0) {
                assert(loadIncidentItemAction.incidentItems.length == 1)
                let item = loadIncidentItemAction.incidentItems[0]
                if (simpleIncidents.some((i) => i.wildfireYear == item.wildfireYear && i.incidentNumberSequence == item.incidentNumberSequence))
                    return of(new MapActions.LoadIncidentItemComplete())
            }

            return from(this.wfimMapService.loadSimpleIncidents(loadIncidentItemAction.incidentItems, null, true)
                .then(() => {
                    return new MapActions.LoadIncidentItemComplete()
                })
            )
        }),
        catchError(error => {
            console.log('error', error);
            return of(new UIActions.AddError(uuid.v4(), { type: MapActions.LOAD_INCIDENT_ITEM, data: error }))
        })
    ));
}

const clearClipboard = () => {
    let clipboardData = (<any>window).clipboardData;
    if (clipboardData) {
        clipboardData.clearData();
    }
};

function asUserPref(pref) {
    let p = clone(pref)
    p.setName = p.componentId
    delete p.componentId

    return {
        cacheExpiresMillis: null,
        links: [
            {
                rel: "self",
                href: "https://d1api.vividsolutions.com/webade-api/v1/usertypes/GOV/users/A416A1783D964058AF31D381952B2B67/preferences/1E5B77AC1F846336F86754697DED6FFE",
                method: "GET"
            }
        ],
        guid: "1E5B77AC1F846336F86754697DED6FFE",
        flag: "A",
        typeCode: "USR",
        subTypeCode: "bootstrap-config",
        dataTypeCode: "STRING",
        sensitiveData: false,
        selfLink: "https://d1api.vividsolutions.com/webade-api/v1/usertypes/GOV/users/A416A1783D964058AF31D381952B2B67/preferences/1E5B77AC1F846336F86754697DED6FFE",
        quotedETag: null,
        unquotedETag: null,
        ...p
    }
}

function clone(o) { return JSON.parse(JSON.stringify(o)) }
