import { Component, Inject } from '@angular/core';
// External
import { MAT_SNACK_BAR_DATA, MatSnackBarRef } from '@angular/material/snack-bar';
// Models
import { ErrorMessages } from '../../../../../config/error-messages';
import { WFError } from "../../../../core/models/wf-error";

interface IncidentErrorSnackbarData {
    errors: WFError[];
}

@Component({
    selector: 'wfim-snackbar-with-ok-error',
    template: `
		<ul>
			<li *ngFor="let error of data.errors">
				{{displayError(error)}}
			</li>
		</ul>
    <button class="mat-simple-snackbar-action"
            style="background-color: inherit;float: right; border: none;"
            (click)="snackBarRef.dismiss()" 
            aria-label="OK">
        OK
    </button>
	`
})
export class SnackbarErrorWithOKComponent {

    constructor(
        public snackBarRef: MatSnackBarRef<SnackbarErrorWithOKComponent>,
        @Inject(MAT_SNACK_BAR_DATA) public data: IncidentErrorSnackbarData
    ) { }

    displayError(error: WFError): string {
        return ErrorMessages[error.message] ? ErrorMessages[error.message](error) : error.message;
    }

    dismissError() {
        this.snackBarRef.dismiss();
    }

}
