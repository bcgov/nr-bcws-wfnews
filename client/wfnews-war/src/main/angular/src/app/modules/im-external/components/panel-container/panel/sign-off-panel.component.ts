import { HttpResponse } from "@angular/common/http";
import { AfterViewInit, Component, EventEmitter, Input, OnInit, Output, SimpleChanges } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { Store } from "@ngrx/store";
import { SpatialUtilsService } from "@wf1/core-ui";
import {
    ComplianceAndEnforcementInvestigationResource,
    IncidentApprovalResource,
    IncidentApprovalService,
    IncidentCauseResource,
    IncidentLandAuthorityResource,
    IncidentVerificationResource,
    IncidentVerificationService,
    OriginAndCauseInvestigationResource,
    WildfireIncidentResource,
    WildfireIncidentStatusChangeListService
} from '@wf1/incidents-rest-api';
import { convertSignOffVerificationToIMFormValidation } from "../../../../../conversion/conversion-validation-from-rest";
import { UIReportingService } from "../../../../../services/ui-reporting.service";
import { RootState } from "../../../../../store";
import { setIMFormValidationState } from "../../../../../store/validation/validation.actions";
import { APIValidationError, ComponentValidationState } from "../../../../../store/validation/validation.state";
import { getCodeOptions, getOrgCodeOptions } from "../../../../../utils";
import { WFError } from "../../../../core/models/wf-error";
import { Convert } from "./convert";

@Component({
    selector: 'wfim-sign-off-panel',
    templateUrl: './sign-off-panel.component.html',
    styleUrls: ['./base-panel.component.scss']
})

export class SignOffPanelComponent implements AfterViewInit, OnInit {
    public TOOLTIP_DELAY = 500;

    readonly panelName: string = 'Sign Off';
    readonly SIGN_TEXT: string = 'Sign';
    readonly UNSIGN_TEXT: string = 'Unsign';
    readonly APPROVE_TEXT: string = 'Approve';
    readonly UNAPPROVE_TEXT: string = 'Unapprove';

    //defaultErrorMessage: WFError = { message: 'An unknown error occurred' };

    disableSignOff: boolean = true;
    disableApprove: boolean = true;
    signButtonText: string = this.SIGN_TEXT;
    approveButtonText: string = this.APPROVE_TEXT;

    constructor(
        private incidentApprovalService: IncidentApprovalService,
        private incidentVerificationService: IncidentVerificationService,
        private incidentStatusChangeListService: WildfireIncidentStatusChangeListService,
        private uiReportingService: UIReportingService,
        protected store: Store<RootState>,
        protected fb: FormBuilder,
        protected spatialUtils: SpatialUtilsService
    ) { }

    ngOnInit(): void {
        this.initializeForm();
        localStorage.setItem('isLoading'+this.incident.incidentNumberSequence, 'true');
    }

    ngAfterViewInit(): void {
    }

    ngOnChanges({ incident, landAuthority, ocInvestigation, cause, ceInvestigation, validationState }: SimpleChanges) {
        this.evaluateSignOffApprovalState();
        this.populateReadOnlySignOffFields();
        if (incident) {
            if (this.forms.general) {
                this.forms.general.patchValue(Convert.incidentResourceToForm(incident.currentValue as WildfireIncidentResource, this.spatialUtils));
            }
            if (this.forms.fireCharacteristics) {
                this.forms.fireCharacteristics.patchValue(Convert.incidentResourceToForm(incident.currentValue as WildfireIncidentResource, this.spatialUtils));
            }
            if (this.forms.cause) {
                this.forms.cause.patchValue(Convert.incidentResourceToForm(incident.currentValue as WildfireIncidentResource, this.spatialUtils));
            }
            if (this.forms.ceInvestigation) {
                this.forms.ceInvestigation.patchValue(Convert.incidentResourceToForm(incident.currentValue as WildfireIncidentResource, this.spatialUtils));
            }
            if (this.forms.history) {
                this.forms.history.patchValue(Convert.incidentResourceToForm(incident.currentValue as WildfireIncidentResource, this.spatialUtils));
            }
            if (this.forms.signOff) {
                this.forms.signOff.patchValue(Convert.incidentResourceToForm(incident.currentValue as WildfireIncidentResource, this.spatialUtils));
            }
            if(!incident.firstChange){
                localStorage.removeItem('isLoading'+this.incident.incidentNumberSequence);
            }
        }
        if (ocInvestigation && this.forms.cause) {
            this.forms.cause.patchValue(Convert.ocInvestigationResourceToForm(ocInvestigation.currentValue as OriginAndCauseInvestigationResource));
        }
        if (cause && this.forms.cause) {
            this.forms.cause.patchValue(Convert.causeResourceToForm(cause.currentValue as IncidentCauseResource));
        }
        if (ceInvestigation && this.forms.ceInvestigation) {
            this.forms.ceInvestigation.patchValue(Convert.ceInvestigationResourceToForm(ceInvestigation.currentValue as ComplianceAndEnforcementInvestigationResource));
        }
        if (landAuthority && this.forms.landAuthority) {
            this.forms.landAuthority.patchValue(Convert.landAuthorityResourceToForm(landAuthority.currentValue as IncidentLandAuthorityResource));
        }
    }

