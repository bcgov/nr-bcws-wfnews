import {AfterViewInit, ChangeDetectionStrategy, Component, Input, OnInit, SimpleChanges} from "@angular/core";
import {BaseComponent} from "../base/base.component";
import {BansAndProhibitionsComponentModel} from "./bans-and-prohibitions.component.model";
import {VmBanProhibition, VmFireStatus} from "../../conversion/models";
import {loadCurrentBansProhibitions} from "../../store/bans-prohibitions/bans-prohibitions.actions";
import {HELP_CONTENT_TYPES, WFOnePublicMobileRoutes} from "../../utils";


@Component({
    selector: 'wfone-bans-and-prohibitions',
    templateUrl: './bans-and-prohibitions.component.html',
    styleUrls: ['../base/base.component.scss', './bans-and-prohibitions.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class BansAndProhibitionsComponent extends BaseComponent implements AfterViewInit, OnInit {
    @Input() bansProhibitions: VmBanProhibition[];
    backRoute = WFOnePublicMobileRoutes.LANDING;
    title = "Bans & Prohibitions";
    HELP_CONTENT_TYPES = HELP_CONTENT_TYPES;
    ngOnInit() {
        this.store.dispatch(loadCurrentBansProhibitions());
    }

    ngAfterViewInit() {
        super.ngAfterViewInit();
    }

    initModels() {
        this.model = new BansAndProhibitionsComponentModel(this.sanitizer);
        this.viewModel = new BansAndProhibitionsComponentModel(this.sanitizer);
    }

    loadPage() {
        this.updateView();
    }

    getViewModel(): BansAndProhibitionsComponentModel {
        return <BansAndProhibitionsComponentModel>this.viewModel;
    }

    // tslint:disable-next-line:use-life-cycle-interface
    ngOnChanges(changes: SimpleChanges) {
        super.ngOnChanges(changes);

        // console.log("ngOnChanges: ", changes);

        if (changes.bansProhibitions) {
            // console.log('update changes: ', changes.bansProhibitions.currentValue);
            this.bansProhibitions = changes.bansProhibitions.currentValue;
        }
        this.cdr.detectChanges();
    }

    openFireStatusImgPath(fireStatus: VmFireStatus): string {
        if (fireStatus === VmFireStatus.PERMITTED) { return 'assets/images/openfire_ok.gif'; }
        if (fireStatus === VmFireStatus.PROHIBITIONS) { return 'assets/images/openfire_ban.gif'; }
    }

    campfireireStatusImgPath(fireStatus: VmFireStatus): string {
        if (fireStatus === VmFireStatus.PERMITTED) { return 'assets/images/campfire_ok.gif'; }
        if (fireStatus === VmFireStatus.PROHIBITIONS) { return 'assets/images/campfire_ban.gif'; }
    }

    forestUseFireStatusImgPath(fireStatus: VmFireStatus): string {
        if (fireStatus === VmFireStatus.UNRESTRICTED) { return 'assets/images/forest_ok.gif'; }
        if (fireStatus === VmFireStatus.RESTRICTED) { return 'assets/images/forest_restriction.gif'; }
    }

    navigateToBansProhibitionsDetail(banProhibition: VmBanProhibition) {
        // console.log('navigateToBansProhibitionsDetail - 1');
        console.log('navigateToBansProhibitionsDetail url - ' + banProhibition.prohibitionsUrl);

        this.capacitorService.openUrl( banProhibition.prohibitionsUrl )

        // this.router.navigate([WFOnePublicMobileRoutes.BANS_AND_PROHIBITIONS_DETAIL],
        //     {queryParams: { ban_prohibitions_url: banProhibition.prohibitionsUrl }});
        // console.log('navigateToBansProhibitionsDetail - 2');
        return false;
    }

    navigateToHelpContent(definitionType: HELP_CONTENT_TYPES) {
        this.router.navigate([WFOnePublicMobileRoutes.HELP_CONTENT],
            {queryParams: { refererPage: WFOnePublicMobileRoutes.BANS_AND_PROHIBITIONS, type: definitionType }});
        return false;
    }

}
