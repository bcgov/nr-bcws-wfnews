import {BaseContainer} from "../base/base-container.component";
import {AfterViewInit, Component} from "@angular/core";
import {Location, LocationStrategy, PathLocationStrategy} from "@angular/common";


@Component({
    selector: 'notification-detail-container',
    template: `
        <wfone-notification-detail
        ></wfone-notification-detail>`,
    providers: [Location, {provide: LocationStrategy, useClass: PathLocationStrategy}]
})
export class NotificationDetailContainer extends BaseContainer implements AfterViewInit{

    ngOnInit() {
    }

    ngAfterViewInit(): void {

    }
}
