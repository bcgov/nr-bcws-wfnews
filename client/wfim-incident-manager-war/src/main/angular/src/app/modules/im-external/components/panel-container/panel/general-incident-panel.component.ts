import { Component, SimpleChanges } from '@angular/core';
import { Validators } from '@angular/forms';
import { select } from '@ngrx/store';
import { WildfireIncidentResource } from '@wf1/incidents-rest-api';
import { INCIDENT_STATUS_CODES, INCIDENT_TYPE_CODES, STAGE_OF_CONTROL_CODES } from "../../../../../constants";
import { clearIMFormComponentValidationState } from "../../../../../store/validation/validation.actions";
import { selectIncidentComponentValidationState } from '../../../../../store/validation/validation.selectors';
import { isEmpty, isIncidentTypeWithStageOfControl, isIncidentTypeWithStatus } from "../../../../../utils";
import { geometryValidator } from "../../../../../validators/geometry.validator";
import { BasePanelComponent } from './base.panel.component';
import { Convert } from "./convert";

@Component({
    selector: 'wfim-general-incident-panel',
    templateUrl: './general-incident-panel.component.html',
    styleUrls: ['./base-panel.component.scss']
})

export class GeneralIncidentPanelComponent extends BasePanelComponent {
    readonly panelName: string = 'General';
    readonly sectionLabelOverview: string = 'Overview';
    readonly sectionLabelSiteDetails: string = 'Site Details';
    readonly sectionLabelInitialFireReportDetails: string = 'Initial Fire Report Details';
    public TOOLTIP_DELAY = 500;

    createForm() {
        this.formGroup = this.fb.group({
            incidentYear: [{ value: this.incident.wildfireYear ? this.incident.wildfireYear : '', disabled: true }],
            incidentLabel: [{ value: this.incident.incidentLabel ? this.incident.incidentLabel : '', disabled: true }],
            incidentName: [this.incident.incidentName ? this.incident.incidentName : ''],
            incidentTypeCode: this.incident.incidentTypeCode,
            incidentStatusCode: this.incident.incidentStatusCode,
            incidentStatusCodeDisplay: this.incident.incidentStatusCode,
            fireClassificationCode: this.incident.fireClassificationCode,
            fireCentreOrgUnitIdentifier: [{ value: this.incident.fireCentreOrgUnitIdentifier, disabled: true }],
            zoneOrgUnitIdentifier: [{ value: this.incident.zoneOrgUnitIdentifier, disabled: true }],
            latLong: [Convert.getFormattedLatLong(this.incident, this.spatialUtils), [Validators.required, geometryValidator(this.spatialUtils)]],
            interfaceFireInd: this.incident.incidentSituation.interfaceFireInd,
            responseTypeCode: this.incident.responseTypeCode,
            geographicDescription: this.incident.incidentLocation.geographicDescription ? this.incident.incidentLocation.geographicDescription : '',
            stageOfControlCode: this.incident.incidentSituation.stageOfControlCode,
            stageOfControlCodeDisplay: this.incident.incidentSituation.stageOfControlCode,
            incidentCommanderName: this.incident.incidentCommanderName ? this.incident.incidentCommanderName : '',
            containedPercentage: [this.incident.incidentSituation.containedPercentage ? this.incident.incidentSituation.containedPercentage : '', [Validators.pattern('-?\\d*'), Validators.min(0), Validators.max(100)]],
            fireOfNotePublishedInd: this.incident.fireOfNotePublishedInd,
            simplexChannelColour: this.incident.simplexRadioFrequency.channelColour,
            duplexChannelColour: this.incident.duplexRadioFrequency.channelColour,
            toneNumber: this.incident.duplexRadioFrequency.toneNumber,
            leadByPartyName: this.incident.leadByParty ? this.incident.leadByParty.partyName : null,
            paperTrailedInd: this.incident.paperTrailedInd,
            fieldPhotoInd: this.incident.fieldPhotoInd,
            valuesAtRiskDescription: this.incident.incidentSituation.valuesAtRiskDescription,
            valuesAtRiskDistanceMeters: [this.incident.incidentSituation.valuesAtRiskDistanceMeters ? this.incident.incidentSituation.valuesAtRiskDistanceMeters : '', [Validators.pattern('\\d*\\.?\\d{0,2}'), Validators.min(0)]],
            valueDirectionCode: this.incident.incidentSituation.valueDirectionCode,
            siteAccessPointTypeCode: this.incident.incidentSituation.siteAccessPointTypeCode,
            accessDistanceMeters: [this.incident.incidentSituation.accessDistanceMeters ? this.incident.incidentSituation.accessDistanceMeters : '', [Validators.pattern('\\d*\\.?\\d{0,2}'), Validators.min(0)]],
            accessDirectionCode: this.incident.incidentSituation.accessDirectionCode,
            availableWaterCode: this.incident.incidentSituation.availableWaterCode,
            availableWaterDistanceMeters: [this.incident.incidentSituation.availableWaterDistanceMeters ? this.incident.incidentSituation.availableWaterDistanceMeters : '', [Validators.pattern('\\d*\\.?\\d{0,2}'), Validators.min(0)]],
            waterDirectionCode: this.incident.incidentSituation.waterDirectionCode,
            probabilityOfInitialAttackSuccessCode: this.incident.probabilityOfInitialAttackSuccessCode
        });
    }

