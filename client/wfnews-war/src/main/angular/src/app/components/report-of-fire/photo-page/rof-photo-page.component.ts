import { Component, ChangeDetectionStrategy } from "@angular/core";
import { RoFPage } from "../rofPage";
import { ReportOfFire } from "../reportOfFireModel";

@Component({
  selector: 'rof-photo-page',
  templateUrl: './rof-photo-page.component.html',
  styleUrls: ['./rof-photo-page.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class RoFPhotoPage extends RoFPage {
  public disableNext: boolean = true;
  public constructor() {
    super()
  }

  initialize (data: any, index: number, reportOfFire: ReportOfFire) {
    super.initialize(data, index, reportOfFire)
  }

  takePhoto(){
    console.log('Open Camera');
  }
}
