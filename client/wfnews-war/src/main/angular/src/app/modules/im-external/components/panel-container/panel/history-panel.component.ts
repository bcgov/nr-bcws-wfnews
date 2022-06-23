import { Component, SimpleChanges } from '@angular/core';
import { Validators } from '@angular/forms';
import { WildfireIncidentResource } from "@wf1/incidents-rest-api";
import { clearIMFormComponentValidationState } from "../../../../../store/validation/validation.actions";
import { isEmpty } from "../../../../../utils";
import { BasePanelComponent } from './base.panel.component';
import { Convert } from "./convert";

@Component({
    selector: 'wfim-history-panel',
    templateUrl: './history-panel.component.html',
    styleUrls: ['./base-panel.component.scss']
})
export class HistoryPanelComponent extends BasePanelComponent {
    readonly panelName: string = 'History';

    ngOnInit() {
        super.ngOnInit();
        this.formGroup.disable()
        localStorage.setItem('isLoading'+this.incident.incidentNumberSequence, 'true');

    }

    ngOnChanges({ incident }: SimpleChanges) {
        if (incident && this.formGroup) {
            this.formGroup.patchValue(Convert.incidentResourceToForm(incident.currentValue as WildfireIncidentResource, this.spatialUtils));
            this.formGroup.markAsPristine();
            if(!incident.firstChange){
                localStorage.removeItem('isLoading'+this.incident.incidentNumberSequence);
                this.formGroup.enable()
            }
        }

        if (this.formGroup) {
            if (this.validationState && !isEmpty(this.validationState)) {
                setTimeout(() => window.scrollTo(0, 0), 1000);
                this.processValidationState();
            }
        }
    }

    createForm() {
        this.formGroup = this.fb.group({
            incidentTimestamp: this.incident.incidentTimestamp ? new Date(this.incident.incidentTimestamp) : null,
            reportedTimestamp: this.incident.reportedTimestamp ? new Date(this.incident.reportedTimestamp) : null,
            detectionSourceCode: this.incident.detectionSourceCode,
            discoverySizeHectares: [this.incident.discoverySizeHectares, [Validators.pattern('\\d*\\.?\\d{0,3}'), Validators.min(0)]],
            discoveryTimestamp: this.incident.discoveryTimestamp ? new Date(this.incident.discoveryTimestamp) : null,
            lastUpdatedTimestamp: this.incident.lastUpdatedTimestamp ? new Date(this.incident.lastUpdatedTimestamp) : null,
            firstActionedByPartyName: this.incident.firstActionedByParty ? this.incident.firstActionedByParty.partyName : null,
            firstAgencyToActionIncidentTimestamp: this.incident.firstAgencyToActionIncidentTimestamp ? new Date(this.incident.firstAgencyToActionIncidentTimestamp) : null,
            leadAgencyStartTimestamp: this.incident.leadAgencyStartTimestamp ? new Date(this.incident.leadAgencyStartTimestamp) : null,
            leadAgencyEndTimestamp: this.incident.leadAgencyEndTimestamp ? new Date(this.incident.leadAgencyEndTimestamp) : null,
            fireOutDate: this.incident.incidentSituation.fireOutDate ? new Date(this.incident.incidentSituation.fireOutDate) : null,
            fireBeingHeldDate: this.incident.incidentSituation.fireBeingHeldDate ? new Date(this.incident.incidentSituation.fireBeingHeldDate) : null,
            fireContainedDate: this.incident.incidentSituation.fireContainedDate ? new Date(this.incident.incidentSituation.fireContainedDate) : null,
            fireUnderControlDate: this.incident.incidentSituation.fireUnderControlDate ? new Date(this.incident.incidentSituation.fireUnderControlDate) : null
        });
    }

    onSubmit() {
        localStorage.setItem('isLoading'+this.incident.incidentNumberSequence, 'true');
        super.onSubmit();
        this.store.dispatch(clearIMFormComponentValidationState(`${this.incident.wildfireYear}${this.incident.incidentNumberSequence}`, 'history'));
    }

    processValidationState() {
        if (this.formGroup) {
            this.checkForApiError('incidentTimestamp', 'incidentTimestamp');
            this.checkForApiError('discoveryTimestamp', 'discoveryTimestamp');
            this.checkForApiError('reportedTimestamp', 'reportedTimestamp');
            this.checkForApiError('detectionSourceCode', 'detectionSourceCode');
            this.checkForApiError('firstAgencyToActionIncidentTimestamp', 'firstAgencyToActionIncidentTimestamp');
            this.checkForApiError('discoverySizeHectares', 'discoverySizeHectares');
            this.checkForApiError('firstActionedByPartyName', 'firstActionedByParty');
            this.checkForApiError('fireOutDate', 'incidentSituation.fireOutDate');
            this.checkForApiError('fireBeingHeldDate', 'incidentSituation.fireBeingHeldDate');
            this.checkForApiError('fireContainedDate', 'incidentSituation.fireContainedDate');
            this.checkForApiError('fireUnderControlDate', 'incidentSituation.fireUnderControlDate');
        }
    }

    copyFormToIncidentResource(): WildfireIncidentResource {
        let incident = super.copyFormToIncidentResource();
        return Convert.historyFormToIncidentResource(this.formGroup, incident);
    }
}
