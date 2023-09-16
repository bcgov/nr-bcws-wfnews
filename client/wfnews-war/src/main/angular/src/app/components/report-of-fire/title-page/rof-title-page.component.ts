import { Component, ChangeDetectionStrategy, OnInit } from "@angular/core";
import { RoFPage } from "../rofPage";
import { ReportOfFire } from "../reportOfFireModel";
import { MatDialog } from "@angular/material/dialog";
import { DialogLocationComponent } from "@app/components/report-of-fire/dialog-location/dialog-location.component";
import { CommonUtilityService } from "@app/services/common-utility.service";
import { LocationServicesDialogComponent } from "../compass-page/location-services-dialog/location-services-dialog.component";
import { equalsIgnoreCase } from "@app/utils";

interface DeviceOrientationEventiOS extends DeviceOrientationEvent {
  requestPermission?: () => Promise<'granted' | 'denied'>;
}

@Component({
  selector: 'rof-title-page',
  templateUrl: './rof-title-page.component.html',
  styleUrls: ['./rof-title-page.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class RoFTitlePage extends RoFPage implements OnInit {
  public imageUrl: string
  public closeButton: boolean
  public messages: any;
  public offLineMessages: any;
  offLine: boolean = false;

  public constructor(
    protected dialog: MatDialog,
    private commonUtilityService: CommonUtilityService,

    ) {
    super()
  }

  initialize (data: any, index: number, reportOfFire: ReportOfFire) {
    super.initialize(data, index, reportOfFire);
    this.imageUrl = data.imageUrl;
    this.closeButton = data.closeButton;
    this.messages = this.message.split('\n');
    this.offLineMessages = this.offLineMessage.split('\n');
    this.offLine = !window.navigator.onLine;
  }

  ngOnInit() {
    this.getOrientation();
  }

  openCallPage () {
    // not yet implemented
  }


 triggerLocationServiceCheck (){
    this.commonUtilityService.checkLocationServiceStatus().then((enabled) => {
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

  async getOrientation() {
    try{
      const requestPermission = (DeviceOrientationEvent as unknown as DeviceOrientationEventiOS).requestPermission;
      const iOS = typeof requestPermission === 'function';
      if (iOS) {
      const response = await requestPermission();
          if (equalsIgnoreCase(response, "granted")) {
            this.reportOfFire.iosGranted = true;
          } else {
              this.dialog.open(LocationServicesDialogComponent, {
              width: '350px',
              data: {
                message: "Location services are required"
              }
            });
          }
        } else {
          this.reportOfFire.androidGranted = true;
       }
       } catch (err) {
        this.dialog.open(LocationServicesDialogComponent, {
          width: '350px',
          data: {
              message: "Location services are not supported"
          }
        }); 
    } 
  
  }

  
}
