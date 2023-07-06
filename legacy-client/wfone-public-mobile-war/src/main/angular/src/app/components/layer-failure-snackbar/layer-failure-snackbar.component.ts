import { Component, Inject } from "@angular/core";
import { MatSnackBarRef, MAT_SNACK_BAR_DATA } from "@angular/material/snack-bar";

export type LayerFailureConfig = {
    title: string
}

@Component( {
    selector: 'wfone-layer-failure-snackbar',
    template: `
        <div matSnackBarActions>
            <span matSnackBarAction matSnackBarLabel class="snackbar"
                (click)="snackBarRef.dismissWithAction()"
            >
                <span class="icon"></span>
                <span class="content">
                    <div class="title">This layer failed to load:</div>
                    <div class="body">"{{ title }}"</div>
                    <div >Click here to reload it.</div>
                </span>
                <span class="close"
                    (click)="snackBarRef.dismiss(); $event.stopPropagation()"
                >
                    <mat-icon>close</mat-icon>
                </span>
            </span>
        </div>
    `,
    styleUrls: [ './layer-failure-snackbar.component.scss' ]
} )
export class LayerFailureSnackbarComponent {
    constructor(
        public snackBarRef: MatSnackBarRef<LayerFailureSnackbarComponent>,
        @Inject(MAT_SNACK_BAR_DATA) public data: LayerFailureConfig
    ) { }

    get title() {
        return this.data.title
    }
}
