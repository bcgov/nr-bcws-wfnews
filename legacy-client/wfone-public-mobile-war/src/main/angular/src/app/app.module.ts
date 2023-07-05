import { NgxMaskModule } from "ngx-mask";
import { DragDropModule } from "@angular/cdk/drag-drop";
import { ScrollingModule } from "@angular/cdk/scrolling";
import { HttpClient } from "@angular/common/http";
import { APP_INITIALIZER, NgModule } from "@angular/core";
import { FormsModule, ReactiveFormsModule } from "@angular/forms";
import {
    MatAutocompleteModule,
    MatBadgeModule,
    MatButtonModule,
    MatButtonToggleModule,
    MatCardModule,
    MatCheckboxModule,
    MatDialogModule,
    MatExpansionModule,
    MatFormFieldModule,
    MatGridListModule,
    MatIcon,
    MatIconModule,
    MatInputModule,
    MatListModule,
    MatMenuModule,
    MatPaginatorModule,
    MatProgressSpinnerModule,
    MatRadioModule,
    MatSelectModule,
    MatSidenavModule,
    MatSnackBarModule,
    MatSortModule,
    MatTableModule,
    MatTabsModule,
    MatToolbarModule,
    MatTooltipModule
} from "@angular/material";
import { MatSlideToggleModule } from "@angular/material/slide-toggle";
import { MatSliderModule } from '@angular/material/slider';
import { MatSnackBar } from "@angular/material/snack-bar";
import { BrowserModule } from "@angular/platform-browser";
import { BrowserAnimationsModule } from "@angular/platform-browser/animations";
import { NavigationEnd, Router, RouteReuseStrategy } from "@angular/router";
import { ServiceWorkerModule } from "@angular/service-worker";
import { FontAwesomeModule } from "@fortawesome/angular-fontawesome";
import { EffectsModule } from "@ngrx/effects";
import { StoreRouterConnectingModule } from "@ngrx/router-store";
import { StoreModule } from "@ngrx/store";
import { StoreDevtoolsModule } from "@ngrx/store-devtools";
import { NgxChartsModule } from "@swimlane/ngx-charts";
import { CoreUIModule, PublicApplicationHeaderModule } from "@wf1/core-ui";
import { MomentModule } from "ngx-moment";
import { environment } from "../environments/environment";
import { AppRoutingModule } from "./app-routing.module";
import { AdvisoriesComponent } from "./components/advisories/advisories.component";
import { BansAndProhibitionsDetailComponent } from "./components/bans-and-prohibitions-detail/bans-and-prohibitions-detail.component";
import { BansAndProhibitionsComponent } from "./components/bans-and-prohibitions/bans-and-prohibitions.component";
import { BaseDialogComponent } from "./components/base-dialog/base-dialog.component";
import { BaseWrapperComponent } from "./components/base-wrapper/base-wrapper.component";
import { CurrentStatsComponent } from "./components/current-stats/current-stats.component";
import { DisclaimerContentComponent } from "./components/disclaimer-content/disclaimer-content.component";
import { DisclaimerDialogComponent } from "./components/disclaimer-dialog/disclaimer-dialog.component";
import { DisclaimerComponent } from "./components/disclaimer/disclaimer.component";
import { ErrorPanelComponent } from "./components/error-panel/error-panel.component";
import { FeedbackComponent } from "./components/feedback/feedback.component";
import { HelpContentComponent } from "./components/help-content/help-content.component";
import { HelpComponent } from "./components/help/help.component";
import { LandingPageComponent } from "./components/landing-page/landing-page.component";
import { LatestNewsDetailComponent } from './components/latest-news-detail/latest-news-detail.component';
import { LatestNewsComponent } from "./components/latest-news/latest-news.component";
import { NearMeAreaRestrictionsComponent } from "./components/near-me-area-restrictions/near-me-area-restrictions.component";
import { NearMeBansAndProhibitionsComponent } from "./components/near-me-bans-and-prohibitions/near-me-bans-and-prohibitions.component";
import { NearMeEvacuationOrdersComponent } from "./components/near-me-evacuation-orders/near-me-evacuation-orders.component";
import { NearMeFireComponent } from "./components/near-me-fire/near-me-fire.component";
import { NearMeItemComponent, NearMeItemWrapper } from "./components/near-me-item/near-me-item.component";
import { NearMeComponent } from "./components/near-me/near-me.component";
import { NotificationDetailComponent } from './components/notification-detail/notification-detail.component';
import { NotificationsComponent } from './components/notifications/notifications.component';
import { ReportOfFireComponent } from "./components/report-of-fire/report-of-fire.component";
import { WeatherDetailComponent } from "./components/weather-detail/weather-detail.component";
import { AdvisoriesContainer } from "./containers/advisories/advisories-container.component";
import { AppComponent } from "./containers/application-root/app.component";
// tslint:disable-next-line:max-line-length
import { BansAndProhibitionsDetailContainer } from "./containers/bans-and-prohibitions-detail/bans-and-prohibitions-detail-container.component";
import { BansAndProhibitionsContainer } from "./containers/bans-and-prohibitions/bans-and-prohibitions-container.component";
import { CurrentStatsContainer } from "./containers/current-stats/current-stats-container.component";
import { DisclaimerContainer } from "./containers/disclaimer/disclaimer-container.component";
import { FeedbackContainer } from "./containers/feedback/feedback-container.component";
import { HelpContentContainer } from "./containers/help-content/help-content-container.component";
import { HelpContainer } from "./containers/help/help-container.component";
import { LandingPageContainer } from "./containers/landing/landing-page-container.component";
import { LatestNewsDetailContainer } from './containers/latest-news-detail/latest-news-detail-container.component';
import { LatestNewsContainer } from "./containers/latest-news/latest-news-container.component";
import { NotificationDetailContainer } from './containers/notification-detail/notification-detail-container.component';
import { NotificationsContainer } from './containers/notifications/notifications-container.component';
import { ReportOfFireContainer } from "./containers/report-of-fire/report-of-fire-container.component";
import { MapModule } from "./modules/map.module";
import { AppConfigService } from "./services/app-config.service";
import { CommonUtilityService } from "./services/common-utility.service";
import { EventEmitterService } from "./services/event-emitter.service";
import { MapConfigService } from "./services/map-config.service";
import { NotificationService } from './services/notification.service';
import { PointIdService } from "./services/point-id.service";
import { UpdateService } from "./services/update.service";
import { WFMapService } from "./services/wf-map.service";
import { initialRootState, rootEffects, rootReducers } from "./store";
import { CONSTANTS, provideBootstrapEffects } from "./utils";
import { CustomReuseStrategy } from "./utils/custom-route-reuse-strategy";
import { HelpDialogComponent } from "./components/help-dialog/help-dialog.component";
import { HelpDocumentService } from "./services/help-document.service";
import { WeatherHistoryComponent } from "./components/weather-history/weather-history.component";
import { IncidentDetailComponent } from "./components/incident-detail-panel/incident-detail.component";
import { GoogleChartsService } from "./services/google-charts.service";
import { WeatherHistoryOptionsDialogComponent } from "./components/weather-history-options-dialog/weather-history-options-dialog.component";
import { MAT_FORM_FIELD_DEFAULT_OPTIONS } from '@angular/material/form-field';
import { WebcamSnapshotModule } from "./components/webcam-snapshot/webcam-snapshot.module";
import { HTTP } from '@ionic-native/http/ngx';
import { WFStatsComponent } from "./components/wf-stats.component.ts/wf-stats.component";
import { WarningDialogComponent } from "./components/warning-dialog/warning-dialog.component";
import { WFSnackbarComponent } from "./utils/wf-snackbar.component";
import { NotificationSnackbarComponent } from "./components/notification-snackbar/notification-snackbar.component";
import { LayerFailureSnackbarComponent } from "./components/layer-failure-snackbar/layer-failure-snackbar.component";

