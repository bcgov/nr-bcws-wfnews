import { Location, LocationStrategy, PathLocationStrategy } from "@angular/common";
import { Component } from "@angular/core";
import { BaseContainer } from "../base/base-container.component";

@Component({
    selector: 'notifications-container',
    template: `
        <wfone-notifications
        ></wfone-notifications>
    `,
    providers: [Location, {provide: LocationStrategy, useClass: PathLocationStrategy}]
})
export class NotificationsContainer extends BaseContainer {
}
