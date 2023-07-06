import {BaseContainer} from "../base/base-container.component";
import {AfterViewInit, Component, OnInit} from "@angular/core";
import {Location, LocationStrategy, PathLocationStrategy} from "@angular/common";


@Component({
    selector: 'help-content-container',
    template: `
        <wfone-help-content
        ></wfone-help-content>`,
    providers: [Location, {provide: LocationStrategy, useClass: PathLocationStrategy}]
})
export class HelpContentContainer extends BaseContainer implements AfterViewInit, OnInit {

    ngOnInit() {
    }

    ngAfterViewInit(): void {

    }
}
