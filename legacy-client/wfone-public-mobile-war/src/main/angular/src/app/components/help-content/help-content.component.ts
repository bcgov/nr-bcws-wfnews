import {AfterViewInit, ChangeDetectionStrategy, Component, OnChanges, OnInit, SimpleChanges, ViewChildren} from "@angular/core";
import {BaseComponent} from "../base/base.component";
import {HelpContentComponentModel} from "./help-content.component.model";
import {ParamMap, NavigationEnd} from "@angular/router";
import {APP_CONFIG_KEYS, HELP_CONTENT_TYPES, WFOnePublicMobileRoutes} from "../../utils";

@Component({
    selector: 'wfone-help-content',
    templateUrl: './help-content.component.html',
    styleUrls: ['../base/base.component.scss', './help-content.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class HelpContentComponent extends BaseComponent implements AfterViewInit, OnInit, OnChanges {
    HELP_CONTENT_TYPES = HELP_CONTENT_TYPES;
    backRoute = WFOnePublicMobileRoutes.HELP;
    currentHelpContentType: HELP_CONTENT_TYPES;
    datasetDriveBCUrl: string;
    datasetFireLocationsUrl: string;
    datasetFirePerimeterUrl: string;
    datasetFireCentresUrl: string;
    datasetDangerRatingUrl: string;
    datasetAreaRestrictionsUrl: string;
    datasetRecSitesUrl: string;
    datasetEvacOrdersUrl: string;
    datasetCurrentConditionssUrl: string;
    datasetRadarurpprecipr14Url: string;
    datasetFiresmokeUrl: string;
    datasetProtectedlandrestrictionsUrl: string;
    @ViewChildren ('backroute') backroute;

    ngOnInit() {
        this.route.queryParams.subscribe(
            (params: ParamMap) => {
                if (params) {
                    if (params['type']) {
                        this.currentHelpContentType = HELP_CONTENT_TYPES[params['type']] as HELP_CONTENT_TYPES;
                    }
                    if (params['refererPage']) {
                        this.backRoute = params['refererPage'];
                    }
                }
            }
        );

        var res = this.appConfigService.getAppResourcesConfig()
        this.datasetDriveBCUrl = res.datasetDrivebcUrl
        this.datasetFireLocationsUrl = res.datasetFirelocationsUrl
        this.datasetFirePerimeterUrl = res.datasetFireperimeterUrl
        this.datasetFireCentresUrl = res.datasetFirecentresUrl
        this.datasetDangerRatingUrl = res.datasetDangerratingUrl
        this.datasetAreaRestrictionsUrl = res.datasetArearestrictionsUrl
        this.datasetRecSitesUrl = res.datasetRecsitesUrl
        this.datasetProtectedlandrestrictionsUrl = res.datasetProtectedLandsUrl
        this.datasetEvacOrdersUrl = res.datasetEvacordersUrl
        this.datasetCurrentConditionssUrl = res.datasetCurrentConditionsUrl
        this.datasetRadarurpprecipr14Url = res.datasetRadarurpprecipr14Url
        this.datasetFiresmokeUrl = res.datasetFiresmokeUrl

        this.router.events.subscribe((e) => {
            if (e instanceof NavigationEnd && e.urlAfterRedirects.indexOf('help-content') !== -1) {
                this.backroute.first.nativeElement.focus();
            }
        });
        //super.ngOnInit();
    }

    ngAfterViewInit() {
        if ( this.backroute.first )
            this.backroute.first.nativeElement.focus();

        this.eventEmitterService.sideNavAccessLocked(true);
        super.ngAfterViewInit();
    }

    initModels() {
        this.model = new HelpContentComponentModel(this.sanitizer);
        this.viewModel = new HelpContentComponentModel(this.sanitizer);
    }

    loadPage() {
        this.updateView();
    }

    getViewModel(): HelpContentComponentModel {
        return <HelpContentComponentModel>this.viewModel;
    }

    ngOnChanges(changes: SimpleChanges) {
        super.ngOnChanges(changes);
    }

    showToolbar(): boolean {
        return true;
    }

    getTitle(): string {
        if (this.currentHelpContentType === HELP_CONTENT_TYPES.BANS_PROHIBS) { return 'Bans & Prohibitions'; }
        if (this.currentHelpContentType === HELP_CONTENT_TYPES.OPEN_FIRES_ALL) { return 'Open Burning'; }
        if (this.currentHelpContentType === HELP_CONTENT_TYPES.OPEN_FIRES_CAT2) { return 'Category 2 Open Fires'; }
        if (this.currentHelpContentType === HELP_CONTENT_TYPES.OPEN_FIRES_CAT3) { return 'Category 3 Open Fires'; }
        if (this.currentHelpContentType === HELP_CONTENT_TYPES.CAMP_FIRES) { return 'Campfires'; }
        if (this.currentHelpContentType === HELP_CONTENT_TYPES.WF_MAP) { return 'Wildfire Map'; }
        if (this.currentHelpContentType === HELP_CONTENT_TYPES.DISCLAIMER) { return 'Disclaimer'; }
        if (this.currentHelpContentType === HELP_CONTENT_TYPES.HELP) { return 'Help'; }
        if (this.currentHelpContentType === HELP_CONTENT_TYPES.LATEST_NEWS) { return 'Latest News'; }
        if (this.currentHelpContentType === HELP_CONTENT_TYPES.ADVISORIES) { return 'Current Notices'; }
        if (this.currentHelpContentType === HELP_CONTENT_TYPES.CURRENT_STATS) { return 'Current Stats'; }
        if (this.currentHelpContentType === HELP_CONTENT_TYPES.REPORT_A_FIRE) { return 'Report A Fire'; }
        if (this.currentHelpContentType === HELP_CONTENT_TYPES.WEATHER_INDICES) { return 'Weather Indices'; }
        if (this.currentHelpContentType === HELP_CONTENT_TYPES.FEEDBACK) { return 'Feedback'; }
        return '';
    }

    goToLink(url: string) {
        this.capacitorService.openUrl( url )

        return false;
    }

    public onKeydownMain(event): void {
        if (event.shiftKey && event.key === "Tab"){
                 event.preventDefault();
                 this.eventEmitterService.onKeyboardShiftTabPress('help-content');
                 this.eventEmitterService.sideNavAccessLocked(false);
        }else if (event.keyCode == 13){
            event.preventDefault();
            this.navigateToBackRoute();
        }
    }

}
