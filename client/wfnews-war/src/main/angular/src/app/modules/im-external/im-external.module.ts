import { DragDropModule } from "@angular/cdk/drag-drop";
import { CdkTableModule } from '@angular/cdk/table';
import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from "@angular/forms";
import { MatBadgeModule } from '@angular/material/badge';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatListModule } from '@angular/material/list';
import { MatMenuModule } from '@angular/material/menu';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatProgressSpinnerModule } from "@angular/material/progress-spinner";
import { MatSelectModule } from '@angular/material/select';
import { MatSlideToggleModule } from "@angular/material/slide-toggle";
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { MatSortModule } from '@angular/material/sort';
import { MatTableModule } from '@angular/material/table';
import { MatTabsModule } from '@angular/material/tabs';
import { MatToolbarModule } from "@angular/material/toolbar";
import { MatTooltipModule } from '@angular/material/tooltip';
import { RouterModule } from '@angular/router';
import { CoreUIModule } from '@wf1/core-ui';
import { ApiModule } from '@wf1/incidents-rest-api';
import { WildfireApplicationModule } from "@wf1/wfcc-application-ui";
import { OwlDateTimeModule, OWL_DATE_TIME_FORMATS } from "ng-pick-datetime";
import { OwlMomentDateTimeModule } from 'ng-pick-datetime-moment';
import { NgxMaskModule } from "ngx-mask";
import { CoreModule } from '../core/core.module';
import { CommentsTableComponent } from './components/comments/comments-table.component';
import { CommentsContainerComponent } from './components/comments/comments.component';
import { IMContainerComponent } from './components/container/im-container.component';
import { MessageDialogComponent } from './components/message-dialog/message-dialog.component';
import { IncidentPanelContainerComponent } from './components/panel-container/incident-panel-container.component';
import { ArrayComponent } from "./components/panel-container/panel/array/array.component";
import { FuelArrayComponent } from "./components/panel-container/panel/array/fuel-array.component";
import { RswapArrayComponent } from "./components/panel-container/panel/array/rswap-array.component";
import { BasePanelComponent } from './components/panel-container/panel/base.panel.component';
import { CausePanelComponent } from './components/panel-container/panel/cause-panel.component';
import { CEInvestigationPanelComponent } from './components/panel-container/panel/ce-investigation-panel.component';
import { CollectionNoticeDialogComponent } from "./components/panel-container/panel/collection-notice-dialog/collection-notice-dialog.component";
import { CostPanelComponent } from "./components/panel-container/panel/cost-panel.component";
import { FireCharacteristicPanelComponent } from "./components/panel-container/panel/fire-characteristic-panel.component";
import { GeneralIncidentPanelComponent } from './components/panel-container/panel/general-incident-panel.component';
import { HistoryPanelComponent } from './components/panel-container/panel/history-panel.component';
import { LandAuthorityPanelComponent } from './components/panel-container/panel/land-authority-panel.component';
import { PhotosPanelComponent } from "./components/panel-container/panel/photos-panel.component";
import { RswapPanelComponent } from './components/panel-container/panel/rswap-panel.component';
import { SignOffPanelComponent } from "./components/panel-container/panel/sign-off-panel.component";
import { SnackbarErrorWithOKComponent } from "./components/panel-container/panel/snackbar-error-with-ok.component";
import { SnackbarErrorComponent } from './components/panel-container/panel/snackbar-error.component';
import { IncidentTableComponent } from './components/table/incident-table.component';
import { IMTabsComponent } from './components/tabs/im-tabs.component';
import { UpdateInfoContainerComponent } from "./components/update-info/update-info.component";
import { AutoFocusDirective } from "./directives/auto-focus.directive";
import { SingleClickDirective } from "./directives/single-click.directive";
import { IMExternalRoutingModule } from './im-external.routing.module';

export const DATE_FORMATS = {
    fullPickerInput: 'YYYY-MM-DD HH:mm:ss',
    datePickerInput: 'YYYY-MM-DD',
    timePickerInput: 'HH:mm:ss',
    monthYearLabel: 'YYYY-MM',
    dateA11yLabel: 'YYYY-MMM-DD',
    monthYearA11yLabel: 'YYYY-MMM',
};

// export const CURRENCY_FORMAT: CurrencyMaskConfig = {
//     align: "right",
//     allowNegative: false,
//     allowZero: true,
//     decimal: ".",
//     precision: 2,
//     prefix: "",
//     suffix: "",
//     thousands: ","
// };

@NgModule({
    imports: [
        CommonModule,
        RouterModule,
        DragDropModule,
        IMExternalRoutingModule,
        CoreUIModule,
        ApiModule,
        CdkTableModule,
        MatBadgeModule,
        MatButtonModule,
        MatSlideToggleModule,
        MatCardModule,
        MatCheckboxModule,
        MatDialogModule,
        MatIconModule,
        MatListModule,
        MatMenuModule,
        MatSnackBarModule,
        MatSortModule,
        MatTabsModule,
        MatTableModule,
        MatTooltipModule,
        MatToolbarModule,
        MatFormFieldModule,
        MatInputModule,
        MatSelectModule,
        MatProgressBarModule,
        MatProgressSpinnerModule,
        OwlDateTimeModule,
        OwlMomentDateTimeModule,
        FormsModule,
        ReactiveFormsModule,
        NgxMaskModule.forRoot(),
        CoreModule,
        WildfireApplicationModule.forRoot(),
    ],
    providers: [
        { provide: OWL_DATE_TIME_FORMATS, useValue: DATE_FORMATS },
    ],
    declarations: [
        BasePanelComponent,
        ArrayComponent,
        MessageDialogComponent,
        IMContainerComponent,
        IMTabsComponent,
        IncidentTableComponent,
        IncidentPanelContainerComponent,
        GeneralIncidentPanelComponent,
        CEInvestigationPanelComponent,
        CostPanelComponent,
        LandAuthorityPanelComponent,
        RswapPanelComponent,
        FireCharacteristicPanelComponent,
        CausePanelComponent,
        HistoryPanelComponent,
        CommentsContainerComponent,
        CommentsTableComponent,
        SnackbarErrorComponent,
        SnackbarErrorWithOKComponent,
        SignOffPanelComponent,
        FuelArrayComponent,
        RswapArrayComponent,
        UpdateInfoContainerComponent,
        AutoFocusDirective,
        SingleClickDirective,
        PhotosPanelComponent,
        CollectionNoticeDialogComponent
    ],
    exports: [
        IMContainerComponent,
        IMTabsComponent,
        IncidentTableComponent,
        IncidentPanelContainerComponent,
    ]
})
export class IMExternalModule { }
