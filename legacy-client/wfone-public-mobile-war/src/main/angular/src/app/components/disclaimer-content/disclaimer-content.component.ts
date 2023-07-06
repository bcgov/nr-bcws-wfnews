
import {
    AfterViewInit,
    ChangeDetectionStrategy,
    ChangeDetectorRef,
    Component, ComponentFactoryResolver,
    OnInit,
    SimpleChanges
} from "@angular/core";
import {DomSanitizer} from "@angular/platform-browser";
import { CONSTANTS } from "src/app/utils";
import {AppConfigService} from "../../services/app-config.service";

import {CapacitorService} from "../../services/capacitor-service";

@Component({
    selector: 'wfone-disclaimer-content',
    templateUrl: './disclaimer-content.component.html',
    styleUrls: ['../base/base.component.scss', './disclaimer-content.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class DisclaimerContentComponent implements OnInit {
    twitterIcon = CONSTANTS.MAT_ICON_CUSTOM_TWITTER;
    facebookIcon = CONSTANTS.MAT_ICON_CUSTOM_FACEBOOK;
    webNavigateIcon = CONSTANTS.ICON_WEB_NAVIGATE;
    dataCatalogueUrl: string;
    fireDangerRatingUrl: string;
    fireTrackingUrl: string;
    hazardAssessmentUrl: string;
    prescribedBurningUrl: string;
    fireWeatherUrl: string;
    prohibitionsUrl: string;

    constructor(
        protected appConfigService: AppConfigService,
        protected capacitorService: CapacitorService
    ) {}

    ngOnInit() {
        let res = this.appConfigService.getAppResourcesConfig()
        this.dataCatalogueUrl = res.dataCatalogueUrl
        this.fireDangerRatingUrl = res.fireDangerRatingUrl
        this.fireTrackingUrl = res.fireTrackingUrl
        this.hazardAssessmentUrl = res.hazardAssessmentUrl
        this.prescribedBurningUrl = res.prescribedBurningUrl
        this.fireWeatherUrl = res.fireWeatherUrl
        this.prohibitionsUrl = res.prohibitionsRestrictionAdvisories
    }

    goToLink(url: string) {
        this.capacitorService.openUrl( url )

        return false;
    }

}
