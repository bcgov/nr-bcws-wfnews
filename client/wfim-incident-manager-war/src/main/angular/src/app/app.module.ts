import { DragDropModule } from "@angular/cdk/drag-drop";
import { ScrollingModule } from '@angular/cdk/scrolling';
import { CdkTableModule } from '@angular/cdk/table';
import { APP_BASE_HREF, CommonModule } from "@angular/common";
import { HttpClient, HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';
import { APP_INITIALIZER, Injector, NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogModule } from '@angular/material/dialog';
import { MatDividerModule } from '@angular/material/divider';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatListModule } from '@angular/material/list';
import { MatMenuModule } from '@angular/material/menu';
import { MatRadioModule } from '@angular/material/radio';
import { MatSelectModule } from '@angular/material/select';
import { MatTooltipModule } from '@angular/material/tooltip';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { RouteReuseStrategy } from '@angular/router';
import { ServiceWorkerModule } from "@angular/service-worker";
import { EffectsModule } from '@ngrx/effects';
import { DefaultRouterStateSerializer, StoreRouterConnectingModule } from '@ngrx/router-store';
import { ActionReducer, StoreModule } from '@ngrx/store';
import { StoreDevtoolsModule } from "@ngrx/store-devtools";
import { AppConfigService, CoreUIModule, ReportDialogComponent } from '@wf1/core-ui';
import { ApiModule as IncidentsApiModule, Configuration as IncidentsConfiguration } from '@wf1/incidents-rest-api';
import { ApiModule as OrgUnitApiModule, OrgUnitConfiguration } from '@wf1/orgunit-rest-api';
import { OwlDateTimeModule, OWL_DATE_TIME_FORMATS } from "ng-pick-datetime";
import { OwlMomentDateTimeModule } from 'ng-pick-datetime-moment';
import { localStorageSync } from "ngrx-store-localstorage";
import { environment } from '../environments/environment';
import { codeTableAndUserPrefFnInit } from "./app-initializer";
import { AppComponent } from './app.component';
import { ROUTING } from './app.routing';
import { MeasureComponent } from "./components/measure/measure.component";
import { TimeDimensionComponent } from "./components/time-dimension/time-dimension.component";
import { WFMapContainerComponent } from "./components/wf-map-container/wf-map-container.component";
import { WfimPanelContainerComponent } from "./components/wfim-panel-container/wfim-panel-container.component";
import { WfimInterceptor } from "./interceptors/wfim-interceptor";
import { WildfireApplicationModule } from "@wf1/wfcc-application-ui";
import { AudibleAlertModule } from "./modules/audible-alert/audible-alert.module";
import { CoreModule } from './modules/core/core.module';
import { IMExternalModule } from './modules/im-external/im-external.module';
import { IncidentManagementModule } from './modules/incident-management/incident-management.module';
import { NROFModule } from "./modules/nrof/nrof.module";
import { PlaceNameSearchModule } from './modules/place-name-search/place-name-search.module';
import { PointIdModule } from './modules/point-id/point-id.module';
import { ROFModule } from './modules/rof/rof.module';
import { DocumentManagementService } from "./services/document-management.service";
import { MapConfigService } from "./services/map-config.service";
import { MapStatePersistenceService } from "./services/map-state-persistence.service";
import { PollingMonitorService } from "./services/polling-monitor.service";
import { UIReportingService } from "./services/ui-reporting.service";
import { UpdateService } from './services/update.service';
import { WFMapService } from "./services/wf-map.service";
import { WfimMapService } from "./services/wfim-map.service";
import { CustomReuseStrategy } from './shared/route/custom-route-reuse-strategy';
import { initialRootState, rootEffects, rootReducers } from './store';
import { INCIDENT_COMPONENT_ID, INCIDENT_MAP_COMPONENT_ID } from "./store/im/im.state";
import { ROF_MAP_COMPONENT_ID } from "./store/rof/rof.state";
import { provideBootstrapEffects } from './utils';
import {
    ApiModule as DocumentAPIServiceModule,
    Configuration as DocumentAPIServiceConfiguration
} from "@wf1/wfdm-document-management-api";

