import { DragDropModule } from '@angular/cdk/drag-drop';
import { ScrollingModule } from '@angular/cdk/scrolling';
import { CdkTableModule } from '@angular/cdk/table';
import { APP_BASE_HREF, CommonModule } from '@angular/common';
import { HttpClient, HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';
import { APP_INITIALIZER, Injector, NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogModule } from '@angular/material/dialog';
import { MatDividerModule } from '@angular/material/divider';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatGridListModule } from '@angular/material/grid-list';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatListModule } from '@angular/material/list';
import { MatMenuModule } from '@angular/material/menu';
import { MatRadioModule } from '@angular/material/radio';
import { MatSelectModule } from '@angular/material/select';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatChipsModule } from '@angular/material/chips';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { RouteReuseStrategy } from '@angular/router';
import { ServiceWorkerModule } from '@angular/service-worker';
import { OwlNativeDateTimeModule } from '@busacca/ng-pick-datetime';
import { EffectsModule } from '@ngrx/effects';
import { DefaultRouterStateSerializer, StoreRouterConnectingModule } from '@ngrx/router-store';
import { StoreModule } from '@ngrx/store';
import { StoreDevtoolsModule } from '@ngrx/store-devtools';
import { AppConfigService, CoreUIModule, TokenService } from '@wf1/core-ui';
import { ApiModule as IncidentsApiModule, Configuration as IncidentsConfiguration } from '@wf1/incidents-rest-api';
import { ApiModule as OrgUnitApiModule, OrgUnitConfiguration } from '@wf1/orgunit-rest-api';
import { WildfireApplicationModule } from '@wf1/wfcc-application-ui';
import {
    ApiModule as DocumentAPIServiceModule,
    Configuration as DocumentAPIServiceConfiguration
} from '@wf1/wfdm-document-management-api';
import { OwlDateTimeModule, OWL_DATE_TIME_FORMATS } from 'ng-pick-datetime';
import { OwlMomentDateTimeModule } from 'ng-pick-datetime-moment';
import { environment } from '../environments/environment';
import { codeTableAndUserPrefFnInit } from './app-initializer';
import { AppComponent } from './app.component';
import { ROUTING } from './app.routing';
import { ActiveWildfireMapComponent } from './components/active-wildfire-map/active-wildfire-map.component';
import { PanelEvacuationOrdersAndAlertsComponent } from './components/panel-evacuation-orders-and-alerts/panel-evacuation-orders-and-alerts.component';
import { PanelWildfireStageOfControlComponent } from './components/panel-wildfire-stage-of-control/panel-wildfire-stage-of-control.component';
import { WFMapContainerComponent } from './components/wf-map-container/wf-map-container.component';
import { MapConfigService } from './services/map-config.service';
import { UpdateService } from './services/update.service';
import { WFMapService } from './services/wf-map.service';
import { CustomReuseStrategy } from './shared/route/custom-route-reuse-strategy';
import { initialRootState, rootEffects, rootReducers } from './store';
import { provideBootstrapEffects } from './utils';
import { MatTableModule} from "@angular/material/table";
import { SingleSelectDirective } from './directives/singleselect.directive';
import { MatPaginatorModule } from '@angular/material/paginator';
import { NgxPaginationModule } from 'ngx-pagination';
import { WfAdminPanelComponentDesktop } from './components/wf-admin-panel/wf-admin-panel.component.desktop';
import { AdminContainerDesktop } from './containers/admin/admin-container.component.desktop';
import { WfnewsInterceptor } from './interceptors/wfnews-interceptor';
import { IncidentDetailsPanel } from './components/admin-incident-form/incident-details-panel/incident-details-panel.component';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSortModule } from '@angular/material/sort';
import { MatCardModule } from '@angular/material/card';
import { ResponseDetailsPanel } from './components/admin-incident-form/response-details-panel/response-details-panel.component';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { ContactsDetailsPanel } from './components/admin-incident-form/contacts-details-panel/contacts-details-panel.component';
import { EvacOrdersDetailsPanel } from './components/admin-incident-form/evac-orders-details-panel/evac-orders-details-panel.component';
import { AreaRestrictionsDetailsPanel } from './components/admin-incident-form/area-restrictions-details-panel/area-restrictions-details-panel.component';
import { AdminIncidentFormDesktop } from './components/admin-incident-form/admin-incident-form.component.desktop';
import { IncidentContainerDesktop } from './containers/incident/incident-container.component.desktop';
import { CKEditorModule } from '@ckeditor/ckeditor5-angular';
import { MatTabGroup, MatTabsModule } from '@angular/material/tabs';
import { AGOLService } from './services/AGOL-service';

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
        ActiveWildfireMapComponent,
        PanelWildfireStageOfControlComponent,
        PanelEvacuationOrdersAndAlertsComponent,
        WfAdminPanelComponentDesktop,
        SingleSelectDirective,
        AdminContainerDesktop,
        AdminIncidentFormDesktop,
        IncidentDetailsPanel,
        ResponseDetailsPanel,
        ContactsDetailsPanel,
        EvacOrdersDetailsPanel,
        AreaRestrictionsDetailsPanel,
        IncidentContainerDesktop
    ],
    imports: [
        MatSortModule,
        MatProgressSpinnerModule,
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
        OwlDateTimeModule,
        OwlNativeDateTimeModule,
        OwlMomentDateTimeModule,
        CKEditorModule,
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
        MatToolbarModule,
        MatSlideToggleModule,
        MatExpansionModule,
        MatPaginatorModule,
        NgxPaginationModule,
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
    ],
    bootstrap: [
        AppComponent
    ]
})

export class AppModule { }

