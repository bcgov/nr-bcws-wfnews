import { FocusTrapFactory, FocusMonitor } from '@angular/cdk/a11y';
import {
    AfterViewInit,
    ChangeDetectorRef,
    ComponentFactoryResolver,
    Injectable,
    Input,
    OnChanges,
    OnInit,
    SimpleChanges,
    Injector
} from "@angular/core";
import {ActivatedRoute, Router} from "@angular/router";
import {DomSanitizer} from "@angular/platform-browser";
import {Store, Action} from "@ngrx/store";
import {RootState} from "../../store";
import {BaseComponentModel} from "./base.component.model";
import {ICONS} from "../../utils/icons";
import {FormBuilder} from "@angular/forms";
import {ErrorMessages} from "../../utils/error-messages";
import {MatDialog, MatSnackBar} from "@angular/material";
import {ERROR_TYPE, ErrorState, LoadState} from "../../store/application/application.state";
import {ConnectionService} from "ng-connection-service";
import {ActionItem} from "../base-wrapper/base-wrapper.component";
import {Overlay} from "@angular/cdk/overlay";
import {CONSTANTS, WFOnePublicMobileRoutes} from "../../utils";
import {AppConfigService} from "../../services/app-config.service";
import {ApplicationStateService} from "src/app/services/application-state.service";
import {CommonUtilityService} from "../../services/common-utility.service";
import {PointIdService} from "../../services/point-id.service";
import {CapacitorService} from "../../services/capacitor-service";
import {clearNearMeHighlight} from "../../store/application/application.actions";
import {DisclaimerDialogComponent} from "../disclaimer-dialog/disclaimer-dialog.component";
import {DATE_FORMATS, SpatialUtilsService} from "@wf1/core-ui";
import { EventEmitterService } from "src/app/services/event-emitter.service";
import { NotificationService } from 'src/app/services/notification.service';
import { Actions } from '@ngrx/effects';
import { HttpClient } from '@angular/common/http';

@Injectable()
export class BaseComponent implements OnInit, OnChanges, AfterViewInit {
    @Input() loadState: LoadState;
    @Input() errorState: ErrorState[];
    @Input() saveErrorState: ErrorState[];
    @Input() severeErrorState?: ErrorState[];
    showingErrorDialog = false;
    title: string = null;
    backRoute: WFOnePublicMobileRoutes = null;
    backRouteQueryParams: any;
    backRouteLabel: string = null;
    summaryString: string = null;
    actionItems: ActionItem[] = null;
    ERROR_MESSAGES = ErrorMessages;
    isLocalSaving = false;
    isConnected = true;
    protected model: BaseComponentModel;
    public viewModel: BaseComponentModel;
    isLoading: boolean;
    isConnectionSnackbarShowing = false;
    SMK;
    exitBlocked = true;

    SAVE_FAIL_TEXT = 'Save failed';
    SAVE_SUCCESS_TEXT = 'Saved Successfully';

    DATE_FORMATS = DATE_FORMATS;
    CONSTANTS = CONSTANTS;
    ICONS = ICONS;

    elevation = "mat-elevation-z2";

    constructor(
        protected router: Router,
        protected route: ActivatedRoute,
        protected sanitizer: DomSanitizer,
        protected store: Store<RootState>,
        protected fb: FormBuilder,
        protected commonUtilityService: CommonUtilityService,
        protected dialog: MatDialog,
        protected connectionService: ConnectionService,
        protected snackbarService: MatSnackBar,
        protected overlay: Overlay,
        protected cdr: ChangeDetectorRef,
        protected appConfigService: AppConfigService,
        protected applicationStateService: ApplicationStateService,
        protected componentFactoryResolver: ComponentFactoryResolver,
        protected pointIdService: PointIdService,
        protected capacitorService: CapacitorService,
        protected eventEmitterService: EventEmitterService,
        protected notificationService: NotificationService,
        protected focusTrap: FocusTrapFactory,
        protected focusMonitor: FocusMonitor,
        protected spatialUtilService: SpatialUtilsService,
        protected actions: Actions,
        protected injector: Injector,
        protected httpClient: HttpClient
    ) {
        this.initComponent();
        this.initModels();
        this.initializeConnectionService();
        this.SMK = window['SMK'];
        //this.openDisclaimerDialog();

        this.eventEmitterService.invokeGoBackRoute.subscribe(() => {
            if ( !this.isHandlerForUrl( this.applicationStateService.getCurrentUrl() ) ) return
            this.navigateToBackRoute();
        })
    }

