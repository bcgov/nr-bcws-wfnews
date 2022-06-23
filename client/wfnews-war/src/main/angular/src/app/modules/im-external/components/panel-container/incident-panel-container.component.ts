import { HttpResponse } from '@angular/common/http';
import {
    ChangeDetectorRef,
    Component,
    EventEmitter,
    Input,
    OnChanges,
    OnDestroy,
    OnInit,
    Output,
    SimpleChanges
} from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { select, Store } from '@ngrx/store';
import { ReportDialogComponent } from "@wf1/core-ui";
import {
    ComplianceAndEnforcementInvestigationResource,
    ComplianceAndEnforcementInvestigationService,
    IncidentCauseResource,
    IncidentCauseService,
    IncidentLandAuthorityResource,
    ManagingLandAuthorityService,
    OriginAndCauseInvestigationResource,
    OriginAndCauseInvestigationService,
    ResourceAllocationAssessmentResource,
    ResourceAllocationAssessmentService,
    WildfireIncidentResource,
    WildfireIncidentService,
    WildfirePartyListService
} from '@wf1/incidents-rest-api';
import { Observable, Subscription } from "rxjs";
import { filter } from "rxjs/operators";
import { ComponentId } from '../../../../config/validation-path-mapping';
import { UIReportingService } from "../../../../services/ui-reporting.service";
import { RootState } from '../../../../store';
import * as IncidentActions from '../../../../store/im/im.actions';
import { selectActiveIncidentComments } from "../../../../store/im/im.selectors";
import { IncidentComments } from "../../../../store/im/im.state";
import * as UIActions from "../../../../store/ui/ui.actions";
import {
    selectIncidentComponentValidationState,
    selectIncidentFormValidationState
} from "../../../../store/validation/validation.selectors";
import { ComponentValidationState, FormValidationState } from "../../../../store/validation/validation.state";
import { IncidentTabs } from '../../models/incident-tabs';
import { MessageDialogComponent } from "../message-dialog/message-dialog.component";
import { PhotosResource, photosResource } from './photos-resource';

export interface TabDirtyStatus {
    [IncidentTabs.GENERAL]: boolean
    [IncidentTabs.CAUSE]: boolean
    [IncidentTabs.CE_INVESTIGATION]: boolean
    [IncidentTabs.COSTS]: boolean
    [IncidentTabs.FIRE_CHARACTERISTICS]: boolean
    [IncidentTabs.HISTORY]: boolean
    [IncidentTabs.LAND_AUTHORITY]: boolean
    [IncidentTabs.REPORT_OF_FIRE]: boolean
    [IncidentTabs.REPORT_SIGN_OFF]: boolean
    [IncidentTabs.RSWAP]: boolean
}

@Component({
    selector: 'wfim-incident-panel-container',
    templateUrl: './incident-panel-container.component.html',
    styleUrls: ['./incident-panel-container.component.scss'],
    //changeDetection: ChangeDetectionStrategy.OnPush
})
export class IncidentPanelContainerComponent implements OnInit, OnChanges, OnDestroy {
    public TOOLTIP_DELAY = 500;
    comments$: Observable<IncidentComments> = this.store.pipe(select(selectActiveIncidentComments()));
    detailedIncidentReportName = '/NRSRS/WFIM/Reports/WFIM002_Detailed_Incident_Export';

    TabTypes = IncidentTabs;

    generalValidationState$: Observable<ComponentValidationState>;
    fireCharacteristicsValidationState$: Observable<ComponentValidationState>;
    landAuthorityValidationState$: Observable<ComponentValidationState>;
    causeValidationState$: Observable<ComponentValidationState>;
    ceInvestigationValidationState$: Observable<ComponentValidationState>;
    costsValidationState$: Observable<ComponentValidationState>;
    rswapValidationState$: Observable<ComponentValidationState>;
    historyValidationState$: Observable<ComponentValidationState>;
    signOffValidationState$: Observable<ComponentValidationState>;
    photosValidationState$: Observable<ComponentValidationState>;

    currentTab: IncidentTabs = IncidentTabs.GENERAL;
    tabDirtyStatuses: TabDirtyStatus = {
        [IncidentTabs.GENERAL]: false,
        [IncidentTabs.REPORT_OF_FIRE]: false,
        [IncidentTabs.FIRE_CHARACTERISTICS]: false,
        [IncidentTabs.LAND_AUTHORITY]: false,
        [IncidentTabs.CAUSE]: false,
        [IncidentTabs.CE_INVESTIGATION]: false,
        [IncidentTabs.COSTS]: false,
        [IncidentTabs.RSWAP]: false,
        [IncidentTabs.HISTORY]: false,
        [IncidentTabs.REPORT_SIGN_OFF]: false,
    };
    storeErrorsSub: Subscription;
    validationStateSub: Subscription;
    validationState: FormValidationState;
    @Input() incident: WildfireIncidentResource;
    @Input("etag") private _incidentETag: string;
    @Output() dirty = new EventEmitter<boolean>();

