import {CommonModule} from "@angular/common";
import {NgModule} from "@angular/core";
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
    MatIconModule,
    MatInputModule,
    MatListModule,
    MatMenuModule,
    MatPaginatorModule,
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
import {FontAwesomeModule} from "@fortawesome/angular-fontawesome";
import {WFMapContainerComponent} from "../components/wf-map-container/wf-map-container.component";
import {HttpClientModule} from "@angular/common/http";
import {HttpModule} from "@angular/http";
import {Ng2FabSpeedDialModule} from "ng2-fab-speed-dial";

@NgModule({
    imports: [
        CommonModule,
        FontAwesomeModule,
        MatExpansionModule,
        MatBadgeModule,
        MatButtonToggleModule,
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
        Ng2FabSpeedDialModule,
        HttpClientModule,
        HttpModule,
    ],
    declarations: [
        WFMapContainerComponent
    ],
    exports: [
        WFMapContainerComponent
    ],
    providers: [

    ]
})
export class MapModule {}
