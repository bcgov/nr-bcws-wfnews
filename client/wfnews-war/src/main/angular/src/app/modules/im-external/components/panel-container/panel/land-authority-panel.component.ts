import { Component, EventEmitter, Input, Output, SimpleChanges } from '@angular/core';
import { Validators } from '@angular/forms';
import { IncidentLandAuthorityResource, WildfireIncidentResource } from '@wf1/incidents-rest-api';
import { clearIMFormComponentValidationState } from "../../../../../store/validation/validation.actions";
import { isEmpty } from "../../../../../utils";
import { BasePanelComponent } from './base.panel.component';
import { Convert } from "./convert";

@Component({
    selector: 'wfim-land-authority-panel',
    templateUrl: './land-authority-panel.component.html',
    styleUrls: ['./base-panel.component.scss']
})

export class LandAuthorityPanelComponent extends BasePanelComponent {
    readonly panelName: string = 'Land Authority';
    @Output() updateLandAuthority: EventEmitter<IncidentLandAuthorityResource> = new EventEmitter();
    @Input() landAuthority: IncidentLandAuthorityResource;


    createForm() {
        this.formGroup = this.fb.group({

            landOwnershipClassCode: this.landAuthority.landOwnershipClassCode,
            partyName: this.landAuthority.managingParty.partyName,
            landManagerName: this.landAuthority.landManagerName,
            landManagerPhoneNumber: [this.landAuthority.landManagerPhoneNumber ? this.landAuthority.landManagerPhoneNumber.replace(/\D/g, '') : null, [Validators.pattern('^[0-9]{10}$')]],

            landManagerComment: this.landAuthority.landManagerComment ? this.landAuthority.landManagerComment : '',

            landOwnerName: this.landAuthority.landOwnerName,
            landOwnerPhoneNumber: [this.landAuthority.landOwnerPhoneNumber ? this.landAuthority.landOwnerPhoneNumber.replace(/\D/g, '') : null, [Validators.pattern('^[0-9]{10}$')]],
            landOwnerAddress: this.landAuthority.landOwnerAddress,

            costSharingAgreementInd: this.landAuthority.costSharingAgreementInd,
            rehabilitationPlanRequiredInd: this.incident.rehabilitationPlanRequiredInd,

        });
    }

    ngOnInit() {
        super.ngOnInit();
        this.formGroup.disable()
        localStorage.setItem('isLoading'+this.incident.incidentNumberSequence, 'true');
    }

    ngOnChanges({ incident, landAuthority }: SimpleChanges) {
        if (incident && this.formGroup) {
            this.formGroup.patchValue(Convert.incidentResourceToForm(incident.currentValue as WildfireIncidentResource, this.spatialUtils));
            this.formGroup.markAsPristine();
            if(!incident.firstChange){
                this.formGroup.enable()
                localStorage.removeItem('isLoading'+this.incident.incidentNumberSequence);
            }
        }
        if (landAuthority && this.formGroup) {
            this.formGroup.patchValue(Convert.landAuthorityResourceToForm(landAuthority.currentValue as IncidentLandAuthorityResource));
            this.formGroup.markAsPristine();
        }
        if (this.formGroup) {
            if (this.validationState && !isEmpty(this.validationState)) {
                setTimeout(() => window.scrollTo(0, 0), 1000);
                this.processValidationState();
            }
        }
    }

    onSubmit() {
        localStorage.setItem('isLoading'+this.incident.incidentNumberSequence, 'true');
        super.onSubmit();
        this.store.dispatch(clearIMFormComponentValidationState(`${this.incident.wildfireYear}${this.incident.incidentNumberSequence}`, 'landAuthority'));
    }

    processValidationState() {
        if (this.formGroup) {
            this.checkForApiError('landOwnershipClassCode', 'managingLandAuthority.landOwnershipClassCode');
            this.checkForApiError('costSharingAgreementInd', 'managingLandAuthority.costSharingAgreementInd');
            this.checkForApiError('partyName', 'managingLandAuthority.managingParty.partyName');
        }
    }


    disableCheckboxes() {
        this.formGroup.get('costSharingAgreementInd').disable();
        this.formGroup.get('rehabilitationPlanRequiredInd').disable();
    }

    copyFormToResources() {
        super.copyFormToResources();
        const updatedLandAuth = this.copyFormToLandAuthorityResource();
        this.updateLandAuthority.emit(updatedLandAuth);

    }

    copyFormToLandAuthorityResource(): IncidentLandAuthorityResource {
        return Convert.landAuthorityFormToLandAuthorityResource(this.formGroup, this.landAuthority);
    }
}
