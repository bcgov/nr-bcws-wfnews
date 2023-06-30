import { DragDropModule } from '@angular/cdk/drag-drop';
import { ScrollingModule } from '@angular/cdk/scrolling';
import { CdkTableModule } from '@angular/cdk/table';
import { APP_BASE_HREF, CommonModule } from '@angular/common';
import { HttpClient, HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';
import { APP_INITIALIZER, Injector, NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatLegacyButtonModule as MatButtonModule } from '@angular/material/legacy-button';
import { MatLegacyDialogModule as MatDialogModule } from '@angular/material/legacy-dialog';
import { MatDividerModule } from '@angular/material/divider';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatLegacyFormFieldModule as MatFormFieldModule } from '@angular/material/legacy-form-field';
import { MatGridListModule } from '@angular/material/grid-list';
import { MatIconModule } from '@angular/material/icon';
import { MatLegacyInputModule as MatInputModule } from '@angular/material/legacy-input';
import { MatLegacyListModule as MatListModule } from '@angular/material/legacy-list';
import { MatLegacyMenuModule as MatMenuModule } from '@angular/material/legacy-menu';
import { MatLegacyRadioModule as MatRadioModule } from '@angular/material/legacy-radio';
import { MatLegacySelectModule as MatSelectModule } from '@angular/material/legacy-select';
import { MatLegacySlideToggleModule as MatSlideToggleModule } from '@angular/material/legacy-slide-toggle';
import { MatLegacySnackBarModule as MatSnackBarModule } from '@angular/material/legacy-snack-bar';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatLegacyTooltipModule as MatTooltipModule } from '@angular/material/legacy-tooltip';
import { MatLegacyChipsModule as MatChipsModule } from '@angular/material/legacy-chips';
import { MatLegacyAutocompleteModule as MatAutocompleteModule } from '@angular/material/legacy-autocomplete';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { RouteReuseStrategy } from '@angular/router';
import { ServiceWorkerModule } from '@angular/service-worker';
import { OwlNativeDateTimeModule } from '@busacca/ng-pick-datetime';
import { EffectsModule } from '@ngrx/effects';
import { FullRouterStateSerializer, StoreRouterConnectingModule } from '@ngrx/router-store';
import { StoreModule } from '@ngrx/store';
import { StoreDevtoolsModule } from '@ngrx/store-devtools';
import { AppConfigService, CoreUIModule, TokenService } from '@wf1/core-ui';
import { ApiModule as IncidentsApiModule, Configuration as IncidentsConfiguration } from '@wf1/incidents-rest-api';
import { ApiModule as OrgUnitApiModule, OrgUnitConfiguration } from '@wf1/orgunit-rest-api';
import { WildfireApplicationModule } from '@wf1/wfcc-application-ui';
import { Configuration as DocumentAPIServiceConfiguration } from '@wf1/wfdm-document-management-api';
import { OwlDateTimeModule, OWL_DATE_TIME_FORMATS } from 'ng-pick-datetime';
import { OwlMomentDateTimeModule } from 'ng-pick-datetime-moment';
import { environment } from '../environments/environment';
import { codeTableAndUserPrefFnInit } from './app-initializer';
import { AppComponent } from './app.component';
import { ROUTING } from './app.routing';
import { ActiveWildfireMapComponent } from './components/active-wildfire-map/active-wildfire-map.component';
import { PanelEvacuationOrdersAndAlertsComponent } from './components/panel-evacuation-orders-and-alerts/panel-evacuation-orders-and-alerts.component';
import { PanelWildfireStageOfControlComponentDesktop } from './components/panel-wildfire-stage-of-control/panel-wildfire-stage-of-control.component.desktop';
import { WFMapContainerComponent } from './components/wf-map-container/wf-map-container.component';
import { MapConfigService } from './services/map-config.service';
import { UpdateService } from './services/update.service';
import { WFMapService } from './services/wf-map.service';
import { CustomReuseStrategy } from './shared/route/custom-route-reuse-strategy';
import { initialRootState, rootEffects, rootReducers } from './store';
import { provideBootstrapEffects } from './utils';
import { MatLegacyTableModule as MatTableModule} from "@angular/material/legacy-table";
import { SingleSelectDirective } from './directives/singleselect.directive';
import { MatLegacyPaginatorModule as MatPaginatorModule } from '@angular/material/legacy-paginator';
import { NgxPaginationModule } from 'ngx-pagination';
import { WfAdminPanelComponentDesktop } from './components/wf-admin-panel/wf-admin-panel.component.desktop';
import { AdminContainerDesktop } from './containers/admin/admin-container.component.desktop';
import { WfnewsInterceptor } from './interceptors/wfnews-interceptor';
import { IncidentDetailsPanel } from './components/admin-incident-form/incident-details-panel/incident-details-panel.component';
import { MatLegacyProgressSpinnerModule as MatProgressSpinnerModule } from '@angular/material/legacy-progress-spinner';
import { MatSortModule } from '@angular/material/sort';
import { MatLegacyCardModule as MatCardModule } from '@angular/material/legacy-card';
import { ResponseDetailsPanel } from './components/admin-incident-form/response-details-panel/response-details-panel.component';
import { MatLegacyCheckboxModule as MatCheckboxModule } from '@angular/material/legacy-checkbox';
import { ContactsDetailsPanel } from './components/admin-incident-form/contacts-details-panel/contacts-details-panel.component';
import { EvacOrdersDetailsPanel } from './components/admin-incident-form/evac-orders-details-panel/evac-orders-details-panel.component';
import { AreaRestrictionsDetailsPanel } from './components/admin-incident-form/area-restrictions-details-panel/area-restrictions-details-panel.component';
import { AdminIncidentFormDesktop } from './components/admin-incident-form/admin-incident-form.component.desktop';
import { IncidentContainerDesktop } from './containers/incident/incident-container.component.desktop';
import { CKEditorModule } from '@ckeditor/ckeditor5-angular';
import { MatLegacyTabsModule as MatTabsModule } from '@angular/material/legacy-tabs';
import { AGOLService } from './services/AGOL-service';
import { PanelBansAndProhibitionsComponent } from './components/panel-bans-prohibitions/panel-bans-prohibitions.component';
import { PanelSmokeForecastComponent } from './components/panel-smoke-forecast/panel-smoke-forecast.component';
import { PanelAreaRestrictionsComponent } from './components/panel-area-restrictions/panel-area-restrictions.component';
import { PanelFireDangerComponent } from './components/panel-fire-danger/panel-fire-danger.component';
import { CommonUtilityService } from "./services/common-utility.service";
import { MapsPanel } from './components/admin-incident-form/maps-panel/maps-panel.component';
import { MessageDialogComponent } from './components/message-dialog/message-dialog.component';
import { EditMapDialogComponent } from './components/admin-incident-form/maps-panel/edit-map-dialog/edit-map-dialog.component';
import { UploadMapDialogComponent } from './components/admin-incident-form/maps-panel/upload-map-dialog/upload-map-dialog.component';
import { DocumentManagementService } from './services/document-management.service';
import { SignOutPageComponent } from './components/sign-out-page/sign-out-page.component';
import { ImageGalleryPanel } from './components/admin-incident-form/image-gallery-panel/image-gallery-panel.component';
import { EditImageDialogComponent } from './components/admin-incident-form/image-gallery-panel/edit-image-dialog/edit-image-dialog.component';
import { UploadImageDialogComponent } from './components/admin-incident-form/image-gallery-panel/upload-image-dialog/upload-image-dialog.component';
import { ImageCardPanel } from './components/admin-incident-form/image-gallery-panel/image-card-component/image-card-panel.component';
import { WildfirewResourcesComponent } from './components/wildfire-resources/wf-resources.component';
import { ResourcePanelComponent } from './components/wildfire-resources/resource-panel/resource-panel.component';
import { WFStatsComponent } from './components/wf-stats-component/wf-stats.component';
import { NgxChartsModule } from "@swimlane/ngx-charts";
import { LightgalleryModule } from 'lightgallery/angular/13';
import { PointIdService } from "./services/point-id.service";
import { WeatherPanelComponent } from './components/weather-panel/weather-panel.component';
import { PanelRoadConditionsComponent } from './components/panel-road-conditions/panel-road-conditions.component';
import { ErrorPageComponent } from './components/error-page/error-page.component';
import { WildFiresListComponentDesktop } from './components/wildfires-list/wildfires-list.component.desktop';
import { WildfiresListContainerDesktop } from './containers/wildfiresList/wildfiresList-container.component.desktop';
import { PublishedIncidentService } from './services/published-incident-service';
import { IncidentIdentifyPanelComponent } from './components/incident-identify-panel/incident-identify-panel.component';
import { StickyWidgetComponent } from './components/sticky-widget/sticky-widget.component';
import { ContactWidgetDialogComponent } from './components/sticky-widget/contact-widget-dialog/contact-widget-dialog.component';
import { PanelLocalAuthorityComponent } from './components/panel-local-authority/panel-local-authority.component';
import { PanelWildfireStageOfControlContainerDesktop } from './containers/panelWildfireStageOfControl/panelWildfireStageOfControl-container.component.desktop';
import { MatLegacyProgressBarModule as MatProgressBarModule } from '@angular/material/legacy-progress-bar';
import { PublicIncidentPage } from './components/public-incident-page/public-incident-page.component';
import { IncidentGalleryPanel } from './components/public-incident-page/incident-gallery-panel/incident-gallery-panel.component';
import { IncidentHeaderPanel } from './components/public-incident-page/incident-info-header/incident-header-panel.component';
import { IncidentInfoPanel } from './components/public-incident-page/incident-info-panel/incident-info-panel.component';
import { IncidentMapsPanel } from './components/public-incident-page/incident-maps-panel/incident-maps-panel.component';
import { IncidentOverviewPanel } from './components/public-incident-page/incident-overview-panel/incident-overview-panel.component';
import { LocalStorageService } from './services/local-storage-service';
import { WatchlistService } from './services/watchlist-service';
import { CurrentAlertComponentComponent } from './components/current-alert-component/current-alert-component.component';
import { WildfiresListHeaderComponent } from './components/wildfires-list-header/wildfires-list-header.component';
import { SafePipe } from './pipes/safe.pipe';
import { VideoGalleryPanel } from './components/admin-incident-form/video-gallery-panel/video-gallery-panel.component';
import { VideoCardPanel } from './components/admin-incident-form/video-gallery-panel/video-card-component/video-card-panel.component';
import { EditVideoDialogComponent } from './components/admin-incident-form/video-gallery-panel/edit-video-dialog/edit-video-dialog.component';
import { UploadVideoDialogComponent } from './components/admin-incident-form/video-gallery-panel/upload-video-dialog/upload-video-dialog.component';
import { YouTubePlayerModule } from "@angular/youtube-player"
import { PublishDialogComponent } from './components/admin-incident-form/publish-dialog/publish-dialog.component';
import { SummaryPanel } from './components/admin-incident-form/summary-panel/summary-panel.component';
import { DisclaimerDialogComponent } from './components/disclaimer-dialog/disclaimer-dialog.component';
import { IncidentInfoPanelMobileComponent } from './components/public-incident-page/incident-info-panel-mobile/incident-info-panel-mobile.component';
import { ContactUsDialogComponent } from './components/admin-incident-form/contact-us-dialog/contact-us-dialog.component';
import { IncidentOverviewPanelMobileComponent } from './components/public-incident-page/incident-overview-panel-mobile/incident-overview-panel-mobile.component';
import { IncidentMapsPanelMobileComponent } from './components/public-incident-page/incident-maps-panel-mobile/incident-maps-panel-mobile.component';
import { ScrollToTopComponent } from './components/common/scroll-to-top-button/scroll-to-top.component';
import { AlertBannerComponent } from './components/common/alert-order-banner/alert-order-banner.component';