    ngOnInit() {
        super.ngOnInit();
        this.init();
        localStorage.setItem('isLoading'+this.incident.incidentNumberSequence, 'true');
        this.formGroup.disable()
    }

    init() {
        const incidentTypeCode = this.getIncidentTypeCode();
        this.updateFormControlStates(incidentTypeCode);

        this.getIncidentStatusDisplayFormControl().valueChanges.subscribe(val => {
            this.getIncidentStatusFormControl().setValue(val);
        });

        this.getStageOfControlDisplayFormControl().valueChanges.subscribe(val => {
            this.getStageOfControlFormControl().setValue(val);
        })

    }

    ngOnChanges(changes: SimpleChanges) {
        super.ngOnChanges(changes);
        if (changes.incident && this.formGroup) {
            this.formGroup.patchValue(Convert.incidentResourceToForm(changes.incident.currentValue as WildfireIncidentResource, this.spatialUtils));
            this.formGroup.markAsPristine();
            if(!changes.incident.firstChange){
                localStorage.removeItem('isLoading'+this.incident.incidentNumberSequence);
                this.formGroup.enable() 
                this.disableFields()

            }
            if (this.formGroup) {
                if (this.validationState && !isEmpty(this.validationState)) {
                    setTimeout(() => window.scrollTo(0, 0), 1000);
                    this.processValidationState();
                }
            }
        }
    }

    disableFields(){
        this.formGroup.get('incidentYear').disable();
        this.formGroup.get('incidentLabel').disable();
        this.formGroup.get('fireCentreOrgUnitIdentifier').disable();
        this.formGroup.get('zoneOrgUnitIdentifier').disable();
    }

    onIncidentTypeChanged(e) {
        // console.log("onIncidentTypeChanged: ", e);

        const incidentTypeCode = e;

        let stageOfControlDisplayFormCtl = this.getStageOfControlDisplayFormControl();
        let incidentStatusDisplayFormCtl = this.getIncidentStatusDisplayFormControl()
        stageOfControlDisplayFormCtl.enable();
        stageOfControlDisplayFormCtl.enable();

        stageOfControlDisplayFormCtl.setValue(null);

        if (isIncidentTypeWithStatus(incidentTypeCode)) {
            console.log("isIncidentTypeWithStatus");
            const defaultStatus = this.getDefaultStatusForIncidentType(incidentTypeCode);
            console.log("defaultStatus for status: " + defaultStatus);
            incidentStatusDisplayFormCtl.setValue(defaultStatus);
        } else {
            console.log("not isIncidentTypeWithStatus");
            const defaultSoc = this.getDefaultStageOfControlForIncidentType(incidentTypeCode);
            console.log("default soc: ", defaultSoc);
            stageOfControlDisplayFormCtl.setValue(defaultSoc);
        }

        this.updateFormControlStates(incidentTypeCode);

    }

    updateFormControlStates(incidentTypeCode) {
        let stageOfControlDisplayFormCtl = this.getStageOfControlDisplayFormControl();
        let incidentStatusDisplayFormCtl = this.getIncidentStatusDisplayFormControl();

        if (this.isSignedOffOrApproved()) {
            stageOfControlDisplayFormCtl.disable();
            incidentStatusDisplayFormCtl.disable();
        } else {
            if (isIncidentTypeWithStageOfControl(incidentTypeCode)) {
                console.log("enable soc, disable status");
                stageOfControlDisplayFormCtl.enable();
                incidentStatusDisplayFormCtl.disable();
            } else {
                console.log("enable status, disable status");
                incidentStatusDisplayFormCtl.enable();
                stageOfControlDisplayFormCtl.disable();
            }
        }

    }

    getIncidentTypeCode() {
        return this.formGroup.get('incidentTypeCode').value;
    }

    getStageOfControlFormControl() {
        return this.formGroup.get('stageOfControlCode');
    }

    getStageOfControlDisplayFormControl() {
        return this.formGroup.get('stageOfControlCodeDisplay');
    }

    getIncidentStatusDisplayFormControl() {
        return this.formGroup.get('incidentStatusCodeDisplay');
    }

