import { DragDropModule } from '@angular/cdk/drag-drop';
import { ScrollingModule } from '@angular/cdk/scrolling';
import { CdkTableModule } from '@angular/cdk/table';
import { APP_BASE_HREF, CommonModule } from '@angular/common';
import {
  HTTP_INTERCEPTORS,
  HttpClient,
  HttpClientModule,
} from '@angular/common/http';
import { APP_INITIALIZER, Injector, NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatButtonModule } from '@angular/material/button';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { MatCardModule } from '@angular/material/card';
import { MatCheckboxModule } from '@angular/material/checkbox';
import {
  MAT_DIALOG_DATA,
  MatDialogModule,
  MatDialogRef,
  MatDialogModule as MatMdcDialogModule,
} from '@angular/material/dialog';
import { MatDividerModule } from '@angular/material/divider';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatGridListModule } from '@angular/material/grid-list';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatListModule } from '@angular/material/list';
import { MatMenuModule } from '@angular/material/menu';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatRadioModule } from '@angular/material/radio';
import { MatSelectModule } from '@angular/material/select';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { MatSortModule } from '@angular/material/sort';
import { MatTableModule } from '@angular/material/table';
import { MatTabsModule } from '@angular/material/tabs';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatTooltipModule } from '@angular/material/tooltip';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { RouteReuseStrategy } from '@angular/router';
import { ServiceWorkerModule } from '@angular/service-worker';
import { YouTubePlayerModule } from '@angular/youtube-player';
import { DialogExitComponent } from '@app/components/report-of-fire/dialog-exit/dialog-exit.component';
import { RoFReviewPage } from '@app/components/report-of-fire/review-page/rof-review-page.component';
import { OwlNativeDateTimeModule } from '@busacca/ng-pick-datetime';
import { CKEditorModule } from '@ckeditor/ckeditor5-angular';
import { IonicModule } from '@ionic/angular';
import { IonicStorageModule } from '@ionic/storage-angular';
import { EffectsModule } from '@ngrx/effects';
import {
  FullRouterStateSerializer,
  StoreRouterConnectingModule,
} from '@ngrx/router-store';
import { StoreModule } from '@ngrx/store';
import { StoreDevtoolsModule } from '@ngrx/store-devtools';
import { NgxChartsModule } from '@swimlane/ngx-charts';
import { AppConfigService, CoreUIModule, TokenService } from '@wf1/core-ui';
import {
  ApiModule as IncidentsApiModule,
  Configuration as IncidentsConfiguration,
} from '@wf1/incidents-rest-api';
import {
  ApiModule as OrgUnitApiModule,
  OrgUnitConfiguration,
} from '@wf1/orgunit-rest-api';
import { WildfireApplicationModule } from '@wf1/wfcc-application-ui';
import { Configuration as DocumentAPIServiceConfiguration } from '@wf1/wfdm-document-management-api';
import { LightgalleryModule } from 'lightgallery/angular/13';
import { OWL_DATE_TIME_FORMATS, OwlDateTimeModule } from 'ng-pick-datetime';
import { OwlMomentDateTimeModule } from 'ng-pick-datetime-moment';
import { NgxMaskModule } from 'ngx-mask';
import { NgxPaginationModule } from 'ngx-pagination';
import { environment } from '../environments/environment';
import { codeTableAndUserPrefFnInit } from './app-initializer';
import { AppComponent } from './app.component';
import { ROUTING } from './app.routing';
import { ActiveWildfireMapComponent } from './components/active-wildfire-map/active-wildfire-map.component';
import { AdminIncidentFormDesktop } from './components/admin-incident-form/admin-incident-form.component.desktop';
import { AreaRestrictionsDetailsPanel } from './components/admin-incident-form/area-restrictions-details-panel/area-restrictions-details-panel.component';
import { ContactUsDialogComponent } from './components/admin-incident-form/contact-us-dialog/contact-us-dialog.component';
import { ContactsDetailsPanel } from './components/admin-incident-form/contacts-details-panel/contacts-details-panel.component';
import { EvacOrdersDetailsPanel } from './components/admin-incident-form/evac-orders-details-panel/evac-orders-details-panel.component';
import { EditImageDialogComponent } from './components/admin-incident-form/image-gallery-panel/edit-image-dialog/edit-image-dialog.component';
import { ImageCardPanel } from './components/admin-incident-form/image-gallery-panel/image-card-component/image-card-panel.component';
import { ImageGalleryPanel } from './components/admin-incident-form/image-gallery-panel/image-gallery-panel.component';
import { UploadImageDialogComponent } from './components/admin-incident-form/image-gallery-panel/upload-image-dialog/upload-image-dialog.component';
import { IncidentDetailsPanel } from './components/admin-incident-form/incident-details-panel/incident-details-panel.component';
import { EditMapDialogComponent } from './components/admin-incident-form/maps-panel/edit-map-dialog/edit-map-dialog.component';
import { MapsPanel } from './components/admin-incident-form/maps-panel/maps-panel.component';
import { UploadMapDialogComponent } from './components/admin-incident-form/maps-panel/upload-map-dialog/upload-map-dialog.component';
import { PublishDialogComponent } from './components/admin-incident-form/publish-dialog/publish-dialog.component';
import { ResponseDetailsPanel } from './components/admin-incident-form/response-details-panel/response-details-panel.component';
import { SummaryPanel } from './components/admin-incident-form/summary-panel/summary-panel.component';
import { EditVideoDialogComponent } from './components/admin-incident-form/video-gallery-panel/edit-video-dialog/edit-video-dialog.component';
import { UploadVideoDialogComponent } from './components/admin-incident-form/video-gallery-panel/upload-video-dialog/upload-video-dialog.component';
import { VideoCardPanel } from './components/admin-incident-form/video-gallery-panel/video-card-component/video-card-panel.component';
import { VideoGalleryPanel } from './components/admin-incident-form/video-gallery-panel/video-gallery-panel.component';
import { AlertOrderBannerComponent } from './components/common/alert-order-banner/alert-order-banner.component';
import { CheckboxButtonComponent } from './components/common/checkbox-button/checkbox-button.component';
import { CanDeactivateGuard } from './components/common/guards/unsaved-changes.guard';
import { LinkButtonComponent } from './components/common/link-button/link-button.component';
import { MapToggleButtonComponent } from './components/common/map-toggle-button/map-toggle-button.component';
import { MobileSlidingDrawerComponent } from './components/common/mobile-sliding-drawer/mobile-sliding-drawer.component';
import { ScrollToTopComponent } from './components/common/scroll-to-top-button/scroll-to-top.component';
import { UnsavedChangesDialog } from './components/common/unsaved-changes-dialog/unsaved-changes-dialog.component';
import { Dashboard } from './components/dashboard-component/dashboard.component';
import { ActiveFiresWidget } from './components/dashboard-component/widgets/active-fires-widget/active-fires-widget.component';
import { BansWidget } from './components/dashboard-component/widgets/bans-widget/bans-widget.component';
import { BlogWidget } from './components/dashboard-component/widgets/blog-widget/blog-widget.component';
import { EvacuationsWidget } from './components/dashboard-component/widgets/evacuations-widget/evacuations-widget.component';
import { FireCauseWidget } from './components/dashboard-component/widgets/fire-cause-widget/fire-cause-widget.component';
import { FireCentreStatsWidget } from './components/dashboard-component/widgets/fire-centre-stats-widget/fire-centre-stats-widget.component';
import { FireTotalsWidget } from './components/dashboard-component/widgets/fire-totals-widget/fire-totals-widget.component';
import { FiresOfNoteWidget } from './components/dashboard-component/widgets/fires-of-note-widget/fires-of-note-widget.component';
import { HistoricalComparisonWidget } from './components/dashboard-component/widgets/historical-comparison-widget/historical-comparison-widget.component';
import { OverviewWidget } from './components/dashboard-component/widgets/overview-widget/overview-widget.component';
import { ResourcesWidget } from './components/dashboard-component/widgets/resources-widget/resources-widget.component';
import { SituationWidget } from './components/dashboard-component/widgets/situation-widget/situation-widget.component';
import { SummaryWidget } from './components/dashboard-component/widgets/summary-widget/summary-widget.component';
import { VideosWidget } from './components/dashboard-component/widgets/videos-widget/videos-widget.component';
import { DisclaimerDialogComponent } from './components/disclaimer-dialog/disclaimer-dialog.component';
import { DraggablePanelComponent } from './components/draggable-panel/draggable-panel.component';
import { ErrorPageComponent } from './components/error-page/error-page.component';
import { AreaRestrictionsFullDetailsComponent } from './components/full-details/area-restrictions-full-details/area-restrictions-full-details.component';
import { FullDetailsComponent } from './components/full-details/full-details.component';
import { IncidentIdentifyPanelComponent } from './components/incident-identify-panel/incident-identify-panel.component';
import { MapLayersDataSourceDrawerSectionComponent } from './components/map-layers-datasource-drawer-section/map-layers-datasource-drawer-section.component';
import { MapLayersDrawerSectionComponent } from './components/map-layers-drawer-section/map-layers-drawer-section.component';
import { MapTypePickerComponent } from './components/map-type-picker/map-type-picker.component';
import { MessageDialogComponent } from './components/message-dialog/message-dialog.component';
import { PanelWildfireStageOfControlComponentDesktop } from './components/panel-wildfire-stage-of-control/panel-wildfire-stage-of-control.component.desktop';
import { ImagePanelComponent } from './components/public-incident-page/incident-gallery-panel/image-panel/image-panel.component';
import { IncidentGalleryAllMediaMobileComponent } from './components/public-incident-page/incident-gallery-panel/incident-gallery-all-media-mobile/incident-gallery-all-media-mobile.component';
import { IncidentGalleryImagesMobileComponent } from './components/public-incident-page/incident-gallery-panel/incident-gallery-images-mobile/incident-gallery-images-mobile.component';
import { IncidentGalleryPanelMobileComponent } from './components/public-incident-page/incident-gallery-panel/incident-gallery-panel-mobile/incident-gallery-panel-mobile.component';
import { IncidentGalleryPanel } from './components/public-incident-page/incident-gallery-panel/incident-gallery-panel.component';
import { IncidentGalleryVideosMobileComponent } from './components/public-incident-page/incident-gallery-panel/incident-gallery-videos-mobile/incident-gallery-videos-mobile.component';
import { VideoPanelComponent } from './components/public-incident-page/incident-gallery-panel/video-panel/video-panel.component';
import { IncidentHeaderPanel } from './components/public-incident-page/incident-info-header/incident-header-panel.component';
import { IncidentInfoPanelMobileComponent } from './components/public-incident-page/incident-info-panel-mobile/incident-info-panel-mobile.component';
import { IncidentInfoPanel } from './components/public-incident-page/incident-info-panel/incident-info-panel.component';
import { IncidentMapsPanelMobileComponent } from './components/public-incident-page/incident-maps-panel-mobile/incident-maps-panel-mobile.component';
import { IncidentMapsPanel } from './components/public-incident-page/incident-maps-panel/incident-maps-panel.component';
import { IncidentOverviewPanelMobileComponent } from './components/public-incident-page/incident-overview-panel-mobile/incident-overview-panel-mobile.component';
import { IncidentOverviewPanel } from './components/public-incident-page/incident-overview-panel/incident-overview-panel.component';
import { PublicIncidentPage } from './components/public-incident-page/public-incident-page.component';
import { RoFCommentsPage } from './components/report-of-fire/comment-page/rof-comments-page.component';
import { LocationServicesDialogComponent } from './components/report-of-fire/compass-page/location-services-dialog/location-services-dialog.component';
import { RoFCompassPage } from './components/report-of-fire/compass-page/rof-compass-page.component';
import { RoFComplexQuestionPage } from './components/report-of-fire/complex-question-page/rof-complex-question-page.component';
import { RoFContactPage } from './components/report-of-fire/contact-page/rof-contact-page.component';
import { DialogLocationComponent } from './components/report-of-fire/dialog-location/dialog-location.component';
import { RoFDisclaimerPage } from './components/report-of-fire/disclaimer-page/rof-disclaimer-page.component';
import { RoFLocationPage } from './components/report-of-fire/location-page/rof-location-page.component';
import { RoFPermissionsPage } from './components/report-of-fire/permissions-page/rof-permissions-page.component';
import { RoFPhotoPage } from './components/report-of-fire/photo-page/rof-photo-page.component';
import { ReportOfFirePage } from './components/report-of-fire/report-of-fire.component';
import { RofCallPage } from './components/report-of-fire/rof-callback-page/rof-call-page.component';
import { RoFSimpleQuestionPage } from './components/report-of-fire/simple-question-page/rof-simple-question-page.component';
import { RoFTitlePage } from './components/report-of-fire/title-page/rof-title-page.component';
import { SignOutPageComponent } from './components/sign-out-page/sign-out-page.component';
import { ContactWidgetDialogComponent } from './components/sticky-widget/contact-widget-dialog/contact-widget-dialog.component';
import { StickyWidgetComponent } from './components/sticky-widget/sticky-widget.component';
import { WeatherPanelComponent } from './components/weather/weather-panel/weather-panel.component';
import { AdminEditDashboard } from './components/wf-admin-panel/dashboard-panel/edit-dashboard.component';
import { WfAdminPanelComponentDesktop } from './components/wf-admin-panel/wf-admin-panel.component.desktop';
import { WFMapContainerComponent } from './components/wf-map-container/wf-map-container.component';
import { ResourcePanelComponent } from './components/wildfire-resources/resource-panel/resource-panel.component';
import { WildfirewResourcesComponent } from './components/wildfire-resources/wf-resources.component';
import { AreaRestrictionListComponent } from './components/wildfires-list-header/area-restriction-list/area-restriction-list.component';
import { AreaRestrictionListComponentDesktop } from './components/wildfires-list-header/area-restriction-list/area-restriction-list.component.desktop';
import { AreaRestrictionListComponentMobile } from './components/wildfires-list-header/area-restriction-list/area-restriction-list.component.mobile';
import { BansListComponent } from './components/wildfires-list-header/bans-list/bans-list.component';
import { BansListComponentDesktop } from './components/wildfires-list-header/bans-list/bans-list.component.desktop';
import { BansListComponentMobile } from './components/wildfires-list-header/bans-list/bans-list.component.mobile';
import { EvacListComponent } from './components/wildfires-list-header/evac-list/evac-list.component';
import { EvacListComponentDesktop } from './components/wildfires-list-header/evac-list/evac-list.component.desktop';
import { EvacListComponentMobile } from './components/wildfires-list-header/evac-list/evac-list.component.mobile';
import { FilterByLocationDialogComponent } from './components/wildfires-list-header/filter-by-location/filter-by-location-dialog.component';
import { FilterOptionsDialogComponent } from './components/wildfires-list-header/filter-options-dialog/filter-options-dialog.component';
import { WildfiresListHeaderComponent } from './components/wildfires-list-header/wildfires-list-header.component';
import { WildFiresListComponentDesktop } from './components/wildfires-list-header/wildfires-list/wildfires-list.component.desktop';
import { WildFiresListComponentMobile } from './components/wildfires-list-header/wildfires-list/wildfires-list.component.mobile';
import { AdminContainerDesktop } from './containers/admin/admin-container.component.desktop';
import { IncidentContainerDesktop } from './containers/incident/incident-container.component.desktop';
import { PanelWildfireStageOfControlContainerDesktop } from './containers/panelWildfireStageOfControl/panelWildfireStageOfControl-container.component.desktop';
import { WildfiresListContainerDesktop } from './containers/wildfiresList/wildfiresList-container.component.desktop';
import { SingleSelectDirective } from './directives/singleselect.directive';
import { WfnewsInterceptor } from './interceptors/wfnews-interceptor';
import { SafePipe } from './pipes/safe.pipe';
import { AGOLService } from './services/AGOL-service';
import { CommonUtilityService } from './services/common-utility.service';
import { DocumentManagementService } from './services/document-management.service';
import { LocalStorageService } from './services/local-storage-service';
import { MapConfigService } from './services/map-config.service';
import { PointIdService } from './services/point-id.service';
import { PublishedIncidentService } from './services/published-incident-service';
import { ReportOfFireService } from './services/report-of-fire-service';
import { UpdateService } from './services/update.service';
import { WatchlistService } from './services/watchlist-service';
import { WFMapService } from './services/wf-map.service';
import { CustomReuseStrategy } from './shared/route/custom-route-reuse-strategy';
import { initialRootState, rootEffects, rootReducers } from './store';
import { provideBootstrapEffects } from './utils';
import { SavedComponent } from './components/saved/saved.component';
import { MoreComponent } from './components/more/more.component';
import { BansFullDetailsComponent } from './components/full-details/bans-full-details/bans-full-details.component';
import { DangerRatingFullDetailsComponent } from './components/full-details/danger-rating-full-details/danger-rating-full-details.component';
import { EvacAlertFullDetailsComponent } from './components/full-details/evac-alert-full-details/evac-alert-full-details.component';
import { EvacOtherInfoComponent } from './components/full-details/evac-other-info/evac-other-info.component';
import { MapLegendComponent } from './components/legend-panels/other-layers/map-legend.component';
import { FireLegendComponent } from './components/legend-panels/fires/fire-legend.component';
import { BaseLegendComponent } from './components/legend-panels/base-legend.component';
import { EvacLegendComponent } from './components/legend-panels/evac-layers/evac-legend.component';
import { BansLegendComponent } from './components/legend-panels/bans-layers/bans-legend.component';
import { AreaRestrictionLegendComponent } from './components/legend-panels/area-restriction-layers/area-restriction-legend.component';
import { DangerRatingLegendComponent } from './components/legend-panels/danger-rating-layers/danger-rating-legend.component';
import { SmokeLegendComponent } from './components/legend-panels/smoke-layers/smoke-legend.component';
import { RoadEventLegendComponent } from './components/legend-panels/road-event-layers/road-event-legend.component';
import { LocalAuthoritiesLegendComponent } from './components/legend-panels/local-authorities-layers/local-authorities-legend.component';
import { PrecipRadarLegendComponent } from './components/legend-panels/precip-radar-layers/precip-radar-legend.component';
import { PrecipForecastLegendComponent } from './components/legend-panels/precip-forecast-layers/precip-forecast-legend.component';
import { RecSiteLegendComponent } from './components/legend-panels/rec-site-layers/rec-site-legend.component';
import { ProtectedLandsLegendComponent } from './components/legend-panels/protected-lands-layers/protected-lands-legend.component';
import { SearchPageComponent } from './components/search/search-page.component';
import { AddSavedLocationComponent } from './components/saved/add-saved-location/add-saved-location.component';
import { notificationMapComponent } from '@app/components/saved/add-saved-location/notification-map/notification-map.component';
import { EvacOrderFullDetailsComponent } from './components/full-details/evac-order-full-details/evac-order-full-details.component';
import { MatSliderModule } from '@angular/material/slider';
import { NotificationService } from '@app/services/notification.service';
import { SavedLocationFullDetailsComponent } from './components/saved/saved-location-full-details/saved-location-full-details.component';
import { ConfirmationDialogComponent } from '@app/components/saved/confirmation-dialog/confirmation-dialog.component';
import { WildfireNotificationDialogComponent } from '@app/components/wildfire-notification-dialog/wildfire-notification-dialog.component';
import { SavedLocationWeatherDetailsComponent } from './components/saved/saved-location-weather-details/saved-location-weather-details.component';
import { WeatherHistoryComponent } from './components/weather/weather-history/weather-history.component';
import { WeatherHistoryOptionsDialogComponent } from './components/weather/weather-history-options-dialog/weather-history-options-dialog.component';
import { GoogleChartsModule } from 'angular-google-charts';
import { GoogleChartsService } from './services/google-charts.service';
import { BaseDialogComponent } from './components/base-dialog/base-dialog.component';
import { NotificationSnackbarComponent } from '@app/components/notification-snackbar/notification-snackbar.component';
import { HTTP } from '@ionic-native/http/ngx';
import { IonicStorageService } from './services/ionic-storage.service';

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
    UnsavedChangesDialog,
    ImageCardPanel,
    Dashboard,
    AdminEditDashboard,
    WeatherPanelComponent,
    WildfirewResourcesComponent,
    ResourcePanelComponent,
    ErrorPageComponent,
    WildFiresListComponentDesktop,
    WildfiresListContainerDesktop,
    IncidentIdentifyPanelComponent,
    PanelWildfireStageOfControlContainerDesktop,
    PublicIncidentPage,
    IncidentGalleryPanel,
    IncidentHeaderPanel,
    IncidentInfoPanel,
    IncidentMapsPanel,
    IncidentOverviewPanel,
    SummaryPanel,
    WildfiresListHeaderComponent,
    WildFiresListComponentMobile,
    BansListComponent,
    BansListComponentDesktop,
    BansListComponentMobile,
    AreaRestrictionListComponent,
    AreaRestrictionListComponentDesktop,
    AreaRestrictionListComponentMobile,
    EvacListComponent,
    EvacListComponentDesktop,
    EvacListComponentMobile,
    FilterByLocationDialogComponent,
    FilterOptionsDialogComponent,
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
    IncidentGalleryPanelMobileComponent,
    IncidentGalleryAllMediaMobileComponent,
    IncidentGalleryImagesMobileComponent,
    IncidentGalleryVideosMobileComponent,
    VideoPanelComponent,
    ImagePanelComponent,
    ScrollToTopComponent,
    MapToggleButtonComponent,
    AlertOrderBannerComponent,
    ReportOfFirePage,
    RoFTitlePage,
    RoFPermissionsPage,
    RoFSimpleQuestionPage,
    RoFComplexQuestionPage,
    RoFContactPage,
    RoFPhotoPage,
    RoFLocationPage,
    RoFCommentsPage,
    RoFReviewPage,
    RoFCompassPage,
    LocationServicesDialogComponent,
    DialogLocationComponent,
    RoFDisclaimerPage,
    RofCallPage,
    DialogExitComponent,
    OverviewWidget,
    SituationWidget,
    SummaryWidget,
    ActiveFiresWidget,
    ResourcesWidget,
    EvacuationsWidget,
    BansWidget,
    FiresOfNoteWidget,
    FireCauseWidget,
    BlogWidget,
    VideosWidget,
    FireTotalsWidget,
    HistoricalComparisonWidget,
    FireCentreStatsWidget,
    MapToggleButtonComponent,
    DraggablePanelComponent,
    MobileSlidingDrawerComponent,
    MapTypePickerComponent,
    CheckboxButtonComponent,
    MapLayersDrawerSectionComponent,
    MapLayersDataSourceDrawerSectionComponent,
    FullDetailsComponent,
    AreaRestrictionsFullDetailsComponent,
    DangerRatingFullDetailsComponent,
    LinkButtonComponent,
    SavedComponent,
    MoreComponent,
    BansFullDetailsComponent,
    EvacAlertFullDetailsComponent,
    EvacOrderFullDetailsComponent,
    EvacOtherInfoComponent,
    BaseLegendComponent,
    MapLegendComponent,
    FireLegendComponent,
    EvacLegendComponent,
    BansLegendComponent,
    AreaRestrictionLegendComponent,
    DangerRatingLegendComponent,
    SmokeLegendComponent,
    RoadEventLegendComponent,
    LocalAuthoritiesLegendComponent,
    PrecipRadarLegendComponent,
    PrecipForecastLegendComponent,
    RecSiteLegendComponent,
    ProtectedLandsLegendComponent,
    SearchPageComponent,
    AddSavedLocationComponent,
    notificationMapComponent,
    SavedLocationFullDetailsComponent,
    ConfirmationDialogComponent,
    WildfireNotificationDialogComponent,
    SavedLocationWeatherDetailsComponent,
    WeatherHistoryComponent,
    WeatherHistoryOptionsDialogComponent,
    BaseDialogComponent,
    NotificationSnackbarComponent,
  ],
  imports: [
    MatSortModule,
    MatProgressSpinnerModule,
    MatProgressBarModule,
    MatTableModule,
    MatSnackBarModule,
    MatButtonToggleModule,
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
    MatMdcDialogModule,
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
    MatTableModule,
    MatTabsModule,
    MatProgressSpinnerModule,
    OwlDateTimeModule,
    OwlNativeDateTimeModule,
    OwlMomentDateTimeModule,
    CKEditorModule,
    CoreUIModule.forRoot({
      configurationPath: environment.app_config_location,
    }),
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
      },
    }),
    StoreRouterConnectingModule.forRoot({
      serializer: FullRouterStateSerializer,
      stateKey: 'router',
    }),
    StoreDevtoolsModule.instrument({
      maxAge: 25,
      logOnly: environment.production, // Restrict extension to log-only mode
    }),
    EffectsModule.forRoot([]),
    ServiceWorkerModule.register('wfnews-service-worker.js', {
      enabled: environment.production,
      scope: './',
    }),
    ScrollingModule,
    WildfireApplicationModule.forRoot(),
    MatToolbarModule,
    MatSlideToggleModule,
    MatExpansionModule,
    NgxPaginationModule,
    NgxChartsModule,
    YouTubePlayerModule,
    NgxMaskModule.forRoot(),
    IonicStorageModule.forRoot(),
    IonicModule.forRoot(),
    MatSliderModule,
    GoogleChartsModule,
  ],
  providers: [
    // Added provideBootstrapEffects function to handle the ngrx issue that loads effects before APP_INITIALIZER
    // providers have finished initializing.
    // See https://github.com/ngrx/platform/issues/931 for more information.
    provideBootstrapEffects(rootEffects),
    {
      provide: APP_BASE_HREF,
      useValue: environment.app_base,
    },
    {
      provide: RouteReuseStrategy,
      useClass: CustomReuseStrategy,
    },
    AGOLService,
    TokenService,
    UpdateService,
    {
      provide: APP_INITIALIZER,
      useFactory: codeTableAndUserPrefFnInit,
      multi: true,
      deps: [AppConfigService, HttpClient, Injector],
    },

    {
      provide: IncidentsConfiguration,
      useFactory(appConfig: AppConfigService) {
        return new IncidentsConfiguration({
          basePath: appConfig.getConfig().rest.incidents,
        });
      },
      multi: false,
      deps: [AppConfigService],
    },
    {
      provide: OrgUnitConfiguration,
      useFactory(appConfig: AppConfigService) {
        return new OrgUnitConfiguration({
          basePath: appConfig.getConfig().rest.orgunit,
        });
      },
      multi: false,
      deps: [AppConfigService],
    },
    {
      provide: DocumentAPIServiceConfiguration,
      useFactory(appConfig: AppConfigService) {
        return new DocumentAPIServiceConfiguration({
          basePath: appConfig.getConfig().rest.wfdm,
        });
      },
      multi: false,
      deps: [AppConfigService],
    },
    {
      provide: OWL_DATE_TIME_FORMATS,
      useValue: DATE_FORMATS,
    },
    {
      provide: HTTP_INTERCEPTORS,
      useClass: WfnewsInterceptor,
      multi: true,
    },
    { provide: MAT_DIALOG_DATA, useValue: {} },
    { provide: MatDialogRef, useValue: {} },
    WFMapService,
    MapConfigService,
    CommonUtilityService,
    DocumentManagementService,
    PublishedIncidentService,
    LocalStorageService,
    WatchlistService,
    PointIdService,
    CanDeactivateGuard,
    ReportOfFireService,
    NotificationService,
    GoogleChartsService,
    HTTP,
    IonicStorageService
  ],
  bootstrap: [AppComponent],
})
export class AppModule {}