    isHandlerForUrl( url: string ): boolean {
        return false 
    }

    initComponent() {}

    navigateToBackRoute() {
        this.store.dispatch(clearNearMeHighlight());
        if (this.backRouteQueryParams) {
            this.router.navigate([this.backRoute], {queryParams: this.backRouteQueryParams});
        } else {
            this.router.navigate([this.backRoute]);
        }

    }

    // @HostListener('document:backbutton', ['$event'])
    // onBackButtonPress(event) {
    //     event.preventDefault();
        
    // }


    initializeConnectionService() {
        /*this.connectionService.monitor().subscribe(isConnected => {
            this.isConnected = isConnected;
            if (!this.isConnected) {
                this.displayNoConnectivityMessage();
                this.isConnectionSnackbarShowing = true;
            } else if(this.snackbarService._openedSnackBarRef
                    && this.snackbarService._openedSnackBarRef.instance
                    && this.snackbarService._openedSnackBarRef.instance.data
                    && this.snackbarService._openedSnackBarRef.instance.data.message
                    && this.snackbarService._openedSnackBarRef.instance.data.message == CONSTANTS.NO_CONNECTIVITY_MESSAGE){
                this.snackbarService._openedSnackBarRef.dismiss();
            }
        });*/
    }

    initModels() {

    }

    loadPage() {
    }

    save() {
    }

    saveOverwrite(etag?: string) {
    }

    ngOnInit() {
      this.loadPage();
    }

    ngAfterViewInit() {
    }

    ngOnChanges(changes: SimpleChanges) {
        if (changes.loadState) {
            this.isLoading = changes.loadState.currentValue.isLoading;
            const previousValue = changes.loadState.previousValue;
            if (!this.isLoading && previousValue && previousValue.isLoading) {
                this.updateView();
                this.invokeAfterLoaded();
            }
        }
        if (changes.severErrorState) {
            this.isLocalSaving = false;
        }
        if (changes.errorState) {
            this.errorState = changes.errorState.currentValue as ErrorState[];
            if (this.viewModel.formGroup) { this.viewModel.setErrorState(this.errorState); }

            const err = this.errorState.find(err => err.type == ERROR_TYPE.VALIDATION);
            if (err) {
                // has a validation error, scroll to top of screen to display error panel
                window.scrollTo(0, 0);
            }


        }

    }


    invokeAfterLoaded() {

    }

    protected updateView(): void {
        this.viewModel = this.model.clone();
    }

    getIcon(icon: string) {
        return ICONS[icon];
    }

    protected convertFromForm() {
        return this.viewModel.formGroup.getRawValue();
    }

    protected displayNoConnectivityMessage() {
        this.snackbarService.open(CONSTANTS.NO_CONNECTIVITY_MESSAGE, '', {duration: 0, panelClass: 'full-snack-bar-offline'});
    }

    protected displayInformationalMessage(text: string) {
        this.snackbarService.open(text, null, {duration: 2500});
    }

    protected disableSave() {
        return this.viewModel.formGroup.pristine || !this.viewModel.formGroup.valid || this.isLocalSaving;
    }

    getIsMobileRes(): boolean {
        return this.applicationStateService.getIsMobileResolution();
    }

    openDisclaimerDialog(){
        if (localStorage.getItem('disclaimerSeen') !== 'true' && sessionStorage.getItem('disclaimerSeenSession') !== 'true') {
            this.dialog.open(DisclaimerDialogComponent, {width: '800px'});
            sessionStorage.setItem('disclaimerSeenSession','true');
        }
    }

}
