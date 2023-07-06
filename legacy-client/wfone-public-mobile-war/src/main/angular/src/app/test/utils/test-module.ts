import {BrowserAnimationsModule, NoopAnimationsModule} from "@angular/platform-browser/animations";
import {HttpClientTestingModule} from "@angular/common/http/testing";
import {RouterTestingModule} from "@angular/router/testing";
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

import {FontAwesomeModule} from "@fortawesome/angular-fontawesome";

import {NgModule} from "@angular/core";

import {FakeNoopComponent} from "../components/fake/fake-noop.component";


export function getDefaultTestingImportModules(): any[] {
    return [
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

    ];
}




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
        NoopAnimationsModule,
    ],
    exports: [
        FakeNoopComponent
    ],
    declarations: [
        FakeNoopComponent
    ],
    entryComponents: [

    ],
})
export class DialogTestModule { }

// export const MOCK_APP_STATE_SERVICE = jasmine.createSpyObj(['getUserCredentialsEmitter', 'getUserEmail', 'doesUserHaveScopes', 'doesUserHaveScope', 'getCurrentEmployeeGuid']);