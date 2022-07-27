import { DragDropModule } from "@angular/cdk/drag-drop";
import { ScrollingModule } from '@angular/cdk/scrolling';
import { CdkTableModule } from '@angular/cdk/table';
import { APP_BASE_HREF, CommonModule } from "@angular/common";
import { HttpClient, HttpClientModule } from '@angular/common/http';
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
import { StoreModule } from '@ngrx/store';
import { StoreDevtoolsModule } from "@ngrx/store-devtools";
import { AppConfigService, CoreUIModule } from '@wf1/core-ui';
import { ApiModule as IncidentsApiModule, Configuration as IncidentsConfiguration } from '@wf1/incidents-rest-api';
import { ApiModule as OrgUnitApiModule, OrgUnitConfiguration } from '@wf1/orgunit-rest-api';
import { OwlDateTimeModule, OWL_DATE_TIME_FORMATS } from "ng-pick-datetime";
import { OwlMomentDateTimeModule } from 'ng-pick-datetime-moment';
import { environment } from '../environments/environment';
import { codeTableAndUserPrefFnInit } from "./app-initializer";
import { AppComponent } from './app.component';
import { ROUTING } from './app.routing';
import { WFMapContainerComponent } from "./components/wf-map-container/wf-map-container.component";
// import { WFActiveFireCountContainerComponent } from "./components/wf-active-fire-count-container/wf-active-fire-count-container.component";
import { MatExpansionModule } from "@angular/material/expansion";
import { MatSlideToggleModule } from "@angular/material/slide-toggle";
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { MatToolbarModule } from "@angular/material/toolbar";
import { WildfireApplicationModule } from "@wf1/wfcc-application-ui";
import {
    ApiModule as DocumentAPIServiceModule,
    Configuration as DocumentAPIServiceConfiguration
} from "@wf1/wfdm-document-management-api";
import { ActiveWildfireMapComponent } from "./components/active-wildfire-map/active-wildfire-map.component";
import { WfLeftPanelComponent } from "./components/wf-left-panel/wf-left-panel.component";
import { MapConfigService } from "./services/map-config.service";
import { MapStatePersistenceService } from "./services/map-state-persistence.service";
import { UpdateService } from './services/update.service';
import { WFMapService } from "./services/wf-map.service";
import { CustomReuseStrategy } from './shared/route/custom-route-reuse-strategy';
import { initialRootState, rootEffects, rootReducers } from './store';
import { provideBootstrapEffects } from "./utils";


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
        WfLeftPanelComponent,
        ActiveWildfireMapComponent
    ],
    imports: [
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
        MatFormFieldModule,
        MatSelectModule,
        OwlDateTimeModule,
        OwlMomentDateTimeModule,
        CoreUIModule.forRoot({ configurationPath: environment.app_config_location }),
        IncidentsApiModule,
        OrgUnitApiModule,
        MatTooltipModule,
        StoreModule.forRoot(rootReducers, {
            initialState: initialRootState,
            // metaReducers: metaReducers,
            runtimeChecks: {
                strictStateImmutability: false,
                strictActionImmutability: false,
            }
        }),
        StoreRouterConnectingModule.forRoot({ serializer: DefaultRouterStateSerializer, stateKey: 'router' }),
        StoreDevtoolsModule.instrument({
            maxAge: 25,
            logOnly: environment.production, // Restrict extension to log-only mode
        }),
        EffectsModule.forRoot([]),
        ServiceWorkerModule.register('wfim-service-worker.js', { enabled: environment.production, scope: './' }),
        ScrollingModule,
        WildfireApplicationModule.forRoot(),
        DocumentAPIServiceModule,
        MatToolbarModule,
        MatSlideToggleModule,
        MatExpansionModule
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

        UpdateService,
        {
            provide: APP_INITIALIZER,
            useFactory: codeTableAndUserPrefFnInit,
            multi: true,
            deps: [AppConfigService, HttpClient, MapStatePersistenceService, Injector]
        },

        {
            provide: IncidentsConfiguration,
            useFactory: function (appConfig: AppConfigService) {
                return new IncidentsConfiguration({ basePath: appConfig.getConfig().rest.incidents });
            },
            multi: false,
            deps: [AppConfigService]
        },
        {
            provide: OrgUnitConfiguration,
            useFactory: function (appConfig: AppConfigService) {
                return new OrgUnitConfiguration({ basePath: appConfig.getConfig().rest.orgunit });
            },
            multi: false,
            deps: [AppConfigService]
        },
        {
            provide: DocumentAPIServiceConfiguration,
            useFactory: function (appConfig: AppConfigService) {
                return new DocumentAPIServiceConfiguration({ basePath: appConfig.getConfig().rest.wfdm });
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
        MapStatePersistenceService,
    ],
    bootstrap: [
        AppComponent
    ]
})

export class AppModule { }

