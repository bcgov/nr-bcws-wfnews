import { Component, ChangeDetectionStrategy } from '@angular/core';
import { RoFPage } from '../rofPage';
import { ReportOfFire } from '../reportOfFireModel';
import { ReportOfFirePage } from '@app/components/report-of-fire/report-of-fire.component';
import { CommonUtilityService } from '@app/services/common-utility.service';

@Component({
  selector: 'rof-permissions-page',
  templateUrl: './rof-permissions-page.component.html',
  styleUrls: ['./rof-permissions-page.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class RoFPermissionsPage extends RoFPage {
  public dataShareAccepted = false;

  public constructor(
    private reportOfFirePage: ReportOfFirePage,
    private commonUtilityService: CommonUtilityService
  ) {
    super();
  }

  initialize(data: any, index: number, reportOfFire: ReportOfFire) {
    super.initialize(data, index, reportOfFire);
  }

  dataShareAcceptedToggle(event: boolean) {
    this.dataShareAccepted = event;
  }

  nextPage() {
    if (this.isMotionSensorActive()  && !this.commonUtilityService.checkIfLandscapeMode()) {
      this.reportOfFire.headingDetectionActive = true;
      this.next();
    } else {
      this.reportOfFirePage.selectPage('distance-page', null, false);
      this.reportOfFirePage.currentStep++;
    }
  }

  isMotionSensorActive(): boolean {
    return this.reportOfFire.motionSensor === 'yes';
  }
}
