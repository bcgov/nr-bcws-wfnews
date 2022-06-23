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
import { IncidentRoutes } from "../modules/incident-management/incident-route-definitions";
import { NROFRoutes } from "../modules/nrof/nrof-route-definitions";
import { ROFRoutes } from "../modules/rof/rof-route-definitions";
import { ApplicationStateService } from "../services/application-state.service";
import { MapConfigService } from "../services/map-config.service";
import { MapStatePersistenceService } from "../services/map-state-persistence.service";
import { PollingMonitorService } from "../services/polling-monitor.service";
import { UpdateService } from "../services/update.service";
import { WfimMapService } from "../services/wfim-map.service";
import { RootState } from "../store";
import * as IncidentActions from "../store/im/im.actions";
import { INCIDENT_MAP_COMPONENT_ID } from "../store/im/im.state";
import * as NrofActions from "../store/nrof/nrof.actions";
import { NROF_MAP_COMPONENT_ID } from "../store/nrof/nrof.state";
import * as RofActions from "../store/rof/rof.actions";
import { ROF_MAP_COMPONENT_ID } from "../store/rof/rof.state";
import {
    convertIncidentToColourCode, durationToExpire, getCodeLabel, getIncidentIcon,
    isIncidentTypeWithStageOfControl, isIncidentTypeWithStatus
} from "../utils";

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

    isIncidentListRoute(): boolean {
        const result = this.router.url === '/' + IncidentRoutes.LIST;
        return result;
    }

    isNonIncidentListRoute(): boolean {
        const result = this.router.url !== '/' + IncidentRoutes.LIST;
        return result;
    }

    isRofListRoute(): boolean {
        const result = this.router.url === '/' + ROFRoutes.LIST;
        return result;
    }

    isNonRofListRoute(): boolean {
        const result = this.router.url !== '/' + ROFRoutes.LIST;
        return result;
    }

    isNrofListRoute(): boolean {
        const result = this.router.url === '/' + NROFRoutes.LIST;
        return result;
    }

    isNonNrofListRoute(): boolean {
        const result = this.router.url !== '/' + NROFRoutes.LIST;
        return result;
    }

    updateIncidents(incidents: SimpleWildfireIncidentResource[]) {
        this.incidents = incidents ? incidents : [];
        this.resultsNumIncidents = this.incidents.length;
        this.formattedIncidents = this.incidents.map(incident => this.formatIncident(incident));
        this.detectChanges();
    }

    getProvisionalZones() {
        this.store.dispatch(new NrofActions.NROFSearchAction(NROF_MAP_COMPONENT_ID));
    }

    loadProvisionalZones() {
        setTimeout(() => {
            this.getProvisionalZones();
            this.detectChanges();
        }, 1000);
    }

    getIncidents() {
        this.store.dispatch(new IncidentActions.IncidentSimpleSearchAction(INCIDENT_MAP_COMPONENT_ID));
    }

    loadIncidents() {
        setTimeout(() => {
            this.getIncidents();
            this.detectChanges();
        }, 1000);
    }

    loadIncidentMarkers() {
        if ( this.retrievingIncidentMarkers ) return

        this.retrievingIncidentMarkers = true;
        return this.wfimMapService.loadSimpleIncidents( this.incidents, this.markerClickIncidentCallback.bind(this) )
            .finally( () => {
                this.retrievingIncidentMarkers = false;
                this.detectChanges();
            } )
    }

    getFireReports() {
        this.store.dispatch(new RofActions.ROFSearchAction(ROF_MAP_COMPONENT_ID));
    }

    loadFireReports() {
        setTimeout(() => {
            this.getFireReports();
            this.detectChanges();
        }, 1000);
    }

    updateFireReports(rofs: PublicReportOfFireResource[]) {
        this.rofs = rofs ? rofs : [];
        this.formattedRofs = this.rofs.map(rof => this.formatROF(rof));
        this.detectChanges();
    }

    updateProvisionalZones(nrofs: ProvisionalZoneResource[]) {
        this.nrofs = nrofs ? nrofs : [];
        this.formattedNrofs = this.nrofs.map(nrof => this.formatNROF(nrof));
        this.detectChanges();
    }

    loadRofMarkers() {
        if ( this.retrievingRofMarkers ) return

        this.retrievingRofMarkers = true;
        return this.wfimMapService.loadRofs(
            this.rofs.filter( (rof) => rof.latitude && rof.longitude ),
            this.markerClickROFCallback.bind(this)
        )
            .finally( () => {
                this.retrievingRofMarkers = false;
                this.detectChanges();
            } )
    }

    loadNRofMarkers() {
        if ( this.retrievingNrofMarkers ) return

        this.retrievingNrofMarkers = true;
        return this.wfimMapService.loadNrofs(
            this.nrofs.filter( (nrof) => nrof.provisionalZonePolygonSpecifiedInd ),
            this.markerClickNROFCallback.bind(this)
        )
            .finally( () => {
                this.retrievingNrofMarkers = false;
                this.detectChanges();
            } )
    }

    getBatchReportOfFire(sRofs: SimpleReportOfFireResource[]) {
        const promises = [];
        if (sRofs && sRofs.length > 0) {
            sRofs.forEach((srof) => {
                promises.push(this.getFireReport(srof.wildfireYear, srof.reportOfFireNumber));
            });
        }
        return promises;
    }

    getFireReport(wildfireYear, reportOfFireNumber) {
        return this.rofService.getPublicReportOfFire(wildfireYear, reportOfFireNumber)
            .pipe(
                map(res => res),
                catchError(err => of(null))
            );
    }

    getBatchNoReportOfFire(sNrofs: ProvisionalZoneResource[]) {
        const promises = [];
        if (sNrofs && sNrofs.length > 0) {
            sNrofs.forEach((sNrof) => {
                promises.push(this.getProvisionalZone(sNrof.provisionalZoneGuid));
            });
        }
        return promises;
    }

    getProvisionalZone(provisionalZoneGuid) {
        return this.nrofService.getProvisionalZone(provisionalZoneGuid)
            .pipe(
                map(res => res),
                catchError(err => of(null))
            );
    }

    detectChanges() {
        setTimeout(() => {
            this.changeDetectorRef.detectChanges();
        }, 1000);
    }

    formatIncident(incident: SimpleWildfireIncidentResource) {
        let iconColourCode;
        if (incident) {

            iconColourCode = convertIncidentToColourCode(incident);

        } else {
            iconColourCode = IncidentType.NOT_SET;
        }
        let formattedIncident = {
            icon: getIncidentIcon(incident.incidentTypeCode),
            iconColourCode,
            /*icon: {
              name: 'incident',
              type: incident.incidentTypeCode
            },*/
            time: moment(incident.discoveryTimestamp),
            title: incident.wildfireYear + " - " + incident.incidentLabel,
            wildfireYear: incident.wildfireYear,
            incidentNumberSequence: incident.incidentNumberSequence,
            info: [],
            location: [incident.longitude, incident.latitude]
        };

        formattedIncident.info.push({ label: 'Zone', value: incident.zoneOrgUnitName });

        if (isIncidentTypeWithStageOfControl(incident.incidentTypeCode)) {
            formattedIncident.info.push({ label: 'SOC', value: getCodeLabel('STAGE_OF_CONTROL_CODE', incident.stageOfControlCode) });
        } else if (isIncidentTypeWithStatus(incident.incidentTypeCode)) {
            formattedIncident.info.push({ label: 'Status', value: getCodeLabel('INCIDENT_STATUS_CODE', incident.incidentStatusCode) });
        } else { }

        formattedIncident.info.push({ label: 'IC', value: incident.incidentCommanderName });
        formattedIncident.info.push({ label: 'Location', value: (incident.geographicDescription) ? incident.geographicDescription : '' });
        formattedIncident.info.push({ label: 'Size', value: incident.fireSizeHectares });

        return formattedIncident;
    }

    getLabel(table: string, value: string): string {
        return getCodeLabel(table, value);
    }

    formatROF(rof: PublicReportOfFireResource) {
        let iconColourCode;
        const iconIsBlinking = (rof.messageStatusCode === 'Submitted' || rof.messageStatusCode === 'Received');
        const iconIsCancelled = (rof.messageStatusCode === 'Cancelled');
        const iconIsAssignedToIncident = (rof.messageStatusCode === 'Assigned To Incident');

        if (rof.messageStatusCode === 'Draft' || rof.messageStatusCode === 'Received') {
            iconColourCode = 'wf1-rof-icon-draft';
        } else {
            switch (this.getLabel('PUBLIC_REPORT_TYPE_CODE', rof.publicReportTypeCode)) {
                case 'General':
                    iconColourCode = ReportOfFireType.GENERAL;
                    break;
                case 'Campfire':
                    iconColourCode = ReportOfFireType.CAMPFIRE;
                    break;
                case 'Cigarette':
                    iconColourCode = ReportOfFireType.CIGARETTE;
                    break;
                case 'Interface':
                    iconColourCode = ReportOfFireType.INTERFACE;
                    break;
                default:
                    iconColourCode = ReportOfFireType.DEFAULT;
            }
        }

        let title = `${rof.reportOfFireLabel}`;

        return {
            icon: 'report-of-fire',
            iconColourCode,
            iconIsBlinking,
            iconIsCancelled,
            iconIsAssignedToIncident,
            /*icon: {
              name: 'report-of-fire',
              type: rof.reportOfFireTypeCode
            },*/
            time: rof.submittedTimestamp ? moment(rof.submittedTimestamp) : (rof.messageReceivedTimestamp ? moment(rof.messageReceivedTimestamp) : null),
            title: title,
            wildfireYear: rof.wildfireYear,
            reportOfFireNumber: rof.reportOfFireNumber,
            reportOfFireLabel: rof.reportOfFireLabel,
            info: [
                { label: 'Caller', value: rof.callerName },
                { label: 'Centre', value: rof.fireCentreOrgUnitName },
                { label: 'Entered', value: rof.receivedByUserId },
                { label: 'Type', value: this.getLabel('PUBLIC_REPORT_TYPE_CODE', rof.publicReportTypeCode) },
                { label: 'Status', value: rof.messageStatusCode },
            ],
            location: (rof && rof.fireLocationPoint && rof.fireLocationPoint.coordinates) ? rof.fireLocationPoint.coordinates : null,
            hasAttachments: rof.publicAttachmentCount > 0
        };
    }

    formatNROF(nrof: ProvisionalZoneResource) {
        let iconColourCode;
        const iconIsBlinking = false;//(nrof.messageStatusCode === 'Submitted');
        const iconIsCancelled = false;//(nrof.messageStatusCode === 'Cancelled');
        const iconIsAssignedToIncident = false;//(nrof.messageStatusCode === 'Assigned To Incident');
        iconColourCode = 'wf1-nrof-icon-draft';

        let title = "NROF-" + `${nrof.provisionalZoneIdentifier}`;
        let expiry = moment(nrof.expiryTimestamp);
        let now = moment();
        let duration = moment.duration(expiry.diff(now));
        let hours = Math.round(duration.asHours());
        let icon = duration.asHours() > 2 ? 'no-more-report-of-fire-light' : 'no-more-report-of-fire-dark';

        let ret = {
            icon: icon,
            iconColourCode,
            iconIsBlinking,
            iconIsCancelled,
            iconIsAssignedToIncident,

            time: nrof.effectiveTimeStamp ? moment(nrof.effectiveTimeStamp) : null,
            title: title,
            provisionalZoneGuid: nrof.provisionalZoneGuid,

            info: [
                {
                    label: 'Expires',
                    value: durationToExpire(duration),
                    emphasis: duration.asHours() <= 2
                },
                { label: 'Centre', value: nrof.fireCentreOrgUnitName },
                { label: 'Dismissed', value: nrof.dismissedInd ? "Yes" : "No" },
                { label: 'Notes', value: nrof.provisionalZoneNote, fullWidth: true },

            ],
            geometry: (nrof && nrof.provisionalZonePolygonSpecifiedInd && nrof.provisionalZonePolygon) ? nrof.provisionalZonePolygon : null
        };
        return ret;

    }

    markerClickROFCallback(event) {
        if (event && event.target && event.target.feature && event.target.feature.properties) {
            this.viewROFDetails(event.target.feature.properties);
        }
    }

    markerClickNROFCallback(event) {
        if (event && event.target && event.target.feature && event.target.feature.properties) {
            this.viewNROFDetails(event.target.feature.properties);
        }
    }

    markerClickIncidentCallback(event) {
        if (event && event.target && event.target.feature && event.target.feature.properties) {
            this.viewIncidentDetails(event.target.feature.properties);
        }
    }

    viewIncidentDetails(incident: SimpleWildfireIncidentResource) {
        return this.wfimMapService.clearHighlight().then( () => {
            this.router.navigate([IncidentRoutes.DETAIL, incident.wildfireYear, incident.incidentNumberSequence]);
        } )
    }

    viewROFDetails(rof: PublicReportOfFireResource) {
        return this.wfimMapService.clearHighlight().then( () => {
            this.router.navigate([ROFRoutes.DETAIL, rof.wildfireYear, rof.reportOfFireNumber]);
        } )
    }

    viewNROFDetails(nrof: any) {
        return this.wfimMapService.clearHighlight().then( () => {
            if (nrof.provisionalZoneGuid)
                return this.router.navigate([NROFRoutes.DETAIL, nrof.provisionalZoneGuid])

            if ( !this.nrofs || this.nrofs.length == 0 ) return

            let nrof1 = this.nrofs.find( ( n ) => n.provisionalZoneIdentifier == nrof.zoneId && n.provisionalZoneTypeCode == nrof.zoneType )
            if ( nrof1 )
                return this.router.navigate([NROFRoutes.DETAIL, nrof1.provisionalZoneGuid])
        } )
            // if (this.webMapApi) {
        //     this.webMapApi.clearHighlight();
        // }
        // if (nrof.provisionalZoneGuid) {
        //     this.router.navigate([NROFRoutes.DETAIL, nrof.provisionalZoneGuid]);
        // }
        // else {
        //     if (this.nrofs && this.nrofs.length > 0) {
        //         let index = this.nrofs.findIndex((provZone) => provZone.provisionalZoneIdentifier == nrof.zoneId && provZone.provisionalZoneTypeCode == nrof.zoneType);
        //         if (index > -1) {
        //             this.router.navigate([NROFRoutes.DETAIL, this.nrofs[index].provisionalZoneGuid]);
        //         }
        //     }
        // }
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
