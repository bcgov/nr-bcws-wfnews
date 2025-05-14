import {
  Component,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
} from '@angular/core';
import { RoFPage } from '../rofPage';
import { ReportOfFire } from '../reportOfFireModel';
import { ReportOfFirePage } from '@app/components/report-of-fire/report-of-fire.component';
import { CommonUtilityService } from '@app/services/common-utility.service';

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
    private commonUtilityService: CommonUtilityService,
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
    this.commonUtilityService.pingService().subscribe(
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

  get iconType(): string {
    return this.isFormValid ? 'arrow-forward-enabled' : 'arrow-forward-disabled';
  }

  get isFormValid(): boolean {
    return !!this.reportOfFire.fullName && this.validatePhoneNumber(this.reportOfFire.phoneNumber);
  }

  get buttonClass(): string {
    return this.isFormValid ? 'rof-button-primary' : 'rof-button-disabled';
  }

  nextPage() {
    if (this.reportOfFire.motionSensor !== 'no' && !this.commonUtilityService.checkIfLandscapeMode()) {
      this.next();
    } else {
      this.reportOfFirePage.selectPage('review-page', null, false);
    }
  }
  
}