    landAuthority: IncidentLandAuthorityResource;
    private _landAuthorityETag: string;

    cause: IncidentCauseResource;
    private _causeETag: string;

    ocInvestigation: OriginAndCauseInvestigationResource;
    private _ocInvestigationETag: string;

    ceInvestigation: ComplianceAndEnforcementInvestigationResource;
    private _ceInvestigationETag: string;

    rswap: ResourceAllocationAssessmentResource;
    private _rswapETag: string;

    photos: PhotosResource
    private _photosETag: string;

    mostRecentUpdatedIncident;

    constructor(
        private incidentService: WildfireIncidentService,
        private causeService: IncidentCauseService,
        private ceInvestigationService: ComplianceAndEnforcementInvestigationService,
        private landAuthorityService: ManagingLandAuthorityService,
        private ocInvestigationService: OriginAndCauseInvestigationService,
        private partyListService: WildfirePartyListService,
        private rswapService: ResourceAllocationAssessmentService,
        private uiReportingService: UIReportingService,
        private dialog: MatDialog,
        private store: Store<RootState>,
        protected cdr: ChangeDetectorRef
    ) { }

    ngOnDestroy(): void {
        if (this.validationStateSub) {
            this.validationStateSub.unsubscribe();
        }
        if (this.storeErrorsSub) {
            this.storeErrorsSub.unsubscribe();
        }
    }

    ngOnInit() {
        this.loadAll();
    }

    loadAll() {
        this.getIncident();
        this.getLandAuthority();
        this.getOCInvestigation();
        this.getCause();
        this.getCEInvestigation();
        this.getRswap();
        this.listenErrors();
        this.getPhotos()
    }

    showIncidentDetailReportDialog() {
        console.log("report clicked");
        const filteredList = [this.incident];
        const incidentIds = filteredList.map(
            (incident: WildfireIncidentResource) =>
                `${incident['wildfireYear']}-${incident['incidentNumberSequence']}`
        );

        this.dialog.open(ReportDialogComponent, {
            width: '850px',
            maxWidth: '850px',
            data: {
                elementId: 'visualize-container',
                reportPath: this.detailedIncidentReportName,
                reportParams: { 'P_YEAR_NUMBER_SEQUENCE': incidentIds },
                supportedExportFormats: ['pdf']
            }
        });
    }

    ngOnChanges({ incident, validationState, _incidentETag }: SimpleChanges): void {
        if (incident && incident.currentValue) {
            localStorage.removeItem('isLoading'+this.incident.incidentNumberSequence);

            this.generalValidationState$ = this.store.pipe(select(selectIncidentComponentValidationState(`${this.incident.wildfireYear}${this.incident.incidentNumberSequence}`, 'general')));
            this.fireCharacteristicsValidationState$ = this.store.pipe(select(selectIncidentComponentValidationState(`${this.incident.wildfireYear}${this.incident.incidentNumberSequence}`, 'fireCharacteristics')));
            this.landAuthorityValidationState$ = this.store.pipe(select(selectIncidentComponentValidationState(`${this.incident.wildfireYear}${this.incident.incidentNumberSequence}`, 'landAuthority')));
            this.causeValidationState$ = this.store.pipe(select(selectIncidentComponentValidationState(`${this.incident.wildfireYear}${this.incident.incidentNumberSequence}`, 'cause')));
            this.ceInvestigationValidationState$ = this.store.pipe(select(selectIncidentComponentValidationState(`${this.incident.wildfireYear}${this.incident.incidentNumberSequence}`, 'ceInvestigation')));
            this.costsValidationState$ = this.store.pipe(select(selectIncidentComponentValidationState(`${this.incident.wildfireYear}${this.incident.incidentNumberSequence}`, 'costs')));
            this.rswapValidationState$ = this.store.pipe(select(selectIncidentComponentValidationState(`${this.incident.wildfireYear}${this.incident.incidentNumberSequence}`, 'rswap')));
            this.historyValidationState$ = this.store.pipe(select(selectIncidentComponentValidationState(`${this.incident.wildfireYear}${this.incident.incidentNumberSequence}`, 'history')));
            this.signOffValidationState$ = this.store.pipe(select(selectIncidentComponentValidationState(`${this.incident.wildfireYear}${this.incident.incidentNumberSequence}`, 'signoff')));
            this.photosValidationState$ = this.store.pipe(select(selectIncidentComponentValidationState(`${this.incident.wildfireYear}${this.incident.incidentNumberSequence}`, 'photos')));
            this.incident = incident.currentValue;
            this.validationStateSub = this.validationStateSub ? this.validationStateSub : this.store.pipe(select(selectIncidentFormValidationState(`${this.incident.wildfireYear}${this.incident.incidentNumberSequence}`)))
                .subscribe((value) => {
                    this.validationState = value;
                });

        }
        if (_incidentETag && _incidentETag.currentValue) {
            // console.log('ngOnChanges',_incidentETag.currentValue);
            this._incidentETag = _incidentETag.currentValue;
        }
    }

