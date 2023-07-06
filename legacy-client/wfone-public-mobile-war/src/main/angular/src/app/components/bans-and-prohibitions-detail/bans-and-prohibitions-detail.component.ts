import {AfterViewInit, ChangeDetectionStrategy, Component, OnInit, SimpleChanges, OnDestroy} from "@angular/core";
import {BaseComponent} from "../base/base.component";
import {BansAndProhibitionsDetailComponentModel} from "./bans-and-prohibitions-detail.component.model";
import {WFOnePublicMobileRoutes} from "../../utils";
import {SafeResourceUrl} from "@angular/platform-browser";
import {ParamMap} from "@angular/router";


@Component({
    selector: 'wfone-bans-and-prohibitions-detail',
    templateUrl: './bans-and-prohibitions-detail.component.html',
    styleUrls: ['../base/base.component.scss', './bans-and-prohibitions-detail.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class BansAndProhibitionsDetailComponent extends BaseComponent implements AfterViewInit, OnInit, OnDestroy {
    // @Input() bansProhibitions: VmBanProhibition[];
    // @ViewChild('iframe') iframe: ElementRef;
    externalUrl: string;
    externalSafeUrl: SafeResourceUrl;
    routerSubscription;

    ngOnInit() {
        // this.externalUrl = 'http://bcfireinfo.for.gov.bc.ca/hprScripts/WildfireNews/DisplayBan.asp?ID=589#OpenFireBans';
        // this.externalSafeUrl = this.sanitizer.bypassSecurityTrustResourceUrl(this.externalUrl);
        this.routerSubscription = this.route.queryParams.subscribe(
            (params: ParamMap) => {
                if (params && params['ban_prohibitions_url']) {
                    // console.log('picked up route query param change: ', params['ban_prohibitions_url']);
                    this.externalUrl = params['ban_prohibitions_url'];
                    this.externalSafeUrl = this.sanitizer.bypassSecurityTrustResourceUrl(this.externalUrl);
                }
            }
        );

    }

    ngOnDestroy() {
        this.routerSubscription.unsubscribe();
    }

    ngAfterViewInit() {
        super.ngAfterViewInit();
    }

    initModels() {
        this.model = new BansAndProhibitionsDetailComponentModel(this.sanitizer);
        this.viewModel = new BansAndProhibitionsDetailComponentModel(this.sanitizer);
    }

    loadPage() {
        this.updateView();
    }

    getViewModel(): BansAndProhibitionsDetailComponentModel {
        return <BansAndProhibitionsDetailComponentModel>this.viewModel;
    }

    // tslint:disable-next-line:use-life-cycle-interface
    ngOnChanges(changes: SimpleChanges) {
        super.ngOnChanges(changes);
    }

    close() {
        this.router.navigate([WFOnePublicMobileRoutes.BANS_AND_PROHIBITIONS]);
    }

}
