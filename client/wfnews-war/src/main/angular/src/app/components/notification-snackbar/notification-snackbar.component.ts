import { Component, Inject } from "@angular/core";
import { MatSnackBarRef, MAT_SNACK_BAR_DATA } from "@angular/material/snack-bar";

export type NotificationConfig = {
    title: string
    body: string
}

@Component( {
    selector: 'wfone-notification-snackbar',
    template: '',
    styleUrls: [ './notification-snackbar.component.scss' ]
} )
export class NotificationSnackbarComponent {
    constructor(
        public snackBarRef: MatSnackBarRef<NotificationSnackbarComponent>,
        @Inject(MAT_SNACK_BAR_DATA) public data: NotificationConfig
    ) { }

    get title() {
        return this.data.title
    }

    get body() {
        return this.data.body
    }
}
