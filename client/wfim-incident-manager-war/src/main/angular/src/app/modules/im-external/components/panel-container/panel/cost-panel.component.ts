import { ChangeDetectionStrategy, Component, SimpleChanges } from '@angular/core';
import { Validators } from '@angular/forms';
import { WildfireIncidentResource } from '@wf1/incidents-rest-api';
import { clearIMFormComponentValidationState } from "../../../../../store/validation/validation.actions";
import { isEmpty } from "../../../../../utils";
import { BasePanelComponent } from './base.panel.component';
import { Convert } from "./convert";

@Component({
    selector: 'wfim-cost-panel',
    templateUrl: './cost-panel.component.html',
    styleUrls: ['./base-panel.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush
})

export class CostPanelComponent extends BasePanelComponent {
    readonly panelName: string = 'Incident Costs';

    public TOOLTIP_DELAY = 500;

    ngOnChanges(changes: SimpleChanges) {
        if (changes.incident && this.formGroup) {
            this.formGroup.patchValue(Convert.incidentResourceToForm(changes.incident.currentValue as WildfireIncidentResource, this.spatialUtils));
            this.formGroup.markAsPristine();
            if(!changes.incident.firstChange){
                this.formGroup.enable()
                this.formGroup.get('estimatedCostWFCST').disable();
                localStorage.removeItem('isLoading'+this.incident.incidentNumberSequence);
            }
            if (this.formGroup) {
                if (this.validationState && !isEmpty(this.validationState)) {
                    setTimeout(() => window.scrollTo(0, 0), 1000);
                    this.processValidationState();
                }
            }
        }
    }

    ngAfterViewInit() {
        super.ngAfterViewInit();
    }

    initializeForm() {
        super.initializeForm();
        if (this.incident.signOffSignatureDate) {
            // this.formGroup.get('actualCostOfControl').enable();
            this.formGroup.get('claimExpectedInd').enable();
        }
    }

    createForm() {
        this.formGroup = this.fb.group({
            claimExpectedInd: this.incident.claimExpectedInd,
            estimatedCostWFCST: [{ value: this.incident.incidentSituation.estimatedIncidentCost ? this.incident.incidentSituation.estimatedIncidentCost : '0.00', disabled: true }],
            actualCostOfControl: [this.incident.incidentSituation.actualCostOfControl ? this.incident.incidentSituation.actualCostOfControl : '', [Validators.pattern('\\d*\\.?\\d{0,2}'), Validators.min(0)]],
        });

    }

    ngOnInit() {
        super.ngOnInit();
        this.formGroup.disable()
        localStorage.setItem('isLoading'+this.incident.incidentNumberSequence, 'true');
    }

    onSubmit() {
        localStorage.setItem('isLoading'+this.incident.incidentNumberSequence, 'true');
        super.onSubmit();
        this.store.dispatch(clearIMFormComponentValidationState(`${this.incident.wildfireYear}${this.incident.incidentNumberSequence}`, 'costs'));
    }

    processValidationState() {
        if (this.formGroup) {
            // this.checkForApiError('actualCostOfControl', 'incidentSituation.actualCostOfControl');
            // this.checkForApiError('estimatedCostWFCST', 'incidentSituation.estimatedIncidentCost');
        }
    }

    disableCheckboxes() {
        this.formGroup.get('claimExpectedInd').disable();
    }

    copyFormToIncidentResource(): WildfireIncidentResource {
        let incident = super.copyFormToIncidentResource();
        return Convert.costFormToIncidentResource(this.formGroup, incident);
    }
}
