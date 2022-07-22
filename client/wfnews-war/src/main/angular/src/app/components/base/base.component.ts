import {
    AfterViewInit,
    ChangeDetectorRef,
    Directive,
    Injectable,
    Input,
    OnChanges,
    OnInit,
    SimpleChanges
} from "@angular/core";
import {ActivatedRoute, Router} from "@angular/router";
import {DomSanitizer} from "@angular/platform-browser";
import {Store} from "@ngrx/store";
import {BaseComponentModel} from "./base.component.model";
import {
    DATE_FORMATS,
    getElementInnerText,
    hasValues,
    isElementTruncated,
    ResourcesRoutes
} from "../../../app/utils";
import {AbstractControl, FormBuilder, FormGroup} from "@angular/forms";
import {ConnectionService} from "ngx-connection-service";
import {Overlay} from "@angular/cdk/overlay";
import {ApplicationStateService} from "../../services/application-state.service";
import {AppConfigService, TokenService} from "@wf1/core-ui";
import {HttpClient} from "@angular/common/http";
import {MatDialog} from "@angular/material/dialog";
import {MatSnackBar} from "@angular/material/snack-bar";
import {PaginationInstance} from "ngx-pagination";

import { RootState } from "../../store";
import { ErrorState, LoadState } from "../../store/application/application.state";

@Directive()
@Injectable()
export class BaseComponent implements OnInit, OnChanges, AfterViewInit {
    @Input() loadState: LoadState;
    @Input() errorState: ErrorState[];
    @Input() saveErrorState: ErrorState[];
    @Input() severeErrorState?: ErrorState[];
    displayLabel = "Data";
    showingErrorDialog = false;
    backRoute: ResourcesRoutes = null;
    backRouteQueryParams: any;
    backRouteLabel: string = null;
    summaryString: string = null;
    isLocalSaving: boolean = false;
    isConnected: boolean = true;
    protected model: BaseComponentModel;
    public viewModel: BaseComponentModel;
    isLoading: boolean;
    componentId = "";
    mobile = this.getIsMobileResolution();


    SAVE_FAIL_TEXT = "Save failed";
    SAVE_SUCCESS_TEXT = "Saved Successfully";


    DATE_FORMATS = DATE_FORMATS;


    unsavedChangesMessage = "Unsaved Changes";

    isUnsaved = false;
    getElementInnerText = getElementInnerText;
    isElementTruncated = isElementTruncated;

    config: PaginationInstance = {
        id: "Paginator",
        itemsPerPage: 5,
        currentPage: 1,
        totalItems: 0
    };

    public paginatorLabels: any = {
        previousLabel: "",
        nextLabel: "",
    };

    constructor(protected router: Router,
                protected route: ActivatedRoute,
                protected sanitizer: DomSanitizer,
                protected store: Store<RootState>,
                protected fb: FormBuilder,
                protected dialog: MatDialog,
                protected applicationStateService: ApplicationStateService,
                protected tokenService: TokenService,
                protected connectionService: ConnectionService,
                protected snackbarService: MatSnackBar,
                protected overlay: Overlay,
                protected cdr: ChangeDetectorRef,
                protected appConfigService: AppConfigService,
                protected http: HttpClient) {
        this.initModels();
        this.initializeConnectionService();
    }

    initComponentPreferences() {

    }

    initializeConnectionService() {
        this.connectionService.monitor().subscribe(isConnected => {
            this.isConnected = isConnected.hasNetworkConnection;
        });
    }

    getPagingConfig(): PaginationInstance {
        return this.config;
    }


    initModels() {

    }

    loadPage() {

    }

    save(etag?: string) {
        this.isLocalSaving = true;
    }

    reload() {
    }

    saveOverwrite(etag: string) {
        this.save(etag);
    }

    ngOnInit() {
        this.loadPage();
    }

    ngAfterViewInit() {
    }

    ngOnChanges(changes: SimpleChanges) {
        //console.log(changes);
        if (changes.loadState) {
            this.isLoading = changes.loadState.currentValue.isLoading;
            let previousValue = changes.loadState.previousValue;
            if (!this.isLoading && previousValue && previousValue.isLoading && !this.isLocalSaving) {
                this.updateView();
                this.invokeAfterLoaded();
            }
        }
        if (changes.severeErrorState) {
            this.isLocalSaving = false;
        }
        if (changes.errorState) {
            this.errorState = changes.errorState.currentValue as ErrorState[];
            if (this.viewModel.formGroup) {
                this.viewModel.setErrorState(this.errorState);
            }
            if (this.isLocalSaving) {
                if (this.errorState && this.errorState.length > 0) {
                    this.isLocalSaving = false;
                    // if (this.SAVE_FAIL_TEXT && !this.showingErrorDialog) {
                    //     setTimeout(() => {
                    //         this.snackbarService.openFromComponent(WFSnackbarComponent, getSnackbarConfig(this.SAVE_FAIL_TEXT, WF_SNACKBAR_TYPES.ERROR));
                    //     });
                    // }

                }
            }
            // let err = this.errorState.find(err2 => err2.type == ERROR_TYPE.VALIDATION);
            // if (err) {
            //     // has a valphoneation error, scroll to top of screen to display error panel
            //     window.scrollTo(0, 0);
            // }
        }

        // console.log('end base is local saving', this.isLocalSaving);

    }


