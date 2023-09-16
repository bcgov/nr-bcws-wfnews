import { Component, ChangeDetectionStrategy, ChangeDetectorRef } from "@angular/core";
import { RoFPage } from "../rofPage";
import { ReportOfFire } from "../reportOfFireModel";
import { ReportOfFirePage } from "@app/components/report-of-fire/report-of-fire.component";
import { CommonUtilityService } from "@app/services/common-utility.service";

@Component({
  selector: 'rof-contact-page',
  templateUrl: './rof-contact-page.component.html',
  styleUrls: ['./rof-contact-page.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class RoFContactPage extends RoFPage {
  isEditMode: boolean = false;
  offLine: boolean = false;
  public constructor(
    private reportOfFirePage: ReportOfFirePage,
    private commonUtilityService: CommonUtilityService,
    private cdr: ChangeDetectorRef,
    ) {
    super()
  }

  initialize (data: any, index: number, reportOfFire: ReportOfFire) {
    super.initialize(data, index, reportOfFire);
  }

  editMode() {
    this.isEditMode = true;
  }

  backToReview() {
    this.reportOfFirePage.edit('review-page')
  }

  checkOnlineStatus() {
    this.commonUtilityService.pingSerivce().subscribe(
      () => {
        this.offLine = false;
        this.cdr.detectChanges()
      },
      () => {
        this.offLine = true;
        this.cdr.detectChanges()
      }
    );
  }
}