    initializeForm() {
        this.createForms();
    }

    forms: { [key: string]: FormGroup } = {
        general: null,
        fireCharacteristics: null,
        landAuthority: null,
        // cause: [],
        ceInvestigation: null,
        history: null,
        signOff: null
    };
    @Input() incident: WildfireIncidentResource;
    @Input() landAuthority: IncidentLandAuthorityResource;
    @Input() ocInvestigation: OriginAndCauseInvestigationResource;
    @Input() cause: IncidentCauseResource;
    @Input() ceInvestigation: ComplianceAndEnforcementInvestigationResource;
    @Input() validationState: ComponentValidationState;

    @Output() updateIncident: EventEmitter<WildfireIncidentResource> = new EventEmitter();
    @Output() updateIncidentETag: EventEmitter<string> = new EventEmitter();

    keys = Object.keys;

    createForms() {
        this.forms.general = this.getGeneralForm();
        this.forms.fireCharacteristics = this.getFireCharacteristicsForm();
        this.forms.landAuthority = this.getLandAuthorityForm();
        this.forms.cause = this.getCauseForm();
        this.forms.ceInvestigation = this.getCEInvestigationForm();
        this.forms.history = this.getHistoryForm();
        this.forms.signOff = this.getSignOffForm();

    }


    getGeneralForm(): FormGroup {
        let formGroup = this.fb.group({
            incidentYear: [{ value: this.incident.wildfireYear ? this.incident.wildfireYear : '', disabled: true }],
            incidentLabel: [{ value: this.incident.incidentLabel, disabled: true }],
            incidentTypeCode: [{ value: this.incident.incidentTypeCode, disabled: true }],
            fireCentreOrgUnitIdentifier: [{ value: this.incident.fireCentreOrgUnitIdentifier, disabled: true }],
            zoneOrgUnitIdentifier: [{ value: this.incident.zoneOrgUnitIdentifier, disabled: true }],
            latLong: [{ value: Convert.getFormattedLatLong(this.incident, this.spatialUtils), disabled: true }],
            interfaceFireInd: [{ value: this.incident.incidentSituation.interfaceFireInd, disabled: true }],
            responseTypeCode: [{ value: this.incident.responseTypeCode, disabled: true }],
            geographicDescription: [{ value: this.incident.incidentLocation.geographicDescription ? this.incident.incidentLocation.geographicDescription : '', disabled: true }],
            fireSizeHectares: [{ value: this.incident.incidentSituation.fireSizeHectares ? this.incident.incidentSituation.fireSizeHectares : '', disabled: true }],
            stageOfControlCode: [{ value: this.incident.incidentSituation.stageOfControlCode, disabled: true }],
            incidentCommanderName: [{ value: this.incident.incidentCommanderName ? this.incident.incidentCommanderName : '', disabled: true }],
            containedPercentage: [{ value: this.incident.incidentSituation.containedPercentage ? this.incident.incidentSituation.containedPercentage : '', disabled: true }],
            fireOfNotePublishedInd: [{ value: this.incident.fireOfNotePublishedInd, disabled: true }],
            actualCostOfControl: [{ value: this.incident.incidentSituation.actualCostOfControl ? this.incident.incidentSituation.actualCostOfControl : '', disabled: true }]
        });
        return formGroup;
    }

