import {BaseContainer} from "../base/base-container.component";
import {AfterViewInit, Component} from "@angular/core";
import {Location, LocationStrategy, PathLocationStrategy} from "@angular/common";


@Component({
    selector: 'disclaimer-container',
    template: `
        <wfone-disclaimer
        ></wfone-disclaimer>`,
    providers: [Location, {provide: LocationStrategy, useClass: PathLocationStrategy}]
})
export class DisclaimerContainer extends BaseContainer implements AfterViewInit{

    ngOnInit() {
    }

    ngAfterViewInit(): void {

    }
}