declare const window: any;

let devOnlyImports = [];
if (!environment.production || !environment.restrict_imports) {
    devOnlyImports = [
        StoreDevtoolsModule.instrument({
            maxAge: 10,
        }),
    ];
}

@NgModule({
    declarations: [
        AppComponent,
        BaseDialogComponent,
        ErrorPanelComponent,
        BaseWrapperComponent,
        LandingPageContainer,
        LandingPageComponent,
        NearMeComponent,
        ReportOfFireContainer,
        ReportOfFireComponent,
        FeedbackContainer,
        FeedbackComponent,
        LatestNewsContainer,
        LatestNewsComponent,
        HelpContainer,
        HelpComponent,
        BansAndProhibitionsContainer,
        BansAndProhibitionsComponent,
        AdvisoriesContainer,
        AdvisoriesComponent,
        DisclaimerContainer,
        DisclaimerComponent,
        DisclaimerContentComponent,
        CurrentStatsContainer,
        CurrentStatsComponent,
        BansAndProhibitionsDetailContainer,
        BansAndProhibitionsDetailComponent,
        HelpContentContainer,
        HelpContentComponent,
        DisclaimerDialogComponent,
        NotificationsComponent,
        NotificationsContainer,
        NotificationDetailComponent,
        NotificationDetailContainer,
        LatestNewsDetailComponent,
        LatestNewsDetailContainer,
        NearMeItemWrapper,
        NearMeBansAndProhibitionsComponent,
        NearMeFireComponent,
        NearMeAreaRestrictionsComponent,
        NearMeEvacuationOrdersComponent,
        WeatherDetailComponent,
        NearMeComponent,
        NearMeItemComponent,
        HelpDialogComponent,
        WeatherHistoryComponent,
        WeatherHistoryOptionsDialogComponent,
        WFStatsComponent,
        IncidentDetailComponent,
        WarningDialogComponent,
        WFSnackbarComponent,
        NotificationSnackbarComponent,
        LayerFailureSnackbarComponent
    ],
    imports: [
        DragDropModule,
        BrowserModule,
        WebcamSnapshotModule,
        FontAwesomeModule,
        FormsModule,
        BrowserAnimationsModule,
        MatExpansionModule,
        MatBadgeModule,
        MatGridListModule,
        MatAutocompleteModule,
        MatButtonModule,
        MatCardModule,
        MatCheckboxModule,
        MatDialogModule,
        MatFormFieldModule,
        MatIconModule,
        MatInputModule,
        MatListModule,
        MatMenuModule,
        MatRadioModule,
        MatSelectModule,
        MatSnackBarModule,
        MatSortModule,
        MatTabsModule,
        MatTableModule,
        MatPaginatorModule,
        MatTooltipModule,
        MatSnackBarModule,
        MatSidenavModule,
        MatToolbarModule,
        MatButtonToggleModule,
        MatSlideToggleModule,
        MatProgressSpinnerModule,
        ReactiveFormsModule,
        ScrollingModule,
        PublicApplicationHeaderModule,
        CoreUIModule.forRoot({ configurationPath: environment.app_config_location }),
        StoreModule.forRoot(rootReducers, { initialState: initialRootState }),
        AppRoutingModule,
        NgxChartsModule,
        // Connects RouterModule with StoreModule
        StoreRouterConnectingModule.forRoot(),
        EffectsModule.forRoot([]),
        ServiceWorkerModule.register("ngsw-worker.js", { enabled: environment.production, scope: "./" }),
        MapModule,
        ...devOnlyImports,
        MomentModule,
        MatSliderModule,
        NgxMaskModule.forRoot(),
    ],
    providers: [
        {
            provide: AppConfigService,
            useClass: AppConfigService,
            deps: [HttpClient]
        },
        { provide: MAT_FORM_FIELD_DEFAULT_OPTIONS, useValue: { appearance: 'fill' } },

        // Added provideBootstrapEffects function to handle the ngrx issue that loads effects before APP_INITIALIZER
        // providers have finished initializing.
        // See https://github.com/ngrx/platform/issues/931 for more information.
        provideBootstrapEffects(rootEffects),
        CommonUtilityService,
        PointIdService,
        WFMapService,
        UpdateService,
        EventEmitterService,
        NotificationService,
        MapConfigService,
        { provide: RouteReuseStrategy, useClass: CustomReuseStrategy },
        HelpDocumentService,
        GoogleChartsService,
        HTTP
    ],
    entryComponents: [
        NearMeComponent,
        NearMeItemComponent,
        BaseDialogComponent,
        DisclaimerDialogComponent,
        NearMeBansAndProhibitionsComponent,
        NearMeFireComponent,
        NearMeAreaRestrictionsComponent,
        NearMeEvacuationOrdersComponent,
        WeatherDetailComponent,
        MatIcon,
        HelpDialogComponent,
        WeatherHistoryComponent,
        WeatherHistoryOptionsDialogComponent,
        IncidentDetailComponent,
        WarningDialogComponent,
        WFSnackbarComponent,
        NotificationSnackbarComponent,
        LayerFailureSnackbarComponent
    ],
    bootstrap: [AppComponent]
})
export class AppModule {

    constructor(
        router: Router,
        snackbarService: MatSnackBar,
    ) {
        if (!navigator.onLine) {
            console.log(CONSTANTS.NO_CONNECTIVITY_MESSAGE);
            snackbarService.open(CONSTANTS.NO_CONNECTIVITY_MESSAGE, '', { duration: 0, panelClass: 'full-snack-bar-offline' });
        }
        router.events.subscribe(val => {
            if (val instanceof NavigationEnd) {
                window.snowplow('trackPageView', val.url);
            }
        });

    }

}