    getFireCharacteristicsForm() {
        let formGroup = this.fb.group({
            valuesAtRiskDescription: [{ value: this.incident.incidentSituation.valuesAtRiskDescription, disabled: true }],
            slopeRatingCode: [{ value: this.incident.incidentSituation.slopeRatingCode, disabled: true }],
            slopePositionCode: [{ value: this.incident.incidentSituation.slopePositionCode, disabled: true }],
            aspectDirectionCode: [{ value: this.incident.incidentSituation.aspectDirectionCode, disabled: true }],
            siteAccessPointTypeCode: [{ value: this.incident.incidentSituation.siteAccessPointTypeCode, disabled: true }],
            stationCode: [{ value: this.incident.preferredWeatherStation.stationCode !== undefined ? `${this.incident.preferredWeatherStation.stationCode}` : null, disabled: true }]

        });
        return formGroup;
    }
    getLandAuthorityForm() {
        let formGroup = this.fb.group({
            landOwnershipClassCode: [{ value: this.landAuthority.landOwnershipClassCode, disabled: true }],
            costSharingAgreementInd: [{ value: this.landAuthority.costSharingAgreementInd, disabled: true }]
        });
        return formGroup;
    }

    getCauseForm() {
        let formGroup = this.fb.group({
            investigationRequesterCode: [{ value: this.ocInvestigation.investigationRequesterCode, disabled: true }],
            agencyRespondedInd: [{ value: this.ocInvestigation.agencyRespondedInd, disabled: true }],
            generalIncidentCauseCategoryCode: [{ value: this.cause.generalIncidentCauseCategoryCode, disabled: true }],
            incidentCauseReasonCategoryCode: [{ value: this.cause.incidentCauseReasonCategoryCode, disabled: true }],
            incidentCauseReasonKindCode: [{ value: this.cause.incidentCauseReasonKindCode, disabled: true }],
            forestActivityCategoryCode: [{ value: this.cause.forestActivityCategoryCode, disabled: true }],
            forestActivityKindCode: [{ value: this.cause.forestActivityKindCode, disabled: true }],
            incidentCauseActivityCategoryCode: [{ value: this.cause.incidentCauseActivityCategoryCode, disabled: true }],
            incidentCauseActivityKindCode: [{ value: this.cause.incidentCauseActivityKindCode, disabled: true }],
            incidentCauseActivitySubkindCode: [{ value: this.cause.incidentCauseActivitySubkindCode, disabled: true }],
            causeCertaintyCode: [{ value: this.cause.causeCertaintyCode, disabled: true }],
            incidentCauseComment: [{ value: this.cause.incidentCauseComment, disabled: true }]

        });
        return formGroup;
    }

    getCEInvestigationForm() {
        let formGroup = this.fb.group({
            investigationRequesterCode: [{ value: this.ceInvestigation.investigationRequesterCode, disabled: true }],
            agencyRespondedInd: [{ value: this.ceInvestigation.agencyRespondedInd, disabled: true }]
        });
        return formGroup;
    }

    getHistoryForm() {
        let formGroup = this.fb.group({
            incidentTimestamp: [{ value: this.incident.incidentTimestamp ? new Date(this.incident.incidentTimestamp) : null, disabled: true }],
            reportedTimestamp: [{ value: this.incident.reportedTimestamp ? new Date(this.incident.reportedTimestamp) : null, disabled: true }],
            detectionSourceCode: [{ value: this.incident.detectionSourceCode, disabled: true }],
            discoverySizeHectares: [{ value: this.incident.discoverySizeHectares, disabled: true }],
            discoveryTimestamp: [{ value: this.incident.discoveryTimestamp ? new Date(this.incident.discoveryTimestamp) : null, disabled: true }],
            firstActionedByPartyName: [{ value: this.incident.firstActionedByParty ? this.incident.firstActionedByParty.partyName : null, disabled: true }],
            leadByPartyName: [{ value: this.incident.leadByParty ? this.incident.leadByParty.partyName : null, disabled: true }]
        });
        return formGroup;
    }

    getSignOffForm() {
        let formGroup = this.fb.group({
            signOffSignatureName: [{ value: this.incident.signOffSignatureName, disabled: true }],
            signOffSignatureDateDisplay: [{ value: this.incident.signOffSignatureDate ? Convert.formatDateToDisplayString(new Date(this.incident.signOffSignatureDate)) : undefined, disabled: true }],
            approvalSignatureName: [{ value: this.incident.approvalSignatureName, disabled: true }],
            approvalSignatureDateDisplay: [{ value: this.incident.approvalSignatureDate ? Convert.formatDateToDisplayString(new Date(this.incident.approvalSignatureDate)) : undefined, disabled: true }]
        });
        return formGroup;
    }