    getValidationErrorCount(componentId: ComponentId) {
        if (this.validationState && this.validationState[componentId]) {
            return Object.keys(this.validationState[componentId]).length;
        }
        return undefined;
    }
    selectTab(tab: IncidentTabs) {
        if (this.tabDirtyStatuses[this.currentTab]) {
            let dialogRef = this.dialog.open(MessageDialogComponent, {
                width: '350px',
                data: {
                    title: 'Are you sure you want to continue?',
                    message: 'The current form has been edited. Changes you\'ve made may not be saved.',
                }
            });
            dialogRef.afterClosed().subscribe(result => {
                if (result) {
                    this.setActiveTab(tab);
                    this.store.dispatch(new UIActions.ClearErrors());
                }
            });
        } else {
            this.setActiveTab(tab);
        }
    }

    private setActiveTab(tab: IncidentTabs) {
        this.currentTab = tab;
        this.dirty.emit(false);
        this.getIncident();
    }

    /**
     * Incidents
     */
    getIncident() {
        //memo
        console.log("GETINCIDENT")
        this.incidentService.getWildfireIncident(
            `${this.incident.wildfireYear}`,
            `${this.incident.incidentNumberSequence}`,
            undefined,
            'response'
        ).subscribe(
            response => this.handleIncidentResponse(response),
            error => {
                localStorage.removeItem('isLoading'+this.incident.incidentNumberSequence);
                this.uiReportingService.handleError(error)
            }
        );
    }

    handleIncidentResponse(response: HttpResponse<IncidentLandAuthorityResource>) {
        this._incidentETag = response.headers.get('ETag');
        // console.log('handleIncidentResponse',this._incidentETag);
        this.incident = response.body;
        this.handleResponse(response);
        this.cdr.detectChanges();
    }


    updateIncident(updatedIncident: WildfireIncidentResource) {
        this.mostRecentUpdatedIncident = updatedIncident;
        // console.log('updateIncident',this._incidentETag);
        this.store.dispatch(new IncidentActions.UpdateIncidentAction(this._incidentETag, updatedIncident));
    }

    updateIncidentETag(updatedETag: string) {
        // console.log('updateIncidentETag',updatedETag)
        if ( updatedETag )
            this._incidentETag = updatedETag
    }

    listenErrors() {
        this.storeErrorsSub = this.storeErrorsSub ? this.storeErrorsSub : this.store.pipe(
            select('incidentManagement', 'error'),
            filter(errors => Boolean(errors.length))
        ).subscribe(errors => this.uiReportingService.handleIncidentErrors(errors, false, {
            overwriteCallback: this.updateIncident.bind(this),
            reloadCallback: this.getIncident.bind(this),
            updateEtag: this.setIncidentETag.bind(this),
            resource: this.mostRecentUpdatedIncident,
            resourceName: "Incident"
        }));
    }
    /**
     * Land Authority
     */

    getLandAuthority() {
        this.landAuthorityService.getManagingLandAuthority(
            `${this.incident.wildfireYear}`,
            `${this.incident.incidentNumberSequence}`,
            undefined,
            'response'
        ).subscribe(
            response => this.handleLandAuthorityResponse(response),
            error => {
                localStorage.removeItem('isLoading'+this.incident.incidentNumberSequence);
                this.uiReportingService.handleError(error)
            }
        );
    }

