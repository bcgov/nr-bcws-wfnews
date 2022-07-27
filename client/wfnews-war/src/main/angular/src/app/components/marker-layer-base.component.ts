import { Location } from "@angular/common";
import { ChangeDetectorRef, Directive, Injectable } from "@angular/core";
import { MatDialog } from "@angular/material/dialog";
import { MatIconRegistry } from "@angular/material/icon";
import { DomSanitizer } from "@angular/platform-browser";
import { Router } from "@angular/router";
import { Store } from "@ngrx/store";
import { AppConfigService, WindowMessagingService } from "@wf1/core-ui";
import {
    ProvisionalZoneResource, ProvisionalZoneService,
    PublicReportOfFireResource, PublicReportOfFireService,
    SimpleReportOfFireResource,
    SimpleWildfireIncidentResource
} from "@wf1/incidents-rest-api";
import { of, Subject } from "rxjs";

import { ApplicationStateService } from "../services/application-state.service";
import { MapConfigService } from "../services/map-config.service";
import { MapStatePersistenceService } from "../services/map-state-persistence.service";
import { UpdateService } from "../services/update.service";
import { WfnewsMapService } from "../services/wfnews-map.service";
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
        protected messagingService: WindowMessagingService,
        protected updateService: UpdateService,
        protected changeDetectorRef: ChangeDetectorRef,
        protected applicationStateService: ApplicationStateService,
        protected rofService: PublicReportOfFireService,
        protected nrofService: ProvisionalZoneService,
        protected mapConfigService: MapConfigService,
        protected wfnewsMapService: WfnewsMapService,
        protected mapStatePersistenceService: MapStatePersistenceService,
        protected matIconRegistry: MatIconRegistry,
        protected domSanitizer: DomSanitizer
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
        return this.wfnewsMapService.isIncidentsVisible()
    }

    rofLayerVisible(): boolean {
        return this.wfnewsMapService.isRofsVisible()
    }

    nrofLayerVisible(): boolean {
        return this.wfnewsMapService.isNrofsVisible()
    }

    onClose() {
        this.router.navigate( [ '/' ] )
    }
}
