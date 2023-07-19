import { Component, ChangeDetectionStrategy } from "@angular/core";
import { RoFPage } from "../rofPage";
import { ReportOfFire } from "../reportOfFireModel";

@Component({
  selector: 'rof-location-page',
  templateUrl: './rof-location-page.component.html',
  styleUrls: ['./rof-location-page.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class RoFLocationPage extends RoFPage {
  public constructor() {
    super()
  }

  initialize (data: any, index: number, reportOfFire: ReportOfFire) {
    super.initialize(data, index, reportOfFire)
  }

  setLocation () {
    // the map should trigger this once configured
    this.reportOfFire.estimatedDistance = 0;
    this.reportOfFire.fireLocation = [-112, 50];
  }
}
