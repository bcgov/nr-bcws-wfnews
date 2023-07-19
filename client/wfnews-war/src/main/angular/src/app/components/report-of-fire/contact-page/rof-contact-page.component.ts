import { Component, ChangeDetectionStrategy } from "@angular/core";
import { RoFPage } from "../rofPage";
import { ReportOfFire } from "../reportOfFireModel";

@Component({
  selector: 'rof-contact-page',
  templateUrl: './rof-contact-page.component.html',
  styleUrls: ['./rof-contact-page.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class RoFContactPage extends RoFPage {
  public constructor() {
    super()
  }

  initialize (data: any, index: number, reportOfFire: ReportOfFire) {
    super.initialize(data, index, reportOfFire);
  }
}