// Copied from im-external.module  TODO: consolidate in one place
export const DATE_FORMATS = {
    fullPickerInput: 'YYYY-MM-DD HH:mm:ss',
    datePickerInput: 'YYYY-MM-DD',
    timePickerInput: 'HH:mm:ss',
    monthYearLabel: 'YYYY-MM',
    dateA11yLabel: 'YYYY-MMM-DD',
    monthYearA11yLabel: 'YYYY-MMM',
};

@NgModule({
    declarations: [
        AppComponent,
        WFMapContainerComponent,
        ActiveWildfireMapComponent,
        PanelWildfireStageOfControlComponentDesktop,
        PanelEvacuationOrdersAndAlertsComponent,
        PanelBansAndProhibitionsComponent,
        PanelSmokeForecastComponent,
        PanelAreaRestrictionsComponent,
        PanelFireDangerComponent,
        WfAdminPanelComponentDesktop,
        SingleSelectDirective,
        AdminContainerDesktop,
        AdminIncidentFormDesktop,
        IncidentDetailsPanel,
        ResponseDetailsPanel,
        ContactsDetailsPanel,
        EvacOrdersDetailsPanel,
        AreaRestrictionsDetailsPanel,
        IncidentContainerDesktop,
        MapsPanel,
        MessageDialogComponent,
        EditMapDialogComponent,
        UploadMapDialogComponent,
        SignOutPageComponent,
        ImageGalleryPanel,
        EditImageDialogComponent,
        UploadImageDialogComponent,
        StickyWidgetComponent,
        ContactWidgetDialogComponent,
        PublishDialogComponent,
        ImageCardPanel,
        WFStatsComponent,
        WeatherPanelComponent,
        WildfirewResourcesComponent,
        ResourcePanelComponent,
        PanelRoadConditionsComponent,
        ErrorPageComponent,
        WildFiresListComponentDesktop,
        WildfiresListContainerDesktop,
        IncidentIdentifyPanelComponent,
        PanelLocalAuthorityComponent,
        PanelWildfireStageOfControlContainerDesktop,
        PublicIncidentPage,
        IncidentGalleryPanel,
        IncidentHeaderPanel,
        IncidentInfoPanel,
        IncidentMapsPanel,
        IncidentOverviewPanel,
        SummaryPanel,
        CurrentAlertComponentComponent,
        WildfiresListHeaderComponent,
        SafePipe,
        VideoGalleryPanel,
        VideoCardPanel,
        EditVideoDialogComponent,
        UploadVideoDialogComponent,
        DisclaimerDialogComponent,
        IncidentInfoPanelMobileComponent,
        IncidentOverviewPanelMobileComponent,
        IncidentMapsPanelMobileComponent,
        ContactUsDialogComponent,
        ScrollToTopComponent,
        AlertBannerComponent
    ],
    imports: [
        MatSortModule,
        MatProgressSpinnerModule,
        MatProgressBarModule,
        MatTableModule,
        MatSnackBarModule,
        HttpClientModule,
        BrowserModule,
        BrowserAnimationsModule,
        CommonModule,
        CdkTableModule,
        DragDropModule,
        FormsModule,
        ReactiveFormsModule,
        ROUTING,
        MatButtonModule,
        MatDialogModule,
        MatDividerModule,
        MatIconModule,
        MatListModule,
        MatMenuModule,
        MatRadioModule,
        MatInputModule,
        MatCheckboxModule,
        MatFormFieldModule,
        MatExpansionModule,
        MatSelectModule,
        MatGridListModule,
        MatCardModule,
        MatChipsModule,
        MatTableModule,
        MatTabsModule,
        MatProgressSpinnerModule,
        OwlDateTimeModule,
        OwlNativeDateTimeModule,
        OwlMomentDateTimeModule,
        CKEditorModule,
        CoreUIModule.forRoot({ configurationPath: environment.app_config_location }),
        IncidentsApiModule,
        OrgUnitApiModule,
        MatTooltipModule,
        MatAutocompleteModule,
        LightgalleryModule,
        StoreModule.forRoot(rootReducers, {
            initialState: initialRootState,
            // metaReducers: metaReducers,
            runtimeChecks: {
                strictStateImmutability: false,
                strictActionImmutability: false,
            }
        }),
        StoreRouterConnectingModule.forRoot({ serializer: FullRouterStateSerializer, stateKey: 'router' }),
        StoreDevtoolsModule.instrument({
            maxAge: 25,
            logOnly: environment.production, // Restrict extension to log-only mode
        }),
        EffectsModule.forRoot([]),
        ServiceWorkerModule.register('wfnews-service-worker.js', { enabled: environment.production, scope: './' }),
        ScrollingModule,
        WildfireApplicationModule.forRoot(),
        MatToolbarModule,
        MatSlideToggleModule,
        MatExpansionModule,
        MatPaginatorModule,
        NgxPaginationModule,
        NgxChartsModule,
        YouTubePlayerModule
    ],
    providers: [
        // Added provideBootstrapEffects function to handle the ngrx issue that loads effects before APP_INITIALIZER
        // providers have finished initializing.
        // See https://github.com/ngrx/platform/issues/931 for more information.
        provideBootstrapEffects(rootEffects),
        {
            provide: APP_BASE_HREF,
            useValue: environment.app_base
        },
        {
            provide: RouteReuseStrategy,
            useClass: CustomReuseStrategy
        },
        AGOLService,
        TokenService,
        UpdateService,
        {
            provide: APP_INITIALIZER,
            useFactory: codeTableAndUserPrefFnInit,
            multi: true,
            deps: [AppConfigService, HttpClient, Injector]
        },

        {
            provide: IncidentsConfiguration,
            useFactory(appConfig: AppConfigService) {
                return new IncidentsConfiguration({ basePath: appConfig.getConfig().rest.incidents });
            },
            multi: false,
            deps: [AppConfigService]
        },
        {
            provide: OrgUnitConfiguration,
            useFactory(appConfig: AppConfigService) {
                return new OrgUnitConfiguration({ basePath: appConfig.getConfig().rest.orgunit });
            },
            multi: false,
            deps: [AppConfigService]
        },
        {
            provide: DocumentAPIServiceConfiguration,
            useFactory(appConfig: AppConfigService) {
                return new DocumentAPIServiceConfiguration({ basePath: appConfig.getConfig().rest.wfdm });
            },
            multi: false,
            deps: [AppConfigService]
        },
        {
            provide: OWL_DATE_TIME_FORMATS,
            useValue: DATE_FORMATS
        },
        {
            provide: HTTP_INTERCEPTORS,
            useClass: WfnewsInterceptor,
            multi: true
        },
        WFMapService,
        MapConfigService,
        CommonUtilityService,
        DocumentManagementService,
        PublishedIncidentService,
        LocalStorageService,
        WatchlistService,
        PointIdService,
    ],
    bootstrap: [
        AppComponent
    ]
})

export class AppModule { }

