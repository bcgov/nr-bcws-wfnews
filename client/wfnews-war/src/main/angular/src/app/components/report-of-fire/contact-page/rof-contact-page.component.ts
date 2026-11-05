import {
  Component,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
} from '@angular/core';
import { RoFPage } from '../rofPage';
import { ReportOfFire } from '../reportOfFireModel';
import { ReportOfFirePage } from '@app/components/report-of-fire/report-of-fire.component';
import { ConnectivityService } from '@app/services/connectivity.service';
import { checkIfLandscapeMode } from '@app/utils/device';

@Component({
  selector: 'rof-contact-page',
  templateUrl: './rof-contact-page.component.html',
  styleUrls: ['./rof-contact-page.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class RoFContactPage extends RoFPage {
  isEditMode = false;
  offLine = false;
  public constructor(
    private reportOfFirePage: ReportOfFirePage,
    private connectivityService: ConnectivityService,
    private cdr: ChangeDetectorRef,
  ) {
    super();
  }

  initialize(data: any, index: number, reportOfFire: ReportOfFire) {
    super.initialize(data, index, reportOfFire);
    this.offLine = !window.navigator.onLine;
  }

  editMode() {
    this.isEditMode = true;
  }

  backToReview() {
    this.reportOfFirePage.edit('review-page');
  }

  checkOnlineStatus() {
    this.connectivityService.pingService().subscribe(
      () => {
        this.offLine = false;
        this.cdr.detectChanges();
      },
      () => {
        this.offLine = true;
        this.cdr.detectChanges();
      },
    );
  }

  validatePhoneNumber(value): boolean {
    return !!value && value.toString().length === 10;
  }


  get isFormValid(): boolean {
    return !!this.reportOfFire.fullName && this.validatePhoneNumber(this.reportOfFire.phoneNumber);
  }


  nextPage() {
    if (this.reportOfFire.motionSensor !== 'no' && !checkIfLandscapeMode()) {
      this.next();
    } else {
      this.reportOfFirePage.selectPage('review-page', null, false);
    }
  }
  
}
