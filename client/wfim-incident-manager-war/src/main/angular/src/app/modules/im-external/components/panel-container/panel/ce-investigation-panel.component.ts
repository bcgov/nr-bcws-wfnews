import { Component, EventEmitter, Input, Output, SimpleChanges } from '@angular/core';
import { Validators } from '@angular/forms';
import { ComplianceAndEnforcementInvestigationResource, WildfireIncidentResource } from '@wf1/incidents-rest-api';
import { clearIMFormComponentValidationState } from "../../../../../store/validation/validation.actions";
import { isEmpty } from "../../../../../utils";
import { BasePanelComponent } from './base.panel.component';
import { Convert } from "./convert";

@Component({
    selector: 'wfim-ce-investigation-panel',
    templateUrl: './ce-investigation-panel.component.html',
    styleUrls: ['./base-panel.component.scss']
})

export class CEInvestigationPanelComponent extends BasePanelComponent {
    readonly panelName: string = 'C&E Investigation';
    readonly sectionLabelEnforcement: string = 'Enforcement';
    public TOOLTIP_DELAY = 500;

    @Input() ceInvestigation: ComplianceAndEnforcementInvestigationResource;
    @Output() updateCEInvestigation: EventEmitter<ComplianceAndEnforcementInvestigationResource> = new EventEmitter();

    createForm() {
        this.formGroup = this.fb.group({
            investigationRequesterCode: this.ceInvestigation.investigationRequesterCode,
            resourcesRequestedInd: this.ceInvestigation.resourcesRequestedInd,
            agencyRespondedInd: this.ceInvestigation.agencyRespondedInd,
            partyName: this.ceInvestigation.investigatingParty.partyName,
            investigatorName: this.ceInvestigation.investigatorName,
            damageToNaturalResourcesEstimate: [this.incident.damageToNaturalResourcesEstimate ? this.incident.damageToNaturalResourcesEstimate : '', [Validators.pattern('\\d*\\.?\\d{0,2}'), Validators.min(0)]],
            investigationReferenceNumber: this.ceInvestigation.investigationReferenceNumber,
            investigationDeterminationStatusCode: this.ceInvestigation.investigationDeterminationStatusCode,
            investigationRequestedTimestamp: this.ceInvestigation.investigationRequestedTimestamp ? new Date(this.ceInvestigation.investigationRequestedTimestamp) : null,
            investigationAgencyRespondedTimestamp: this.ceInvestigation.investigationAgencyRespondedTimestamp ? new Date(this.ceInvestigation.investigationAgencyRespondedTimestamp) : null
        });
    }

    checkFormStatus() {
    }

    ngOnInit() {
        super.ngOnInit();
        this.formGroup.disable()
        localStorage.setItem('isLoading'+this.incident.incidentNumberSequence, 'true');

    }

    ngOnChanges({ incident, ceInvestigation }: SimpleChanges) {
        if (incident && this.formGroup) {
            this.formGroup.patchValue(Convert.incidentResourceToForm(incident.currentValue as WildfireIncidentResource, this.spatialUtils));
            this.formGroup.markAsPristine();
            if(!incident.firstChange){
                this.formGroup.enable()
                localStorage.removeItem('isLoading'+this.incident.incidentNumberSequence);
            }
        }
        if (ceInvestigation && this.formGroup) {
            this.formGroup.patchValue(Convert.ceInvestigationResourceToForm(ceInvestigation.currentValue as ComplianceAndEnforcementInvestigationResource));
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
        this.store.dispatch(clearIMFormComponentValidationState(`${this.incident.wildfireYear}${this.incident.incidentNumberSequence}`, 'ceInvestigation'));
    }

    processValidationState() {
        if (this.formGroup) {
            // this.checkForApiError('complianceAndEnforcementInvestigationRequesterCode', 'complianceAndEnforcementInvestigationRequesterCode');
        }
    }

    disableCheckboxes() {
        this.formGroup.get('resourcesRequestedInd').disable();
        this.formGroup.get('agencyRespondedInd').disable();
    }

    copyFormToResources() {
        super.copyFormToResources();
        const updatedCE = this.copyFormToCEResource();
        this.updateCEInvestigation.emit(updatedCE);
    }

    copyFormToCEResource(): ComplianceAndEnforcementInvestigationResource {
        return Convert.ceFormToCEResource(this.formGroup, this.ceInvestigation);
    }

    copyFormToIncidentResource(): WildfireIncidentResource {
        let incident = super.copyFormToIncidentResource();
        return Convert.ceFormToCEIncidentResource(this.formGroup, incident);
    }

}