    getIncidentStatusFormControl() {
        return this.formGroup.get('incidentStatusCode');
    }


    getDefaultStageOfControlForIncidentType(incidentTypeCode) {
        const options = this.getStageOfControlCodeOptionsByIncidentType(incidentTypeCode);
        if (options.length === 0) { return null };

        return options[0].code;
    }

    getStageOfControlCodeOptions() {
        const incidentTypeCode = this.getIncidentTypeCode();
        return this.getStageOfControlCodeOptionsByIncidentType(incidentTypeCode);
    }

    getStageOfControlCodeOptionsByIncidentType(incidentTypeCode) {
        let allOptions = this.getCodeOptions('STAGE_OF_CONTROL_CODE');

        if (incidentTypeCode === INCIDENT_TYPE_CODES.FIRE) { return allOptions };
        if (incidentTypeCode === INCIDENT_TYPE_CODES.NUISANCE_FIRE) {
            return allOptions
                .filter(option =>
                (option.code === STAGE_OF_CONTROL_CODES.UNDER_CONTROL
                    || option.code === STAGE_OF_CONTROL_CODES.OUT));
        };

        return [];
    }

    getDefaultStatusForIncidentType(incidentTypeCode) {

        const options = this.getIncidentStatusCodeOptionsByIncidentType(incidentTypeCode);
        if (options.length === 0) { return null };

        return options[0].code;
    }

    getIncidentStatusCodeOptions() {

        const incidentTypeCode = this.getIncidentTypeCode();
        return this.getIncidentStatusCodeOptionsByIncidentType(incidentTypeCode);

    }

    getIncidentStatusCodeOptionsByIncidentType(incidentTypeCode) {
        let allOptions = this.getCodeOptions('INCIDENT_STATUS_CODE');

        if (incidentTypeCode === INCIDENT_TYPE_CODES.SMOKE_CHASE
            || incidentTypeCode === INCIDENT_TYPE_CODES.AGENCY_ASSIST
            || incidentTypeCode === INCIDENT_TYPE_CODES.FIELD_ACTIVITY) {
            return allOptions
                .filter(option =>
                (option.code === INCIDENT_STATUS_CODES.ACTIVE
                    || option.code === INCIDENT_STATUS_CODES.COMPLETED));
        };

        if (incidentTypeCode === INCIDENT_TYPE_CODES.DUPLICATE
            || incidentTypeCode === INCIDENT_TYPE_CODES.ENTERED_IN_ERROR) {
            return allOptions.filter(option => option.code === INCIDENT_STATUS_CODES.COMPLETED);
        };

        return allOptions.filter(option => option.code === INCIDENT_STATUS_CODES.ACTIVE);
    }

    processValidationState() {
        if (this.formGroup) {
            this.checkForApiError('responseTypeCode', 'responseTypeCode');
            this.checkForApiError('valuesAtRiskDescription', 'incidentSituation.valuesAtRiskDescription');
            this.checkForApiError('siteAccessPointTypeCode', 'incidentSituation.siteAccessPointTypeCode');
            this.checkForApiError('incidentYear', 'wildfireYear');
            this.checkForApiError('incidentLabel', 'incidentLabel');
            this.checkForApiError('fireCentreOrgUnitIdentifier', 'fireCentreOrgUnitIdentifier');
            this.checkForApiError('zoneOrgUnitIdentifier', 'zoneOrgUnitIdentifier');
            this.checkForApiError('latLong', 'incidentLocation.latitude');
            this.checkForApiError('latLong', 'incidentLocation.longitude');
            this.checkForApiError('incidentCommanderName', 'incidentCommanderName');
            this.checkForApiError('fireClassificationCode', 'fireClassificationCode');
            this.checkForApiError('geographicDescription', 'incidentLocation.geographicDescription');
            this.checkForApiError('containedPercentage', 'incidentSituation.containedPercentage');
            this.checkForApiError('fieldPhotoInd', 'fieldPhotoInd');
        }
    }

    onSubmit() {
        localStorage.setItem('isLoading'+this.incident.incidentNumberSequence, 'true');
        super.onSubmit();
        this.store.dispatch(clearIMFormComponentValidationState(`${this.incident.wildfireYear}${this.incident.incidentNumberSequence}`, 'general'));
    }

    disableCheckboxes() {
        this.formGroup.get('interfaceFireInd').disable();
        this.formGroup.get('fireOfNotePublishedInd').disable();
        this.formGroup.get('paperTrailedInd').disable();
        this.formGroup.get('fieldPhotoInd').disable();
    }


    copyFormToIncidentResource(): WildfireIncidentResource {
        let incident = super.copyFormToIncidentResource();
        return Convert.generalFormToIncidentResource(this.formGroup, incident, this.spatialUtils);
    }
}