    updateLandAuthority(updatedLandAuthority: IncidentLandAuthorityResource) {
        this.landAuthorityService.updateManagingLandAuthority(
            `${this.incident.wildfireYear}`, // wildfireYear: string,
            `${this.incident.incidentNumberSequence}`, // incidentNumberSequence: string,
            updatedLandAuthority, // incidentLandAuthority: IncidentLandAuthorityResource,
            undefined, // restVersion?: number,
            this._landAuthorityETag, // ifMatch: string,
            'response', // observe?: 'body', reportProgress?: boolean
        )
            .subscribe(
                response => this.handleLandAuthorityResponse(response),
                error => {
                    localStorage.removeItem('isLoading'+this.incident.incidentNumberSequence);
                        this.uiReportingService.handleError(error, false, {
                        overwriteCallback: this.updateLandAuthority.bind(this),
                        reloadCallback: this.getLandAuthority.bind(this),
                        updateEtag: this.setLandAuthorityETag.bind(this),
                        resource: updatedLandAuthority,
                        resourceName: "Land Authority"
                    })
                }
            );
    }

    handleLandAuthorityResponse(response: HttpResponse<IncidentLandAuthorityResource>) {
        this._landAuthorityETag = response.headers.get('ETag');
        this.landAuthority = response.body;
        this.handleResponse(response);
        this.cdr.detectChanges();
    }

    /**
     * OC Investigation
     */

    getOCInvestigation() {
        this.ocInvestigationService.getOriginAndCauseInvestigation(
            `${this.incident.wildfireYear}`, // wildfireYear: string,
            `${this.incident.incidentNumberSequence}`, // incidentNumberSequence: string,
            undefined, // restVersion?: number,
            'response', // observe?: 'body'
        )
            .subscribe(
                response => this.handleOCInvestigationResponse(response),
                error => {
                    localStorage.removeItem('isLoading'+this.incident.incidentNumberSequence);
                    this.uiReportingService.handleError(error)}
            );
    }

    updateOCInvestigation(updatedOCInvestigation: OriginAndCauseInvestigationResource) {
        this.ocInvestigationService.updateOriginAndCauseInvestigation(
            `${this.incident.wildfireYear}`, // wildfireYear: string,
            `${this.incident.incidentNumberSequence}`, // incidentNumberSequence: string,
            updatedOCInvestigation, // incidentInvestigation: OriginAndCauseInvestigationResource,
            null, // restVersion?: number,
            this._ocInvestigationETag, // ifMatch: string,
            "response", // observe?: 'body'
        )
            .subscribe(
                response => this.handleOCInvestigationResponse(response),
                error => {
                    localStorage.removeItem('isLoading'+this.incident.incidentNumberSequence);
                    this.uiReportingService.handleError(error, false, {
                    overwriteCallback: this.updateOCInvestigation.bind(this),
                    reloadCallback: this.getOCInvestigation.bind(this),
                    updateEtag: this.setOcInvestigationETag.bind(this),
                    resource: updatedOCInvestigation,
                    resourceName: "OC Investigation"
                })
                }
            )
    }

    handleOCInvestigationResponse(response: HttpResponse<OriginAndCauseInvestigationResource>) {
        this._ocInvestigationETag = response.headers.get('ETag');
        this.ocInvestigation = response.body;
        this.ocInvestigation.investigationDeterminationStatusCode = 'Not Tracked';
        this.handleResponse(response);
        this.cdr.detectChanges();
    }

    /**
     * Cause
     */

    refreshCause() {
        this.getCause();
    }

    getCause() {
        this.causeService.getIncidentCause(
            `${this.incident.wildfireYear}`, // wildfireYear: string,
            `${this.incident.incidentNumberSequence}`, // incidentNumberSequence: string,
            undefined, // restVersion?: number,
            'response', // observe?: 'body'
        )
            .subscribe(
                response => this.handleCauseResponse(response),
                error => {
                    localStorage.removeItem('isLoading'+this.incident.incidentNumberSequence);
                    this.uiReportingService.handleError(error)
                }
            );
    }

    handleCauseResponse(response: HttpResponse<IncidentCauseResource>) {
        this._causeETag = response.headers.get('ETag');
        this.cause = response.body;
        this.handleResponse(response);
        this.cdr.detectChanges();
    }

    /**
     * CE Investigation
     */
    getCEInvestigation() {
        this.ceInvestigationService.getComplianceAndEnforcementInvestigation(
            `${this.incident.wildfireYear}`, // wildfireYear: string,
            `${this.incident.incidentNumberSequence}`, // incidentNumberSequence: string,
            null, // restVersion?: number,
            'response', // observe?: 'body'
        )
            .subscribe(
                response => this.handleCEInvestigationResponse(response),
                error => {
                    localStorage.removeItem('isLoading'+this.incident.incidentNumberSequence);
                    this.uiReportingService.handleError(error)
                }
            );
    }

