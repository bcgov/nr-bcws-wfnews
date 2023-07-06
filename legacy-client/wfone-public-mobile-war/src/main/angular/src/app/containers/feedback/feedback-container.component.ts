import {BaseContainer} from "../base/base-container.component";
import {AfterViewInit, Component} from "@angular/core";
import {Location, LocationStrategy, PathLocationStrategy} from "@angular/common";


@Component({
    selector: 'feedback-container',
    template: `
        <wfone-feedback
        ></wfone-feedback>`,
    providers: [Location, {provide: LocationStrategy, useClass: PathLocationStrategy}]
})
export class FeedbackContainer extends BaseContainer implements AfterViewInit{

    ngOnInit() {
    }

    ngAfterViewInit(): void {

    }
}
