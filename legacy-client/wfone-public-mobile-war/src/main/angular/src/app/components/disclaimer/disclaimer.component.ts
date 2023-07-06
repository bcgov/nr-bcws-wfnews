import {AfterViewInit, ChangeDetectionStrategy, Component, OnInit, SimpleChanges, ViewChildren, OnDestroy} from "@angular/core";
import {BaseComponent} from "../base/base.component";
import {DisclaimerComponentModel} from "./disclaimer.component.model";
import {APP_CONFIG_KEYS, WFOnePublicMobileRoutes} from "../../utils";
import { NavigationEnd } from "@angular/router";

@Component({
    selector: 'wfone-disclaimer',
    templateUrl: './disclaimer.component.html',
    styleUrls: ['../base/base.component.scss', './disclaimer.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class DisclaimerComponent extends BaseComponent implements AfterViewInit, OnInit, OnDestroy {
    backRoute = WFOnePublicMobileRoutes.LANDING;
    @ViewChildren('backroute') backroute;
    title = "Disclaimer";
    routerSubscription;

    isHandlerForUrl( url: string ): boolean {
        return url.includes( WFOnePublicMobileRoutes.DISCLAIMER )
    }

    ngOnInit(){
        this.routerSubscription = this.router.events.subscribe((e) => {
            if (e instanceof NavigationEnd && e.urlAfterRedirects.indexOf('disclaimer') !== -1) {
                this.backroute.first.nativeElement.focus();
            }
        });

        super.ngOnInit();
    }

    ngOnDestroy() {
        this.routerSubscription.unsubscribe();
    }


    ngAfterViewInit() {
        if ( this.backroute.first )
            this.backroute.first.nativeElement.focus();
            
        this.eventEmitterService.sideNavAccessLocked(true);
        super.ngAfterViewInit();
    }

    initModels() {
        this.model = new DisclaimerComponentModel(this.sanitizer);
        this.viewModel = new DisclaimerComponentModel(this.sanitizer);
    }

    loadPage() {
        this.updateView();
    }

    getViewModel(): DisclaimerComponentModel {
        return <DisclaimerComponentModel>this.viewModel;
    }

    public onKeydownMain(event): void {
        if (event.shiftKey && event.key === "Tab"){
                 event.preventDefault();
                 this.eventEmitterService.onKeyboardShiftTabPress('disclaimer');
                 this.eventEmitterService.sideNavAccessLocked(false);
         }
    }

    navigateToBackRouteIfMobile(){
        if(this.getIsMobileRes()){
            this.navigateToBackRoute();
        }
    }


}
