import { Component, ChangeDetectionStrategy } from "@angular/core";
import { RoFPage } from "../rofPage";
import { ReportOfFire } from "../reportOfFireModel";

@Component({
  selector: 'rof-comments-page',
  templateUrl: './rof-comments-page.component.html',
  styleUrls: ['./rof-comments-page.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class RoFCommentsPage extends RoFPage {
  public constructor() {
    super()
  }

  initialize (data: any, index: number, reportOfFire: ReportOfFire) {
    super.initialize(data, index, reportOfFire);
  }
}
