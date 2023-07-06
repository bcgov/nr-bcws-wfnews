import {NgModule} from "@angular/core";
import {FontAwesomeModule} from "@fortawesome/angular-fontawesome";
import {BrowserAnimationsModule} from "@angular/platform-browser/animations";
import {HttpClientTestingModule} from "@angular/common/http/testing";
import {FormsModule, ReactiveFormsModule} from "@angular/forms";
import {
    MatAutocompleteModule,
    MatBadgeModule,
    MatButtonModule,
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
import {RouterTestingModule} from "@angular/router/testing";
import {AppRoutingModule} from "../../app-routing.module";
import {LandingPageContainer} from "../../containers/landing/landing-page-container.component";

@NgModule({
    imports: [
        FontAwesomeModule,
        BrowserAnimationsModule,
        HttpClientTestingModule,
        RouterTestingModule,
        FormsModule,
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
        MatProgressSpinnerModule,
        ReactiveFormsModule,
        AppRoutingModule
    ],
    exports: [
        LandingPageContainer,
    ],
    declarations: [
        LandingPageContainer,

    ]
})
export class AppRouteTestModule { }
