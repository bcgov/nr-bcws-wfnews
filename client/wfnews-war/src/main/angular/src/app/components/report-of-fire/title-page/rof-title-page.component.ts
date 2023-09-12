import { Component, ChangeDetectionStrategy } from "@angular/core";
import { RoFPage } from "../rofPage";
import { ReportOfFire } from "../reportOfFireModel";
import { MatDialog } from "@angular/material/dialog";
import { DialogLocationComponent } from "@app/components/report-of-fire/dialog-location/dialog-location.component";

@Component({
  selector: 'rof-title-page',
  templateUrl: './rof-title-page.component.html',
  styleUrls: ['./rof-title-page.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class RoFTitlePage extends RoFPage {
  public imageUrl: string
  public closeButton: boolean
  public messages: any;

  public constructor(
    protected dialog: MatDialog,
    ) {
    super()
  }

  initialize (data: any, index: number, reportOfFire: ReportOfFire) {
    super.initialize(data, index, reportOfFire);
    this.imageUrl = data.imageUrl;
    this.closeButton = data.closeButton;
    this.messages = this.message.split('\n');
  }

  openCallPage () {
    // not yet implemented
  }

  checkLocationServiceStatus(): Promise<boolean> {
    return new Promise<boolean>((resolve, reject) => {
      if ('geolocation' in navigator) {
        navigator.geolocation.getCurrentPosition(
          (position) => {
            // Location service is enabled
            resolve(true);
          },
          (error) => {
            // Location service is disabled or the user denied access
            resolve(false);
          }
        );
      } else {
        // Geolocation is not supported by the browser
        resolve(false);
      }
    });
  }

  triggerLocationServiceCheck(){
    this.checkLocationServiceStatus().then((enabled) => {
      if (!enabled) {
        let dialogRef = this.dialog.open(DialogLocationComponent, {
          autoFocus: false,
          width: '80vw',
        });
      }else {
        this.next()
      }
    });
  }
}
