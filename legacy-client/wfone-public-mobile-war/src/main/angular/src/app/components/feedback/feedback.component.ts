import {AfterViewInit, ChangeDetectionStrategy, Component, OnInit, SimpleChanges, ViewChildren, OnDestroy} from "@angular/core";
import {BaseComponent} from "../base/base.component";
import {FeedbackComponentModel} from "./feedback.component.model";
import {APP_CONFIG_KEYS, CONSTANTS, WFOnePublicMobileRoutes} from "../../utils";
import { NavigationEnd } from "@angular/router";

@Component({
    selector: 'wfone-feedback',
    templateUrl: './feedback.component.html',
    styleUrls: ['../base/base.component.scss', './feedback.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class FeedbackComponent extends BaseComponent implements AfterViewInit, OnInit, OnDestroy {
    @ViewChildren('accessFocusPoint') accessFocusPoint;
    twitterIcon = CONSTANTS.MAT_ICON_CUSTOM_TWITTER;
    fbIcon = CONSTANTS.MAT_ICON_CUSTOM_FACEBOOK;
    private twitterProfileUrl: string;
    private fbProfileUrl: string;
    twitterFeedProfileName: string;
    feedbackEmail: string;
    feedbackEmailHref: string;
    fireInfoPhone: string;
    fireInfoPhoneHref: string;
    burnRegistrationPhone: string;
    burnRegistrationPhoneHref: string;
    backRoute = WFOnePublicMobileRoutes.LANDING;
    title = "Feedback";
    routeSubscription;

    isHandlerForUrl( url: string ): boolean {
        return url.includes( WFOnePublicMobileRoutes.FEEDBACK )
    }

    ngOnInit() {
        console.log(this.applicationStateService.getIsMobileResolution());
        var res = this.appConfigService.getAppResourcesConfig()
        this.twitterFeedProfileName = '@' + res.twitterFeedProfileName
        this.twitterProfileUrl = res.twitterProfileUrl
        this.fbProfileUrl = res.fbProfileUrl
        this.feedbackEmail = res.feedbackEmail
        this.feedbackEmailHref = 'mailto:' + this.feedbackEmail;
        this.fireInfoPhone = res.fireInfoPhone
        this.fireInfoPhoneHref = 'tel:' + this.fireInfoPhone.replace(/\-/g, '');
        this.burnRegistrationPhone = res.burnRegistrationPhone
        this.burnRegistrationPhoneHref = 'tel:' + this.burnRegistrationPhone.replace(/\-/g, '');
        this.routeSubscription = this.router.events.subscribe((e) => {
            if (e instanceof NavigationEnd && e.urlAfterRedirects.indexOf('feedback') !== -1) {
                this.accessFocusPoint.first.nativeElement.focus();
            }
        });
        super.ngOnInit();
    }

    ngOnDestroy() {
        this.routeSubscription.unsubscribe();
    }

    ngAfterViewInit() {
        this.accessFocusPoint.first.nativeElement.focus();
        this.eventEmitterService.sideNavAccessLocked(true);
        super.ngAfterViewInit();
    }

    initModels() {
        this.model = new FeedbackComponentModel(this.sanitizer);
        this.viewModel = new FeedbackComponentModel(this.sanitizer);
    }

    loadPage() {
        this.updateView();
    }

    getViewModel(): FeedbackComponentModel {
        return <FeedbackComponentModel>this.viewModel;
    }

    ngOnChanges(changes: SimpleChanges) {
        super.ngOnChanges(changes);
    }

    public onKeydownMain(event): void {
        if (event.shiftKey && event.key === "Tab"){
                 event.preventDefault();
                 this.eventEmitterService.onKeyboardShiftTabPress('feedback');
                 this.eventEmitterService.sideNavAccessLocked(false);
         }
    }

    openFBPage(): boolean {
        this.capacitorService.openUrl( this.fbProfileUrl )

        return false;
    }

    openTwitterPage(): boolean {
        console.log('open twitter page - 1');

        this.capacitorService.openUrl( this.twitterProfileUrl, true )

        return false;
    }
}
