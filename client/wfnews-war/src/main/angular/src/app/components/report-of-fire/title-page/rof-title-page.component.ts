import { Component, ChangeDetectionStrategy } from "@angular/core";
import { RoFPage } from "../RoFPage";
import { ReportOfFire } from "../reportOfFireModel";

@Component({
  selector: 'rof-title-page',
  templateUrl: './rof-title-page.component.html',
  styleUrls: ['./rof-title-page.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class RoFTitlePage extends RoFPage {
  public imageUrl: string
  public closeButton: boolean

  public constructor() {
    super()
  }

  initialize (data: any, index: number, reportOfFire: ReportOfFire) {
    super.initialize(data, index, reportOfFire);
    this.imageUrl = data.imageUrl;
    this.closeButton = data.closeButton;
  }

  openCallPage () {
    // not yet implemented
  }
}
