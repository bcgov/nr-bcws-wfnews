import {BaseContainer} from "../base/base-container.component";
import {AfterViewInit, Component} from "@angular/core";
import {Location, LocationStrategy, PathLocationStrategy} from "@angular/common";


@Component({
    selector: 'help-container',
    template: `
        <wfone-help
        ></wfone-help>`,
    providers: [Location, {provide: LocationStrategy, useClass: PathLocationStrategy}]
})
export class HelpContainer extends BaseContainer implements AfterViewInit{

    ngOnInit() {
    }

    ngAfterViewInit(): void {

    }
}
