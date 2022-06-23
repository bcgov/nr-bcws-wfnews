import { Component, EventEmitter, Input, Output, SimpleChanges } from '@angular/core';
import { FormGroup } from '@angular/forms';
import {
    IncidentCauseResource,
    OriginAndCauseInvestigationResource,
    WildfireIncidentResource
} from '@wf1/incidents-rest-api';
import * as IncidentActions from '../../../../../store/im/im.actions';
import { clearIMFormComponentValidationState } from "../../../../../store/validation/validation.actions";
import { isEmpty } from "../../../../../utils";
import { BasePanelComponent } from './base.panel.component';
import { Convert } from "./convert";

@Component({
    selector: 'wfim-cause-panel',
    templateUrl: './cause-panel.component.html',
    styleUrls: ['./base-panel.component.scss']
})

export class CausePanelComponent extends BasePanelComponent {
    public TOOLTIP_DELAY = 500;

    readonly panelName: string = 'Cause';
    public causeFormGroup: FormGroup;

    @Input() ocInvestigation: OriginAndCauseInvestigationResource;
    @Input() cause: IncidentCauseResource;
    @Output() updateOCInvestigation: EventEmitter<OriginAndCauseInvestigationResource> = new EventEmitter();
    @Output() refreshCause: EventEmitter<IncidentCauseResource> = new EventEmitter();


    createForm() {
        this.formGroup = this.fb.group({
            resourcesRequestedInd: this.ocInvestigation.resourcesRequestedInd,
            agencyRespondedInd: this.ocInvestigation.agencyRespondedInd,
            investigatorName: this.ocInvestigation.investigatorName,
            investigationRequesterCode: this.ocInvestigation.investigationRequesterCode,
            suspectedCauseCategoryCode: this.incident.suspectedCauseCategoryCode,
            investigationRequestedTimestamp: this.ocInvestigation.investigationRequestedTimestamp ? new Date(this.ocInvestigation.investigationRequestedTimestamp) : null,
            investigationAgencyRespondedTimestamp: this.ocInvestigation.investigationAgencyRespondedTimestamp ? new Date(this.ocInvestigation.investigationAgencyRespondedTimestamp) : null
        });

        this.causeFormGroup = this.fb.group({
            generalIncidentCauseCategoryCode: [{ value: this.cause.generalIncidentCauseCategoryCode ? this.cause.generalIncidentCauseCategoryCode : '', disabled: true }],
            completeCauseInd: [{ value: this.cause.completeCauseInd ? this.cause.completeCauseInd : '', disabled: true }],
            incidentCauseReasonCategoryCode: [{ value: this.cause.incidentCauseReasonCategoryCode ? this.cause.incidentCauseReasonCategoryCode : '', disabled: true }],
            incidentCauseReasonKindCode: [{ value: this.cause.incidentCauseReasonKindCode ? this.cause.incidentCauseReasonKindCode : '', disabled: true }],
            forestActivityCategoryCode: [{ value: this.cause.forestActivityCategoryCode ? this.cause.forestActivityCategoryCode : '', disabled: true }],
            forestActivityKindCode: [{ value: this.cause.forestActivityKindCode ? this.cause.forestActivityKindCode : '', disabled: true }],
            incidentCauseActivityCategoryCode: [{ value: this.cause.incidentCauseActivityCategoryCode ? this.cause.incidentCauseActivityCategoryCode : '', disabled: true }],
            incidentCauseActivityKindCode: [{ value: this.cause.incidentCauseActivityKindCode ? this.cause.incidentCauseActivityKindCode : '', disabled: true }],
            incidentCauseActivitySubkindCode: [{ value: this.cause.incidentCauseActivitySubkindCode ? this.cause.incidentCauseActivitySubkindCode : '', disabled: true }],
            causeCertaintyCode: [{ value: this.cause.causeCertaintyCode ? this.cause.causeCertaintyCode : '', disabled: true }],
            incidentCauseComment: [{ value: this.cause.incidentCauseComment ? this.cause.incidentCauseComment : '', disabled: true }],
        });
    }

    ngOnInit() {
        super.ngOnInit();
        this.formGroup.disable()
        localStorage.setItem('isLoading'+this.incident.incidentNumberSequence, 'true');
    }

    checkFormStatus() {
    }

    ngOnChanges({ cause, incident, ocInvestigation }: SimpleChanges) {
        if (cause && this.causeFormGroup) {
            this.causeFormGroup.patchValue(Convert.causeResourceToForm(cause.currentValue as IncidentCauseResource));
            this.formGroup.markAsPristine();
        }
        if (incident && this.formGroup) {
            this.formGroup.patchValue(Convert.incidentResourceToForm(incident.currentValue as WildfireIncidentResource, this.spatialUtils));
            this.formGroup.markAsPristine();
            if(!incident.firstChange){
                this.formGroup.enable()
                localStorage.removeItem('isLoading'+this.incident.incidentNumberSequence);
            }
        }
        if (ocInvestigation && this.formGroup) {
            this.formGroup.patchValue(Convert.ocInvestigationResourceToForm(ocInvestigation.currentValue as OriginAndCauseInvestigationResource));
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
        this.store.dispatch(clearIMFormComponentValidationState(`${this.incident.wildfireYear}${this.incident.incidentNumberSequence}`, 'cause'));
    }

    processValidationState() {
        if (this.formGroup) {
            this.checkForApiError('investigationRequestedTimestamp', 'originAndCauseInvestigation.investigationRequestedTimestamp');
        }

    }

    disableCheckboxes() {
        this.formGroup.get('resourcesRequestedInd').disable();
        this.formGroup.get('agencyRespondedInd').disable();
    }

    copyFormToResources() {
        super.copyFormToResources();
        const updatedOCInvestigation = this.copyFormToOCInvestigationResource();
        this.updateOCInvestigation.emit(updatedOCInvestigation);
    }

    copyFormToOCInvestigationResource(): OriginAndCauseInvestigationResource {
        return Convert.ocInvestigationFormToOCInvestigationResource(this.formGroup, this.ocInvestigation);
    }

    popEditForm() {
        let config = this.appConfigService.getConfig()

        return this.httpClient.get( 'causeCodes/token.jsp' ).toPromise()
            .then( ( resp: any ) => {
                if ( !resp || !resp.userAttributes ) return

                let userAttrs = resp.userAttributes
                let incidentId = `${ this.incident.wildfireYear }${ this.incident.incidentNumberSequence }`

                return this.httpClient.post( `${ config.causeCodeConfig.rest.url }`, userAttrs.userToken ).toPromise()
                    .then( ( resp: any ) => {
                        const options = 'resizable=yes,scrollbars=yes,statusbar=yes,status=yes'
                        const windowName = 'im-cause-codes'
                        const causeCodeWebUrl = `${ config.causeCodeConfig.web.url }/pages/causecodes/causecodes.xhtml?AUTH_GUID=${ userAttrs.guid }&incidentId=${ incidentId }`
                        const causeCodeWindow = window.open( causeCodeWebUrl, windowName, options )

                        let interval = setInterval( () => {
                            if ( !causeCodeWindow ) {
                                this.refreshCause.emit()
                                clearInterval(interval)
                            }
                            else if ( causeCodeWindow.closed ) {
                                this.refreshCause.emit()
                                clearInterval(interval)
                            }
                        }, 1000 )
                    } )
            } )
            .catch( err => console.warn( 'error opening cause editor:', err ) )
    }

    refreshCauseCodes() {
        this.refreshCause.emit();
    }
}
