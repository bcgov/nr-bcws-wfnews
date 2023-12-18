import { Component, Inject } from "@angular/core";
import { MatSnackBarRef, MAT_SNACK_BAR_DATA } from "@angular/material/snack-bar";
import { Router } from "@angular/router";
import { ResourcesRoutes } from "@app/utils";

export type NotificationConfig = {
    title: string
    body: string
}

@Component( {
    selector: 'wfone-notification-snackbar',
    template: `
        <div matSnackBarActions>
            <span matSnackBarAction matSnackBarLabel class="snackbar"
                (click)="selectNotification()"
            >
                <span class="icon"></span>
                <span class="content">
                    <div class="title">{{ title }}</div>
                    <div class="body">{{ body }}</div>
                </span>
                <span class="close"
                    (click)="snackBarRef.dismiss(); $event.stopPropagation()"
                >
                </span>
            </span>
        </div>
        `,
    styleUrls: [ './notification-snackbar.component.scss' ]
} )
export class NotificationSnackbarComponent {
    constructor(
        public snackBarRef: MatSnackBarRef<NotificationSnackbarComponent>,
        protected router: Router,
        @Inject(MAT_SNACK_BAR_DATA) public data: any
    ) { }

    get title() {
        return this.data.notification.title
    }

    get body() {
        return this.data.notification.body
    }

    selectNotification() {
        const notification = this.data.notification
        let c = JSON.parse(notification.data['coords']),
        r = JSON.parse(notification.data['radius'])
        this.router.navigate([ResourcesRoutes.ACTIVEWILDFIREMAP], {
            queryParams: {
                latitude: c[0],
                longitude: c[1],
                radius: r,
                featureId: notification.data['messageID'],
                featureType: notification.data['topicKey'],
                identify:true,
                notification:true,
                time: Date.now()
            }
          });
          this.snackBarRef.dismiss();
    }
}