    getCodeOptions(codeType: string) {
        return getCodeOptions(codeType);
    }

    getOrgCodeOptions(codeType: string) {
        return getOrgCodeOptions(codeType);
    }

    checkIncidentApproval() {
        localStorage.setItem('isLoading'+this.incident.incidentNumberSequence, 'true');
        if (this.incident && !this.incident.approvalSignatureDate) {
            this.incidentApprovalService.getIncidentApproval(
                `${this.incident.wildfireYear}`, //wildfireYear: string,
                `${this.incident.incidentNumberSequence}`, // incidentNumberSequence: string,
            )
                .subscribe(
                    response => this.handleCheckApprovalResponse(response),
                    error => {
                        localStorage.removeItem('isLoading'+this.incident.incidentNumberSequence);
                        this.uiReportingService.handleError(error)
                    }
                )
        } else {
            this.unapproveIncident();
        }
    }

    validateIncident() {
        localStorage.setItem('isLoading'+this.incident.incidentNumberSequence, 'true');
        if (this.incident && !this.incident.signOffSignatureDate) {
            //this.store.dispatch(clearIMFormValidationState(`${this.incident.wildfireYear}${this.incident.incidentNumberSequence}`));
            this.incidentVerificationService.getIncidentVerification(
                `${this.incident.wildfireYear}`, //wildfireYear: string,
                `${this.incident.incidentNumberSequence}`, // incidentNumberSequence: string,
            )
                .subscribe(
                    response => this.handleVerificationResponse(response),
                    error => {
                        localStorage.removeItem('isLoading'+this.incident.incidentNumberSequence);
                        this.uiReportingService.handleError(error)
                    }
                )
        } else {
            this.unsignIncident();
        }
    }

    handleVerificationResponse(response: IncidentVerificationResource) {
        if (response.errorMessages && response.errorMessages.length) {
            localStorage.removeItem('isLoading'+this.incident.incidentNumberSequence);
            let imFormState = convertSignOffVerificationToIMFormValidation(response.errorMessages as APIValidationError[]);
            this.store.dispatch(setIMFormValidationState(`${this.incident.wildfireYear}${this.incident.incidentNumberSequence}`, imFormState));

            let uncategorizedErrors: WFError[] = Object.values(imFormState.uncategorized).reduce(function (acc, v) {
                return acc.concat(v.map(function (w) { return w as WFError }))
            }, [] as Array<WFError>)

            if (uncategorizedErrors.length > 0) {
                this.uiReportingService.handleIncidentErrors(uncategorizedErrors, true);
            }
            else {
                this.uiReportingService.displayErrorMessage('Incident incomplete for sign off, please correct errors');
            }
        }
        else {
            this.signIncident();
        }
    }

    handleSignOffResponse(response: HttpResponse<IncidentApprovalResource>) {
        if (response && response.body) {
            let body = response.body;
            if (body.errorMessages && body.errorMessages.length) {
                localStorage.removeItem('isLoading'+this.incident.incidentNumberSequence);
                this.uiReportingService.handleIncidentErrors(body.errorMessages as WFError[]);
            } else {
                this.incident = response.body;
                this.populateReadOnlySignOffFields();
                this.evaluateSignOffApprovalState();
                this.updateIncidentETag.emit(response.headers.get("ETag"));
                this.updateIncident.emit(response.body);
            }
        }
    }

    unsignIncident() {
        this.incidentVerificationService.unsignIncidentVerification(
            `${this.incident.wildfireYear}`,
            `${this.incident.incidentNumberSequence}`,
            null,
            "response"
        ).subscribe(
            response => this.handleSignOffResponse(response),
            error => {
                localStorage.removeItem('isLoading'+this.incident.incidentNumberSequence);
                this.uiReportingService.handleError(error)
            }
        )
    }

    signIncident() {
        this.incidentVerificationService.signoffIncidentVerification(
            `${this.incident.wildfireYear}`,
            `${this.incident.incidentNumberSequence}`,
            null,
            "response"
        ).subscribe(
            response => this.handleSignOffResponse(response),
            error => {
                localStorage.removeItem('isLoading'+this.incident.incidentNumberSequence);
                this.uiReportingService.handleError(error)
            }
        )
    }

