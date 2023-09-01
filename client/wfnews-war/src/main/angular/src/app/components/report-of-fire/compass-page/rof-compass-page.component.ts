import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';
import { RoFPage } from "../rofPage";
import { ReportOfFire } from '../reportOfFireModel';
import { CommonUtilityService } from "../../../services/common-utility.service";
import { MatDialog } from '@angular/material/dialog';
import { LocationServicesDialogComponent } from './location-services-dialog/location-services-dialog.component';

interface DeviceOrientationEventiOS extends DeviceOrientationEvent {
  requestPermission?: () => Promise<'granted' | 'denied'>;
}

@Component({
  selector: 'rof-compass-page',
  templateUrl: './rof-compass-page.component.html',
  styleUrls: ['./rof-compass-page.component.scss'],
  changeDetection: ChangeDetectionStrategy.Default
})
export class RoFCompassPage extends RoFPage implements OnInit {
  public compassFaceUrl: string
  public compassHandUrl: string
  public compassHeading: number;
  public currentLat: number
  public currentLong: number
  public heading: string = "0° N";
  public locationSupported: boolean = false;

  constructor(private commonUtilityService: CommonUtilityService,
              protected dialog: MatDialog) {
    super();
  }
  
initialize (data: any, index: number, reportOfFire: ReportOfFire) {
    super.initialize(data, index, reportOfFire);
    this.compassFaceUrl = data.compassFaceUrl;
    this.compassHandUrl = data.compassHandUrl;   
  }

ngOnInit(): void {
  this.getOrientation(); 
  this.useMyCurrentLocation();
}

async getOrientation() {
  try{
    const requestPermission = (DeviceOrientationEvent as unknown as DeviceOrientationEventiOS).requestPermission;
    const iOS = typeof requestPermission === 'function';
    if (iOS) {
    const response = await requestPermission();
        if (response === "granted") {
          window.addEventListener("deviceorientation", this.handler, true);
        } else {
            this.dialog.open(LocationServicesDialogComponent, {
            width: '350px',
            data: {
              message: "Location services are required"
            }
          });
        }
      } else {
          window.addEventListener("deviceorientationabsolute", this.handler, true);
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

handler(e) {
  let compassHeading = e.webkitCompassHeading || Math.abs(e.alpha - 360);
    compassHeading = Math.trunc(compassHeading)
    let cardinalDirection = ""

    if ((compassHeading >= 0 && compassHeading <= 22) || (compassHeading >= 337 && compassHeading <= 360)) {
      cardinalDirection = "N"
    }else if (compassHeading >= 23 && compassHeading <= 66) {
      cardinalDirection = "NE"
    }else if (compassHeading >= 67 && compassHeading <= 112) {
      cardinalDirection = "E"  
    }else if (compassHeading >= 113 && compassHeading <= 157) {
      cardinalDirection = "SE"
    }else if (compassHeading >= 158 && compassHeading <= 202) {
      cardinalDirection = "SW"
    }else if (compassHeading >= 203 && compassHeading <= 246) {
      cardinalDirection = "S"
    }else if (compassHeading >= 247 && compassHeading <= 292) {
      cardinalDirection = "W"
    }else if (compassHeading >= 293 && compassHeading <= 336) {
      cardinalDirection = "NW"
    }

    document.getElementById("compass-face-image").style.transform = `rotate(${-compassHeading}deg)`;
    document.getElementById("compass-heading").innerText = compassHeading.toString() + "° " + cardinalDirection;

    this.reportOfFire.compassHeading = compassHeading;

}

async useMyCurrentLocation() {

  const location = await this.commonUtilityService.getCurrentLocationPromise()
  if (location) {
    this.currentLat = Number(location.coords.latitude);
    this.currentLong = Number(location.coords.longitude);
  }
  
}

}
