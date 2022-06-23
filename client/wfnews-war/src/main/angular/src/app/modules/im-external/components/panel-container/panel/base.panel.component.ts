import {
    AfterViewInit,
    ChangeDetectorRef,
    Component,
    ComponentFactoryResolver,
    EventEmitter,
    Input,
    NgZone,
    OnChanges,
    OnDestroy,
    OnInit,
    Output,
    SimpleChanges
} from '@angular/core';
import { HttpClient, HttpResponse } from '@angular/common/http';
import { FormBuilder, FormControl, FormGroup } from '@angular/forms';
// External
import { MatCheckboxChange } from '@angular/material/checkbox';
import { Store } from '@ngrx/store';
// Models
import { Code, IncidentAttachmentService, IncidentAttachmentsService, WildfireIncidentResource } from '@wf1/incidents-rest-api';
import { Code as OrgCode } from '@wf1/orgunit-rest-api';
// Redux
import { RootState } from '../../../../../store';
import { AppConfigService, CodeTablesIndex, SpatialUtilsService, TokenService } from '@wf1/core-ui';
import { Subscription } from "rxjs";
import { Convert } from "./convert";
import { ComponentValidationState } from "../../../../../store/validation/validation.state";
import { UIReportingService } from "../../../../../services/ui-reporting.service";
import { getCodeOptions, getOrgCodeOptions } from "../../../../../utils";
import { ApplicationStateService } from "../../../../../services/application-state.service";
import { MatDialog } from '@angular/material/dialog';
import { DocumentManagementService } from '../../../../../services/document-management.service';

@Component({
    selector: 'wfim-base-panel',
    templateUrl: './base-panel.component.html'
})
export class BasePanelComponent implements OnInit, AfterViewInit, OnChanges, OnDestroy {
    EMPTY_ARRAY = [];
    public formGroup: FormGroup;
    private storeErrorsSub: Subscription;
    private formChangeSub: Subscription;

    ngOnDestroy(): void {
        if (this.storeErrorsSub) {
            this.storeErrorsSub.unsubscribe();
        }
        if (this.formChangeSub) {
            this.formChangeSub.unsubscribe();
        }
    }

    readonly panelName: string;
    @Input() validationState: ComponentValidationState;
    @Input() incident: WildfireIncidentResource;
    @Input() incidentETag: string;
    @Output() dirty = new EventEmitter<boolean>();
    @Output() updateIncident: EventEmitter<WildfireIncidentResource> = new EventEmitter();

    optionsCodeTables: { [tableName: string]: Code[] } = {};
    optionsCodeTablesIndex: CodeTablesIndex;
    optionsCodeHierarchyIndex: CodeTablesIndex;
    optionsOrgCodeTables: { [tableName: string]: OrgCode[] } = {};

    keys = Object.keys;

    constructor(
        private uiReportingService: UIReportingService,
        protected store: Store<RootState>,
        protected fb: FormBuilder,
        protected spatialUtils: SpatialUtilsService,
        protected cdr: ChangeDetectorRef,
        protected applicationStateService: ApplicationStateService,
        protected matDialog: MatDialog,
        protected documentManagementService: DocumentManagementService,
        protected incidentAttachmentsService: IncidentAttachmentsService,
        protected incidentAttachmentService: IncidentAttachmentService,
        protected componentFactoryResolver: ComponentFactoryResolver,
        protected zone: NgZone,
        protected appConfigService: AppConfigService,
        protected httpClient: HttpClient,
        protected dialog: MatDialog
    ) { }

    ngOnInit() {
        if (!this.formGroup) {
            this.initializeForm();
        }
    }
    initializeForm() {
        this.createForm()
        this.checkFormStatus()
        this.dirty.emit(false)
    }

    checkFormStatus() {
        if ( this.incident.signOffSignatureDate ) {
            this.formGroup.disable()
            this.disableCheckboxes()
        }
        else if ( this.incident.approvalSignatureDate ) {
            this.formGroup.disable()
            this.disableCheckboxes()
        }
    }

    ngAfterViewInit(): void {
        this.formChangeSub = this.formChangeSub ? this.formChangeSub : this.formGroup.valueChanges.subscribe(val => this.hasChange(true));
        if (this.formGroup) {
            this.processValidationState();
        }
    }


    ngOnChanges(changes: SimpleChanges): void {
        if (changes.validationState) {
            if (changes.validationState.currentValue) {
                this.validationState = changes.validationState.currentValue;
            } else {
                this.validationState = {};
            }
        }
    }

    processValidationState() {

    }

    onError(form: FormGroup) { }

    handleResponse<T>(response: HttpResponse<T>) {
        this.uiReportingService.displaySuccessMessage();
    }

    hasChange(value: boolean) {
        let formGroup = this.formGroup;
        if (value) {
            this.dirty.emit(!formGroup.pristine); //only emit dirty true if the form is not pristine
        } else {
            this.dirty.emit(value); //false
        }
    }


    onSubmit() {
        let formValues = this.formGroup.value;
        this.copyFormToResources();
        this.formGroup.markAsPristine();
        this.hasChange(false);
    }

    //should be implemented by superclass to initialise this.formGroup
    createForm() {

    }

    getCodeOptions(codeType: string) {
        return getCodeOptions(codeType);
    }

    getOrgCodeOptions(codeType: string) {
        return getOrgCodeOptions(codeType);
    }

    copyFormToResources() {
        const updatedIncident = this.copyFormToIncidentResource();
        this.updateIncident.emit(updatedIncident);
    }

    copyFormToIncidentResource(): WildfireIncidentResource {
        let incident = Convert.mapFormValues(this.formGroup.value, this.incident);
        return incident;
    }

    updateCheckbox(event: MatCheckboxChange, controlName: string) {
        this.formGroup.get(controlName).markAsDirty();
        this.formGroup.get(controlName).setValue(event.checked);
    }

    disableCheckboxes() {

    }

    checkForApiError(formControlName: string, apiErrorPath: string) {
        if (this.formGroup && this.validationState) {
            if (this.validationState[apiErrorPath] && this.validationState[apiErrorPath].length > 0) {
                this.addApiError(this.formGroup.get(formControlName) as FormControl);
            }
        }
    }

    addApiError(formControl: FormControl) {
        formControl.setErrors({ "api-error": true });
        formControl.markAsTouched();
    }

    getValidationErrorsForPath(path: string) {
        if (this.validationState && this.validationState[path]) {
            return this.validationState[path];
        }
    }

    isSignedOffOrApproved() {
        return this.incident.signOffSignatureDate || this.incident.approvalSignatureDate;
    }

    isLoading():boolean{
        if(localStorage.getItem('isLoading'+this.incident.incidentNumberSequence)){
            return true
        }else{
            return false
        }
    }

}
