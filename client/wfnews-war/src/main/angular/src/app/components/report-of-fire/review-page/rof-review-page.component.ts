import { Component, ChangeDetectionStrategy } from "@angular/core";
import { RoFPage } from "../RoFPage";
import { ReportOfFire } from "../reportOfFireModel";

@Component({
  selector: 'rof-review-page',
  templateUrl: './rof-review-page.component.html',
  styleUrls: ['./rof-review-page.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class RoFReviewPage extends RoFPage {
  public constructor() {
    super()
  }

  initialize (data: any, index: number, reportOfFire: ReportOfFire) {
    super.initialize(data, index, reportOfFire);

    console.log(reportOfFire);
  }

  parseJson () {
    return JSON.stringify(this.reportOfFire);
  }
}
