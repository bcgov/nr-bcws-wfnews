import {AfterViewInit, ChangeDetectionStrategy, Component, OnInit, SimpleChanges, ViewChildren, OnDestroy} from "@angular/core";
import {BaseComponent} from "../base/base.component";
import {LatestNewsComponentModel} from "./latest-news.component.model";
import {APP_CONFIG_KEYS, WFOnePublicMobileRoutes} from "../../utils";
import { NavigationEnd } from "@angular/router";

@Component({
    selector: 'wfone-latest-news',
    templateUrl: './latest-news.component.html',
    styleUrls: ['../base/base.component.scss', './latest-news.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class LatestNewsComponent extends BaseComponent implements AfterViewInit, OnInit, OnDestroy {
    backRoute = WFOnePublicMobileRoutes.LANDING;
    title = "Latest News";
    @ViewChildren('twitterFeed') twitterFeed;
    routeSubscription;

    twitterProfileName: string;
    twitterTimelineUrl: string;

    isHandlerForUrl( url: string ): boolean {
        return url.includes( WFOnePublicMobileRoutes.LATEST_NEWS )
    }

    ngOnInit() {
        this.twitterProfileName = this.appConfigService.getAppResourcesConfig().twitterFeedProfileName
        // console.log('this.twitterProfileName: ' + this.twitterProfileName);
        this.twitterTimelineUrl = 'https://twitter.com/' + this.twitterProfileName + '?ref_src=twsrc%5Etfw';
        // console.log('this.twitterTimelineUrl: ' + this.twitterTimelineUrl);
        this.routeSubscription = this.router.events.subscribe((e) => {
            if (e instanceof NavigationEnd && e.urlAfterRedirects.indexOf('latest-news') !== -1) {
                this.twitterFeed.first.nativeElement.focus();
            }
        });
        super.ngOnInit();
    }

    ngOnDestroy() {
        this.routeSubscription.unsubscribe();
    }

    ngAfterViewInit() {
        this.twitterFeed.first.nativeElement.focus();
        this.eventEmitterService.sideNavAccessLocked(true);
        super.ngAfterViewInit();
        (<any>window).twttr.widgets.load();
    }

    initModels() {
        this.model = new LatestNewsComponentModel(this.sanitizer);
        this.viewModel = new LatestNewsComponentModel(this.sanitizer);
    }

    loadPage() {
        this.updateView();
    }

    getViewModel(): LatestNewsComponentModel {
        return <LatestNewsComponentModel>this.viewModel;
    }

    ngOnChanges(changes: SimpleChanges) {
        super.ngOnChanges(changes);
    }

    public onKeydownMain(event): void {
        if (event.shiftKey && event.key === "Tab"){
                 event.preventDefault();
                 this.eventEmitterService.onKeyboardShiftTabPress('latest-news');
                 this.eventEmitterService.sideNavAccessLocked(false);
         }
    }

    getIsMobileRes(): boolean {
        return super.getIsMobileRes();
    }


}
