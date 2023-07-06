import {AfterViewInit, ChangeDetectionStrategy, Component, OnInit, SimpleChanges, ViewChildren, ElementRef, ViewChild} from "@angular/core";
import {BaseComponent} from "../base/base.component";
import {LatestNewsDetailComponentModel} from "./latest-news-detail.component.model";
import {APP_CONFIG_KEYS, WFOnePublicMobileRoutes} from "../../utils";
import { NavigationEnd, ParamMap } from "@angular/router";

@Component({
    selector: 'wfone-latest-news-detail',
    templateUrl: './latest-news-detail.component.html',
    styleUrls: ['../base/base.component.scss', './latest-news-detail.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class LatestNewsDetailComponent extends BaseComponent implements AfterViewInit, OnInit {
    backRoute = WFOnePublicMobileRoutes.LATEST_NEWS;
    title = "Latest News Detail";
    @ViewChildren('twitterFeed') twitterFeed;

    twitterProfileName: string;
    twitterTimelineUrl: string;

    isHandlerForUrl( url: string ): boolean {
        return url.includes( WFOnePublicMobileRoutes.LATEST_NEWS_DETAIL )
    }

    ngOnInit() {
        this.twitterProfileName = this.appConfigService.getAppResourcesConfig().twitterFeedProfileName
        // console.log('this.twitterProfileName: ' + this.twitterProfileName);
        //this.twitterTimelineUrl = 'https://twitter.com/' + this.twitterProfileName+'/status/1275138569867128833' + '?ref_src=twsrc%5Etfw';
        // console.log('this.twitterTimelineUrl: ' + this.twitterTimelineUrl);

        
        this.router.events.subscribe((e) => {
            if (e instanceof NavigationEnd && e.urlAfterRedirects.indexOf('latest-news-detail') !== -1) {
                this.twitterFeed.first.nativeElement.focus();
            }
        });

        this.route.queryParams.subscribe((params: ParamMap) => {
          if(params['tweetId']){
            this.twitterTimelineUrl = 'https://twitter.com/' + this.twitterProfileName+'/status/'+params['tweetId'] + '?ref_src=twsrc%5Etfw';
          }
        });
        super.ngOnInit();
    }

    ngAfterViewInit() {
        this.twitterFeed.first.nativeElement.focus();
        this.eventEmitterService.sideNavAccessLocked(true);
        super.ngAfterViewInit();
        (<any>window).twttr.widgets.load();
    }

    initModels() {
        this.model = new LatestNewsDetailComponentModel(this.sanitizer);
        this.viewModel = new LatestNewsDetailComponentModel(this.sanitizer);
    }

    loadPage() {
        this.updateView();
    }

    getViewModel(): LatestNewsDetailComponentModel {
        return <LatestNewsDetailComponentModel>this.viewModel;
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
