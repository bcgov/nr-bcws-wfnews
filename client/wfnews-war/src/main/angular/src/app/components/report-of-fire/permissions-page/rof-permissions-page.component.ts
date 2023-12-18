import { Component, ChangeDetectionStrategy } from '@angular/core';
import { RoFPage } from '../rofPage';
import { ReportOfFire } from '../reportOfFireModel';

@Component({
  selector: 'rof-permissions-page',
  templateUrl: './rof-permissions-page.component.html',
  styleUrls: ['./rof-permissions-page.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class RoFPermissionsPage extends RoFPage {
  public dataShareAccepted = false;

  public constructor() {
    super();
  }

  initialize(data: any, index: number, reportOfFire: ReportOfFire) {
    super.initialize(data, index, reportOfFire);
  }

  dataShareAcceptedToggle(event: boolean) {
    this.dataShareAccepted = event;
  }
}
