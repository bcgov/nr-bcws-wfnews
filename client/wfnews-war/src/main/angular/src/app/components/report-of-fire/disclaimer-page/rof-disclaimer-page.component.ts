import { Component } from '@angular/core';
import { RoFPage } from '../rofPage';
import { ReportOfFire } from '../reportOfFireModel';
import { CommonUtilityService } from '@app/services/common-utility.service';


@Component({
  selector: 'rof-disclaimer-page',
  templateUrl: './rof-disclaimer-page.component.html',
  styleUrls: ['./rof-disclaimer-page.component.scss']
})
export class RoFDisclaimerPage extends RoFPage {
  public imageUrl: string
  public message: string;
  public currentBrowser: string;
  public hideButtons : boolean;

  public constructor(
    private commonUtilityService: CommonUtilityService,
    ) {
    super();
  }

  initialize (data: any, index: number, reportOfFire: ReportOfFire) {
    super.initialize(data, index, reportOfFire);
    this.imageUrl = data.imageUrl;
    this.message = data.message.split('\n');
    const userAgent = window.navigator.userAgent.toLowerCase();

    // Check for the presence of certain keywords in the user agent to determine the browser
    switch (true) {
      case userAgent.includes('chrome'):
        this.currentBrowser = 'Google Chrome';
        break;
      case userAgent.includes('firefox'):
        this.currentBrowser = 'Mozilla Firefox';
        break;
      case userAgent.includes('safari') && !userAgent.includes('chrome'):
        this.currentBrowser = 'Apple Safari';
        break;
      case userAgent.includes('edge'):
        this.currentBrowser = 'Microsoft Edge';
        break;
      case userAgent.includes('trident') || userAgent.includes('msie'):
        this.currentBrowser = 'Internet Explorer';
        break;
      default:
        this.currentBrowser = 'Unknown Browser';
        break;
    }

    if (this.currentBrowser !== 'Unknown Browser' ) {
      this.commonUtilityService.checkOnline().then((result) => {
        if(!result) {
          this.message = 'Offline reporting is only available in the BC Wildfire Service app which you can find on the Apple App Store or Google Play Store.'
          this.hideButtons = true;
        }
      })
    }
  }
}
