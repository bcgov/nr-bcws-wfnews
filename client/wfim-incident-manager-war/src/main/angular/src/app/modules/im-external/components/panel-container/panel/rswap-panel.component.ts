import { DatePipe } from "@angular/common";
import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output, SimpleChanges } from '@angular/core';
import { Validators } from '@angular/forms';
import { ResourceAllocationAssessmentResource } from '@wf1/incidents-rest-api';
import { clearIMFormComponentValidationState } from "../../../../../store/validation/validation.actions";
import { isEmpty } from "../../../../../utils";
import { BasePanelComponent } from './base.panel.component';
import { Convert } from "./convert";

@Component({
    selector: 'wfim-rswap-panel',
    templateUrl: './rswap-panel.component.html',
    styleUrls: ['./base-panel.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush
})

export class RswapPanelComponent extends BasePanelComponent {
    readonly panelName: string = 'RSWAP';
    readonly rswapArrayId = "assessmentValueAtRisks";
    readonly rswapArrayLabel = "Specific Values at Risk";

    @Input() rswap: ResourceAllocationAssessmentResource;
    @Output() updateRswap: EventEmitter<ResourceAllocationAssessmentResource> = new EventEmitter();
    datePipe: DatePipe = new DatePipe('en-US');


    ngOnChanges({ incident, rswap }: SimpleChanges) {
        if (rswap && this.formGroup) {
            this.formGroup.patchValue(Convert.rswapResourceToForm(rswap.currentValue as ResourceAllocationAssessmentResource));
            Convert.rswapArrayResourceToForm(incident ? incident.currentValue : this.incident, rswap.currentValue, this.formGroup, this.fb);
            this.formGroup.markAsPristine();
            if(!rswap.firstChange){
                this.formGroup.enable()
                this.formGroup.get('fireCentrePriorityRankLastModified').disable();
                this.formGroup.get('provincialPriorityRankLastModified').disable();
                localStorage.removeItem('isLoading'+this.incident.incidentNumberSequence);
            }

        }
        if (this.formGroup) {
            if (this.validationState && !isEmpty(this.validationState)) {
                setTimeout(() => window.scrollTo(0, 0), 1000);
                this.processValidationState();
            }
        }
        if (incident && this.formGroup){
            if(!incident.firstChange){
                this.formGroup.enable()
                this.formGroup.get('fireCentrePriorityRankLastModified').disable();
                this.formGroup.get('provincialPriorityRankLastModified').disable();
                localStorage.removeItem('isLoading'+this.incident.incidentNumberSequence);
            }
        }
    }

    ngAfterViewInit() {
        Convert.rswapArrayResourceToForm(this.incident, this.rswap, this.formGroup, this.fb);
        super.ngAfterViewInit();
    }

    createForm() {
        this.formGroup = this.fb.group({
            fireAnalysisStatusCode: this.rswap.fireAnalysisStatusCode,
            responseObjectiveComment: this.rswap.responseObjectiveComment,
            controlChanceOfSuccessCode: this.rswap.controlChanceOfSuccessCode,
            evacuationAlertInd: this.rswap.evacuationAlertInd,
            evacuationOrderInd: this.rswap.evacuationOrderInd,
            privateAssetDamagedInd: this.rswap.privateAssetDamagedInd,
            valuesAtRiskDescription: this.rswap.valuesAtRiskDescription,
            otherConsiderationComment: this.rswap.otherConsiderationComment,
            riskEstimatedValue: [this.rswap.riskEstimatedValue ? this.rswap.riskEstimatedValue : '', [Validators.pattern('\\d*\\.?\\d{0,2}'), Validators.min(0)]],
            fireAnalysisEstimatedCost: [this.rswap.fireAnalysisEstimatedCost ? this.rswap.fireAnalysisEstimatedCost : '', [Validators.pattern('\\d*\\.?\\d{0,2}'), Validators.min(0)]],
            fireCentrePriorityRank: [this.rswap.fireCentrePriorityRank ? this.rswap.fireCentrePriorityRank : '', [Validators.pattern('[0-9]*'), Validators.min(0)]],
            provincialPriorityRank: this.rswap.provincialPriorityRank,
            fireCentrePriorityRankLastModified: [{ value: Convert.formatLastModifiedBy(this.rswap.fireCentreAssessedByName, this.rswap.fireCentreAssessedTimestamp), disabled: true }],
            provincialPriorityRankLastModified: [{ value: Convert.formatLastModifiedBy(this.rswap.provincialAssessedByName, this.rswap.provincialAssessedTimestamp), disabled: true }]
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
        this.store.dispatch(clearIMFormComponentValidationState(`${this.incident.wildfireYear}${this.incident.incidentNumberSequence}`, 'rswap'));
    }

    disableCheckboxes() {
        this.formGroup.get('evacuationAlertInd').disable();
        this.formGroup.get('evacuationOrderInd').disable();
        this.formGroup.get('privateAssetDamagedInd').disable();
    }

    copyFormToResources() {
        super.copyFormToResources();
        const updatedRswap = this.copyFormToRswapResource();
        this.updateRswap.emit(updatedRswap);
    }

    copyFormToRswapResource(): ResourceAllocationAssessmentResource {
        this.formGroup.value["assessmentValueAtRisks"] = Convert.mapRswapFormValues(this.formGroup.value);

        return Convert.rswapFormToRswapResource(this.formGroup, this.rswap);
    }
}
