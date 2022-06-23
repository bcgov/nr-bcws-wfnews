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
    selector: 'wfim-snackbar-error',
    template: `
		<ul (click)="snackBarRef.dismiss()">
			<li *ngFor="let error of data.errors">
				{{displayError(error)}}
			</li>
		</ul>
	`
})
export class SnackbarErrorComponent {

    constructor(
        public snackBarRef: MatSnackBarRef<SnackbarErrorComponent>,
        @Inject(MAT_SNACK_BAR_DATA) public data: IncidentErrorSnackbarData
    ) { }

    displayError(error: WFError): string {
        return ErrorMessages[error.message] ? ErrorMessages[error.message](error) : error.message;
    }
}
