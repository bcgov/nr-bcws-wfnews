import { Component, ChangeDetectionStrategy } from "@angular/core";
import { RoFPage } from "../rofPage";
import { ReportOfFire } from "../reportOfFireModel";
import { ReportOfFirePage } from "@app/components/report-of-fire/report-of-fire.component";

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
    private reportOfFirePage: ReportOfFirePage
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
}
