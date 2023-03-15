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
import { CommonUtilityService } from '../../services/common-utility.service';
import { WatchlistService } from '../../services/watchlist-service';

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

    public simplePaginatorLabels: any = {
        previousLabel: 'Back',
        nextLabel: 'Next',
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
                protected http: HttpClient,
                protected watchlistService: WatchlistService,
                protected commonUtilityService?: CommonUtilityService) {
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
        this.doUnsavedStateUpdateIfNeeded(this.componentId, arrayHasDirtyFlag || fg.dirty || hasAddedUnsavedItem);
        return this.isUnsaved;
    }

    doUnsavedStateUpdateIfNeeded(componentId: string, newUnsavedState: boolean) {
        this.isUnsaved = newUnsavedState;
    }

    hasAddedUnsavedItemNotBlank(fgMain: FormGroup, arrayProperty: string) {
        const controls = fgMain?.controls[arrayProperty]['controls'];
        const ret = controls.some(ac => {
                const fg: FormGroup = <FormGroup>ac;
                if (!fg.get('id').value && controls.length > 1) { //not a default empty entry
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