    unapproveIncident() {
        this.incidentApprovalService.unsignIncidentApproval(
            `${this.incident.wildfireYear}`,
            `${this.incident.incidentNumberSequence}`,
            null,
            "response"
        ).subscribe(
            response => this.handleApprovalResponse(response),
            error => {
                localStorage.removeItem('isLoading'+this.incident.incidentNumberSequence);
                this.uiReportingService.handleError(error)
            }
        )
    }

    approveIncident() {
        this.incidentApprovalService.signoffIncidentApproval(
            `${this.incident.wildfireYear}`,
            `${this.incident.incidentNumberSequence}`,
            null,
            "response"
        ).subscribe(
            response => this.handleApprovalResponse(response),
            error => {
                localStorage.removeItem('isLoading'+this.incident.incidentNumberSequence);
                this.uiReportingService.handleError(error)
            }
        )
    }

    handleApprovalResponse(response: HttpResponse<IncidentApprovalResource>) {
        if (response && response.body) {
            let body = response.body;
            if (body.errorMessages && body.errorMessages.length) {
                localStorage.removeItem('isLoading'+this.incident.incidentNumberSequence);
                this.uiReportingService.handleIncidentErrors(body.errorMessages as WFError[]);
            } else {
                this.incident = response.body;
                this.populateReadOnlySignOffFields();
                this.evaluateSignOffApprovalState();
                this.updateIncidentETag.emit(response.headers.get("ETag"));
                this.updateIncident.emit(response.body);
            }
        }
    }

    handleCheckApprovalResponse(response: IncidentApprovalResource) {
        if (response.errorMessages && response.errorMessages.length) {
            localStorage.removeItem('isLoading'+this.incident.incidentNumberSequence);
            this.uiReportingService.handleIncidentErrors(response.errorMessages as WFError[]);
        }
        else {
            this.approveIncident();
        }
    }

    evaluateSignOffApprovalState() {
        if (this.incident) {
            if (!this.incident.signOffSignatureDate && !this.incident.approvalSignatureDate) {
                this.disableSignOff = false;
                this.signButtonText = this.SIGN_TEXT;
                this.disableApprove = true;
                this.approveButtonText = this.APPROVE_TEXT;
            } else if (this.incident.signOffSignatureDate && !this.incident.approvalSignatureDate) {
                this.disableSignOff = false;
                this.signButtonText = this.UNSIGN_TEXT;
                this.disableApprove = false;
                this.approveButtonText = this.APPROVE_TEXT;
            } else if (this.incident.signOffSignatureDate && this.incident.approvalSignatureDate) {
                this.disableSignOff = true;
                this.signButtonText = this.UNSIGN_TEXT;
                this.disableApprove = false;
                this.approveButtonText = this.UNAPPROVE_TEXT;
            } else if (!this.incident.signOffSignatureDate && this.incident.approvalSignatureDate) {
                this.disableSignOff = true;
                this.signButtonText = this.SIGN_TEXT;
            } else {
                this.disableSignOff = true;
                this.signButtonText = this.SIGN_TEXT;
                this.disableApprove = true;
                this.approveButtonText = this.APPROVE_TEXT;
            }
        } else {
            this.disableSignOff = true;
            this.signButtonText = 'Sign';
            this.disableApprove = true;
            this.approveButtonText = 'Approve';
        }
    }

    populateReadOnlySignOffFields() {
        if (this.forms.signOff) {
            this.forms.signOff.get('signOffSignatureName').setValue(this.incident.signOffSignatureName);
            this.forms.signOff.get('approvalSignatureName').setValue(this.incident.approvalSignatureName);

            if (this.incident.signOffSignatureDate) {
                this.forms.signOff.get('signOffSignatureDateDisplay')
                    .setValue(Convert.formatDateToDisplayString(new Date(this.incident.signOffSignatureDate)));
            } else {
                this.forms.signOff.get('signOffSignatureDateDisplay').setValue(undefined);
            }
            if (this.incident.approvalSignatureDate) {
                this.forms.signOff.get('approvalSignatureDateDisplay')
                    .setValue(Convert.formatDateToDisplayString(new Date(this.incident.approvalSignatureDate)));
            } else {
                this.forms.signOff.get('approvalSignatureDateDisplay').setValue(undefined);
            }
        }
    }

    isLoading():boolean{
        if(localStorage.getItem('isLoading'+this.incident.incidentNumberSequence)){
            return true
        }else{
            return false
        }
    }
}
