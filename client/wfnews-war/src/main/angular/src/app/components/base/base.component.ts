import {
    AfterViewInit,
    ChangeDetectorRef,
    Directive,
    Injectable,
    Input,
    OnChanges,
    OnInit,
    SimpleChanges
} from '@angular/core';
import {ActivatedRoute, Router} from '@angular/router';
import {DomSanitizer} from '@angular/platform-browser';
import {Store} from '@ngrx/store';
import {BaseComponentModel} from './base.component.model';
import {
    DATE_FORMATS,
    getElementInnerText,
    hasValues,
    isElementTruncated,
    ResourcesRoutes
} from '../../../app/utils';
import {AbstractControl, FormBuilder, FormGroup} from '@angular/forms';
import {Overlay} from '@angular/cdk/overlay';
import {ApplicationStateService} from '../../services/application-state.service';
import {AppConfigService, TokenService} from '@wf1/core-ui';
import {HttpClient} from '@angular/common/http';
import {MatDialog} from '@angular/material/dialog';
import {MatSnackBar} from '@angular/material/snack-bar';
import {PaginationInstance} from 'ngx-pagination';
import { RootState } from '../../store';
import { ErrorState, LoadState } from '../../store/application/application.state';
import { CONSTANTS } from "../../../app/utils/index";

@Directive()
@Injectable()
export class BaseComponent implements OnInit, OnChanges, AfterViewInit {
    @Input() loadState: LoadState;
    @Input() errorState: ErrorState[];
    @Input() saveErrorState: ErrorState[];
    @Input() severeErrorState?: ErrorState[];
    displayLabel = 'Data';
    showingErrorDialog = false;
    backRoute: ResourcesRoutes = null;
    backRouteQueryParams: any;
    backRouteLabel: string = null;
    summaryString: string = null;
    isConnected = true;
    protected model: BaseComponentModel;
    public viewModel: BaseComponentModel;
    isLoading: boolean;
    componentId = '';
    mobile = this.getIsMobileResolution();

    CONSTANTS = CONSTANTS;



    SAVE_FAIL_TEXT = 'Save failed';
    SAVE_SUCCESS_TEXT = 'Saved Successfully';


    DATE_FORMATS = DATE_FORMATS;


    unsavedChangesMessage = 'Unsaved Changes';

    isUnsaved = false;
    getElementInnerText = getElementInnerText;
    isElementTruncated = isElementTruncated;

    config: PaginationInstance = {
        id: 'Paginator',
        itemsPerPage: 5,
        currentPage: 1,
        totalItems: 0
    };

    public paginatorLabels: any = {
        previousLabel: '',
        nextLabel: '',
    };

    constructor(protected router: Router,
                protected route: ActivatedRoute,
                protected sanitizer: DomSanitizer,
                protected store: Store<RootState>,
                protected fb: FormBuilder,
                protected dialog: MatDialog,
                protected applicationStateService: ApplicationStateService,
                protected tokenService: TokenService,
                protected snackbarService: MatSnackBar,
                protected overlay: Overlay,
                protected cdr: ChangeDetectorRef,
                protected appConfigService: AppConfigService,
                protected http: HttpClient) {
        this.initModels();
    }

    getPagingConfig(): PaginationInstance {
        return this.config;
    }

    initModels() {
      /* empty, for override purposes only */
    }

    loadPage() {
      /* empty, for override purposes only */
    }

    reload() {
      /* empty, for override purposes only */
    }

    ngOnInit() {
        this.loadPage();
    }

    ngAfterViewInit() {
      /* empty */
    }

    ngOnChanges(changes: SimpleChanges) {
        if (changes.loadState && changes.loadState.currentValue) {
            console.log(changes.loadState)
            this.isLoading = changes.loadState.currentValue.isLoading;
            const previousValue = changes.loadState.previousValue;
            if (!this.isLoading && previousValue && previousValue.isLoading) {
                this.invokeAfterLoaded();
            }
        }
        if (changes.errorState) {
            this.errorState = changes.errorState.currentValue as ErrorState[];
            if (this.viewModel.formGroup) {
                this.viewModel.setErrorState(this.errorState);
            }
        }
    }


    invokeAfterLoaded() {
      /* empty, for override purposes only */
    }

    protected updateView(): void {
        this.viewModel = this.model.clone();
    }

    getIsMobileResolution(): boolean {
        return this.applicationStateService.getIsMobileResolution();
    }

    redirectWithOAuth(redirectRoutePath: string) {
        const baseUrl = this.appConfigService.getConfig().application.baseUrl;
        const clientId = this.appConfigService.getConfig().webade.clientId;
        const authorizeUrl = this.appConfigService.getConfig().webade.oauth2Url;
        const authScopes = this.appConfigService.getConfig().webade.authScopes;
        const url = baseUrl;
        window.location.href = url;
    }

    getAsFormGroup(ac: AbstractControl): FormGroup {
        return ac as FormGroup;
    }

    disableSaveForm(form?: FormGroup): boolean {
        const fg = form ? form : this.viewModel.formGroup;
        return !fg.dirty || !fg.valid;
    }

    disableBatchSaveForm(arrayProperty: string, form?: FormGroup): boolean {
        const fg = form ? form : this.viewModel.formGroup;
        //Check form array for dirty flag
        const fgArray: FormGroup[] = fg?.controls[arrayProperty]['controls'];

        const arrayHasDirtyFlag = fgArray.some(contactFg => contactFg.dirty);
        const arrayHasInvalidFlag = fgArray.some(contactFg => !contactFg.valid);

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
        const fg = form ? form : this.viewModel.formGroup;
        if (arrayProperty) {
            this.unsavedBatchForm(arrayProperty);
        } else {
            this.doUnsavedStateUpdateIfNeeded(this.componentId, fg.dirty);
        }
        return fg.dirty;
    }

    unsavedBatchForm(arrayProperty: string): boolean {
        const fg = this.viewModel.formGroup;
        //Check form array for dirty flag
        const fgArray: FormGroup[] = fg?.controls[arrayProperty]['controls'];
        const arrayHasDirtyFlag = fgArray.some(contactFg => contactFg.dirty);
        const hasAddedUnsavedItem = this.hasAddedUnsavedItemNotBlank(fg, arrayProperty);
        //console.log("arrayHasDirtyFlag", arrayHasDirtyFlag, "fgDirty", fg.dirty, "hasAddedUnsavedItem", hasAddedUnsavedItem);
        this.doUnsavedStateUpdateIfNeeded(this.componentId, arrayHasDirtyFlag || fg.dirty || hasAddedUnsavedItem);
        return this.isUnsaved;
    }

    doUnsavedStateUpdateIfNeeded(componentId: string, newUnsavedState: boolean) {
        const prevUnsaved = this.isUnsaved; //save old value for comparison
        //console.log(componentId, "prev", prevUnsaved, "new", newUnsavedState);
        this.isUnsaved = newUnsavedState;
    }

    hasAddedUnsavedItemNotBlank(fgMain: FormGroup, arrayProperty: string) {
        const controls = fgMain?.controls[arrayProperty]['controls'];
        const ret = controls.some(ac => {
                const fg: FormGroup = <FormGroup>ac;
                if (!fg.get('id').value && controls.length > 1) { //not a default empty entry
                    //console.log("not default entry");
                    return true;
                } else if (!fg.get('id').value && controls.length == 1) { //check if empty entry
                    const item = fg.getRawValue();
                    if (!hasValues(item)) {
                        return false;
                    } else {
                        return true;
                    }
                } else {
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