    updateCEInvestigation(updatedCEInvestigation: ComplianceAndEnforcementInvestigationResource) {
        this.ceInvestigationService.updateComplianceAndEnforcementInvestigation(
            `${this.incident.wildfireYear}`, // wildfireYear: string,
            `${this.incident.incidentNumberSequence}`, // incidentNumberSequence: string,
            updatedCEInvestigation, // incidentInvestigation: ComplianceAndEnforcementInvestigationResource,
            null, // restVersion?: number,
            this._ceInvestigationETag, // ifMatch: string,
            'response', // observe?: 'body'
        )
            .subscribe(
                response => this.handleCEInvestigationResponse(response),
                error => {
                    localStorage.removeItem('isLoading'+this.incident.incidentNumberSequence);
                    this.uiReportingService.handleError(error, false, {
                    overwriteCallback: this.updateCEInvestigation.bind(this),
                    reloadCallback: this.getCEInvestigation.bind(this),
                    updateEtag: this.setCeInvestigationETag.bind(this),
                    resource: updatedCEInvestigation,
                    resourceName: "CE Investigation"
                })
                }
            );
    }

    handleCEInvestigationResponse(response: HttpResponse<ComplianceAndEnforcementInvestigationResource>) {
        this._ceInvestigationETag = response.headers.get('ETag');
        this.ceInvestigation = response.body;
        this.ceInvestigation.investigationDeterminationStatusCode
            = this.ceInvestigation.investigationDeterminationStatusCode ? this.ceInvestigation.investigationDeterminationStatusCode : 'Not Tracked';
        this.handleResponse(response);
        this.cdr.detectChanges();
    }

    /**
     * RSWAP
     */

    getRswap() {
        this.rswapService.getResourceAllocationAssessment(
            `${this.incident.wildfireYear}`, // wildfireYear: string,
            `${this.incident.incidentNumberSequence}`, // incidentNumberSequence: string,
            null, // restVersion?: number,
            'response', // observe?: 'body'
        )
            .subscribe(
                response => this.handleRswapResponse(response),
                error => {
                    localStorage.removeItem('isLoading'+this.incident.incidentNumberSequence);
                    this.uiReportingService.handleError(error)}
            );
    }

    updateRswap(updatedRswap: ResourceAllocationAssessmentResource) {
        this.rswapService.updateResourceAllocationAssessment(
            `${this.incident.wildfireYear}`, // wildfireYear: string,
            `${this.incident.incidentNumberSequence}`, // incidentNumberSequence: string,
            updatedRswap, // resourceAllocationAssessment: ResourceAllocationAssessmentResource,
            null, // restVersion?: number,
            this._rswapETag, // ifMatch: string,
            'response', // observe?: 'body'
        )
            .subscribe(
                response => this.handleRswapResponse(response),
                error => {
                    localStorage.removeItem('isLoading'+this.incident.incidentNumberSequence);
                    this.uiReportingService.handleError(error, false, {
                    overwriteCallback: this.updateRswap.bind(this),
                    reloadCallback: this.getRswap.bind(this),
                    updateEtag: this.setRswapETag.bind(this),
                    resource: updatedRswap,
                    resourceName: "RSWAP"
                })
                }
            );
    }

    handleRswapResponse(response: HttpResponse<ResourceAllocationAssessmentResource>) {
        this._rswapETag = response.headers.get('ETag');
        this.rswap = response.body;
        this.handleResponse(response);
        this.cdr.detectChanges();
    }

    /**
     * Photos
     */
    getPhotos() {
        this.photos = photosResource
        this.cdr.detectChanges();
    }

    /**
     * Handlers
     */
    handleResponse<T>(response: HttpResponse<T>) {
        this.uiReportingService.displaySuccessMessage();
    }

    updateFormState(targetTab: IncidentTabs, isDirty: boolean) {
        this.tabDirtyStatuses[targetTab] = isDirty;
        this.dirty.emit(isDirty);
    }


    setIncidentETag(value: string) {
        this._incidentETag = value;
    }

    setLandAuthorityETag(value: string) {
        this._landAuthorityETag = value;
    }

    setCauseETag(value: string) {
        this._causeETag = value;
    }

    setOcInvestigationETag(value: string) {
        this._ocInvestigationETag = value;
    }

    setCeInvestigationETag(value: string) {
        this._ceInvestigationETag = value;
    }

    setRswapETag(value: string) {
        this._rswapETag = value;
    }

    isloading():boolean{
        if (localStorage.getItem('isLoading'+this.incident.incidentNumberSequence) == 'true'){
            return true
        }else{
            return false
        }
    }
}
