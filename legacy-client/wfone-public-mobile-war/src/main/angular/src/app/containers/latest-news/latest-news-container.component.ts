import {BaseContainer} from "../base/base-container.component";
import {AfterViewInit, Component} from "@angular/core";
import {Location, LocationStrategy, PathLocationStrategy} from "@angular/common";


@Component({
    selector: 'latest-news-container',
    template: `
        <wfone-latest-news
        ></wfone-latest-news>`,
    providers: [Location, {provide: LocationStrategy, useClass: PathLocationStrategy}]
})
export class LatestNewsContainer extends BaseContainer implements AfterViewInit{

    ngOnInit() {
    }

    ngAfterViewInit(): void {

    }
}
