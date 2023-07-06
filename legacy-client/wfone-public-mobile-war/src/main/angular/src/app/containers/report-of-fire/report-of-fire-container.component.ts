import {BaseContainer} from "../base/base-container.component";
import {AfterViewInit, Component} from "@angular/core";
import {Location, LocationStrategy, PathLocationStrategy} from "@angular/common";


@Component({
    selector: 'report-of-fire-container',
    template: `
        <wfone-report-of-fire
        ></wfone-report-of-fire>`,
    providers: [Location, {provide: LocationStrategy, useClass: PathLocationStrategy}]
})
export class ReportOfFireContainer extends BaseContainer implements AfterViewInit{

    ngOnInit() {
    }

    ngAfterViewInit(): void {

    }
}