    invokeAfterLoaded() {

    }

    protected updateView(): void {
        //this.viewModel = this.model.clone();
    }


    getIsMobileResolution(): boolean {
        return this.applicationStateService.getIsMobileResolution();
    }

    redirectWithOAuth(redirectRoutePath: string) {
        let baseUrl = this.appConfigService.getConfig().application.baseUrl;
        let clientId = this.appConfigService.getConfig().webade.clientId;
        let authorizeUrl = this.appConfigService.getConfig().webade.oauth2Url;
        let authScopes = this.appConfigService.getConfig().webade.authScopes;
        let url = baseUrl;
        window.location.href = url;
    }

    getAsFormGroup(ac: AbstractControl): FormGroup {
        return ac as FormGroup;
    }

    disableSaveForm(form?: FormGroup): boolean {
        let fg = form ? form : this.viewModel.formGroup;
        return !fg.dirty || !fg.valid;
    }

    disableBatchSaveForm(arrayProperty: string, form?: FormGroup): boolean {
        let fg = form ? form : this.viewModel.formGroup;
        //Check form array for dirty flag
        let fgArray: FormGroup[] = fg?.controls[arrayProperty]['controls'];

        let arrayHasDirtyFlag = fgArray.some(contactFg => contactFg.dirty);
        let arrayHasInvalidFlag = fgArray.some(contactFg => !contactFg.valid);

        /*
         * Disable if
         * 1) the form array and main form is not dirty OR
         * 2) a form array form group is invalid
         */
        if (!arrayHasDirtyFlag && !fg.dirty) {
            return true;
        }
        if (arrayHasInvalidFlag) {
            return true;
        }

        return false;
    }

    unsavedForm(form?: FormGroup, arrayProperty?: string): boolean {
        //console.log("unsaved", this.componentId);
        let fg = form ? form : this.viewModel.formGroup;
        if (arrayProperty) {
            this.unsavedBatchForm(arrayProperty);
        } else {
            this.doUnsavedStateUpdateIfNeeded(this.componentId, fg.dirty);
        }
        return fg.dirty;
    }

    unsavedBatchForm(arrayProperty: string): boolean {
        let fg = this.viewModel.formGroup;
        //Check form array for dirty flag
        let fgArray: FormGroup[] = fg?.controls[arrayProperty]['controls'];
        let arrayHasDirtyFlag = fgArray.some(contactFg => contactFg.dirty);
        let hasAddedUnsavedItem = this.hasAddedUnsavedItemNotBlank(fg, arrayProperty);
        //console.log("arrayHasDirtyFlag", arrayHasDirtyFlag, "fgDirty", fg.dirty, "hasAddedUnsavedItem", hasAddedUnsavedItem);
        this.doUnsavedStateUpdateIfNeeded(this.componentId, arrayHasDirtyFlag || fg.dirty || hasAddedUnsavedItem);
        return this.isUnsaved;
    }

    doUnsavedStateUpdateIfNeeded(componentId: string, newUnsavedState: boolean) {
        let prevUnsaved = this.isUnsaved; //save old value for comparison
        //console.log(componentId, "prev", prevUnsaved, "new", newUnsavedState);
        this.isUnsaved = newUnsavedState;
    }

    hasAddedUnsavedItemNotBlank(fgMain: FormGroup, arrayProperty: string) {
        let controls = fgMain?.controls[arrayProperty]['controls'];
        let ret = controls.some(ac => {
                let fg: FormGroup = <FormGroup>ac;
                if (!fg.get("id").value && controls.length > 1) { //not a default empty entry
                    //console.log("not default entry");
                    return true;
                } else if (!fg.get("id").value && controls.length == 1) { //check if empty entry
                    let item = fg.getRawValue();
                    if (!hasValues(item)) {
                        //console.log("is default empty entry");
                        return false;
                    } else {
                        //console.log("default entry with info");
                        return true;
                    }
                } else {
                    //console.log("existing entry");
                    return false;
                }
            }
        );
        return ret;
    }

    getActionRowClass() {
        return 'space-between';
    }
}
