import { Location } from "@angular/common";
import { ChangeDetectorRef, Directive, Injectable } from "@angular/core";
import { MatDialog } from "@angular/material/dialog";
import { Router } from "@angular/router";
import { Store } from "@ngrx/store";
import { AppConfigService, IncidentType, ReportOfFireType, TokenService, WindowMessagingService } from "@wf1/core-ui";
import {
    ProvisionalZoneResource, ProvisionalZoneService,
    PublicReportOfFireResource, PublicReportOfFireService,
    SimpleReportOfFireResource,
    SimpleWildfireIncidentResource
} from "@wf1/incidents-rest-api";
import * as moment from "moment";
import { of, Subject } from "rxjs";
import { catchError, map } from "rxjs/operators";

import { ApplicationStateService } from "../services/application-state.service";
import { MapConfigService } from "../services/map-config.service";
import { MapStatePersistenceService } from "../services/map-state-persistence.service";
import { PollingMonitorService } from "../services/polling-monitor.service";
import { UpdateService } from "../services/update.service";
import { WfimMapService } from "../services/wfnews-map.service";
import { RootState } from "../store";

@Directive()
@Injectable()
export class MarkerLayerBaseComponent {
    mapPersistedState = null;

    incidents: SimpleWildfireIncidentResource[] = [];
    formattedIncidents = [];
    resultsNumIncidents = 0;

    rofs: PublicReportOfFireResource[] = [];
    simpleRofs: SimpleReportOfFireResource[] = [];
    formattedRofs = [];

    nrofs: ProvisionalZoneResource[] = [];
    simpleNrofs: ProvisionalZoneResource[] = [];
    formattedNrofs = [];

    prevIncidentLayerState: any;
    incidentLayerState: any;
    prevRofLayerState: any;
    rofLayerState: any;
    prevNrofLayerState: any;
    nrofLayerState: any;

    retrievingIncidentMarkers: boolean = false;
    retrievingRofMarkers: boolean = false;
    retrievingNrofMarkers: boolean = false;

    public incidentsRetrieved$ = new Subject<boolean>();

    constructor(
        protected dialog: MatDialog,
        protected store: Store<RootState>,
        protected appConfigService: AppConfigService,
        protected router: Router,
        protected location: Location,
        protected tokenService: TokenService,
        protected messagingService: WindowMessagingService,
        protected pollService: PollingMonitorService,
        protected updateService: UpdateService,
        protected changeDetectorRef: ChangeDetectorRef,
        protected applicationStateService: ApplicationStateService,
        protected rofService: PublicReportOfFireService,
        protected nrofService: ProvisionalZoneService,
        protected mapConfigService: MapConfigService,
        protected wfimMapService: WfimMapService,
        protected mapStatePersistenceService: MapStatePersistenceService
    ) {
        this.construct()
    }

    construct() {}

    ngOnInit() {}

    isHomeRoute(): boolean {
        const result = this.router.url === '/';
        return result;
    }


    detectChanges() {
        setTimeout(() => {
            this.changeDetectorRef.detectChanges();
        }, 1000);
    }


 
  
    // updateMarkerLayerStates() {
    //     this.incidentLayerState = this.mapPersistedState.layers.find(item => item.id === 'incident');
    //     this.rofLayerState = this.mapPersistedState.layers.find(item => item.id === 'rof');
    //     this.nrofLayerState = this.mapPersistedState.layers.find(item => item.id === 'nrof');
    //     this.detectChanges();
    // }

    incidentLayerVisible(): boolean {
        return this.wfimMapService.isIncidentsVisible()
    }

    rofLayerVisible(): boolean {
        return this.wfimMapService.isRofsVisible()
    }

    nrofLayerVisible(): boolean {
        return this.wfimMapService.isNrofsVisible()
    }

    onClose() {
        this.router.navigate( [ '/' ] )
    }
}
