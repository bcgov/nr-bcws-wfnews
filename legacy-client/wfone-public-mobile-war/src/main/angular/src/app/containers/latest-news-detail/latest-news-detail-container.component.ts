import {BaseContainer} from "../base/base-container.component";
import {AfterViewInit, Component} from "@angular/core";
import {Location, LocationStrategy, PathLocationStrategy} from "@angular/common";


@Component({
    selector: 'latest-news-detail-container',
    template: `
        <wfone-latest-news-detail
        ></wfone-latest-news-detail>`,
    providers: [Location, {provide: LocationStrategy, useClass: PathLocationStrategy}]
})
export class LatestNewsDetailContainer extends BaseContainer implements AfterViewInit{

    ngOnInit() {
    }

    ngAfterViewInit(): void {

    }
}