export function localStorageSyncReducer(reducer: ActionReducer<any>): ActionReducer<any> {
    return localStorageSync({ keys: [INCIDENT_MAP_COMPONENT_ID, ROF_MAP_COMPONENT_ID, INCIDENT_COMPONENT_ID], rehydrate: true })(reducer);
}
// const metaReducers: Array<MetaReducer<any, any>> = (environment.production) ? [] : [logger];

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
        TimeDimensionComponent,
        MeasureComponent,
        WfimPanelContainerComponent,
    ],
    imports: [
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
        MatFormFieldModule,
        MatSelectModule,
        OwlDateTimeModule,
        OwlMomentDateTimeModule,
        CoreUIModule.forRoot({ configurationPath: environment.app_config_location }),
        IncidentsApiModule,
        OrgUnitApiModule,
        MatTooltipModule,
        IMExternalModule,
        IncidentManagementModule,
        ROFModule,
        NROFModule,
        PlaceNameSearchModule,
        AudibleAlertModule,
        PointIdModule,
        CoreModule,
        StoreModule.forRoot(rootReducers, {
            initialState: initialRootState,
            // metaReducers: metaReducers,
            runtimeChecks: { // added to suppress runtime error, couldn't find root cause
                strictStateImmutability: false,
                strictActionImmutability: false,
            }
        }),
        StoreRouterConnectingModule.forRoot({ serializer: DefaultRouterStateSerializer, stateKey: 'router' }),
        StoreDevtoolsModule.instrument({
            maxAge: 25, // Retains last 25 states
            logOnly: environment.production, // Restrict extension to log-only mode
        }),
        EffectsModule.forRoot([]),
        ServiceWorkerModule.register( 'wfim-service-worker.js', { enabled: environment.production, scope: './' }),
        ScrollingModule,
        WildfireApplicationModule.forRoot(),
        DocumentAPIServiceModule
    ],
    providers: [
        {
            provide: APP_BASE_HREF,
            useValue: environment.app_base
        },
        { 
            provide: RouteReuseStrategy, 
            useClass: CustomReuseStrategy 
        },
        provideBootstrapEffects(rootEffects),
        PollingMonitorService,
        UpdateService,
        UIReportingService,
        {
            provide: APP_INITIALIZER,
            useFactory: codeTableAndUserPrefFnInit,
            multi: true,
            deps: [AppConfigService, HttpClient, MapStatePersistenceService, Injector]
        },
        {
            provide: HTTP_INTERCEPTORS,
            useClass: WfimInterceptor,
            multi: true
        },
        {
            provide: IncidentsConfiguration,
            useFactory: function (appConfig: AppConfigService) {
                return new IncidentsConfiguration( { basePath: appConfig.getConfig().rest.incidents } );
            },
            multi: false,
            deps: [AppConfigService]
        },
        {
            provide: OrgUnitConfiguration,
            useFactory: function (appConfig: AppConfigService) {
                return new OrgUnitConfiguration( { basePath: appConfig.getConfig().rest.orgunit } );
            },
            multi: false,
            deps: [AppConfigService]
        },
        {
            provide: DocumentAPIServiceConfiguration,
            useFactory: function (appConfig: AppConfigService) {
                return new DocumentAPIServiceConfiguration( { basePath: appConfig.getConfig().rest.wfdm } );
            },
            multi: false,
            deps: [AppConfigService]
        },
        { 
            provide: OWL_DATE_TIME_FORMATS, 
            useValue: DATE_FORMATS 
        },
        WFMapService,
        MapConfigService,
        WfimMapService,
        MapStatePersistenceService,
        DocumentManagementService
    ],
    entryComponents: [
        ReportDialogComponent
    ],
    bootstrap: [
        AppComponent
    ]
})

export class AppModule { }

