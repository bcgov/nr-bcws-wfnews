import { Component } from '@angular/core';
import { RoFPage } from '../rofPage';
import { ReportOfFire } from '../reportOfFireModel';
import { CommonUtilityService } from '@app/services/common-utility.service';
import { CapacitorService } from '@app/services/capacitor-service';

@Component({
  selector: 'rof-disclaimer-page',
  templateUrl: './rof-disclaimer-page.component.html',
  styleUrls: ['./rof-disclaimer-page.component.scss'],
})
export class RoFDisclaimerPage extends RoFPage {
  public imageUrl: string;
  public message: string;
  public currentBrowser: string;
  public hideButtons: boolean;

  public constructor(
    private commonUtilityService: CommonUtilityService,
    private capacitor: CapacitorService,
  ) {
    super();
  }

  initialize(data: any, index: number, reportOfFire: ReportOfFire) {
    super.initialize(data, index, reportOfFire);
    this.imageUrl = data.imageUrl;
    this.message = data.message.split('\n');

    if (this.capacitor.isWebPlatform) {
      this.commonUtilityService.checkOnline().then((result) => {
        if (!result) {
          this.message =
            'Offline reporting is only available in the BC Wildfire Service app which you can find on the Apple App Store or Google Play Store.';
          this.hideButtons = true;
        }
      });
    }
  }
}
