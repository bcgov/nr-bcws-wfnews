import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';
import { RoFPage } from "../rofPage";
import { ReportOfFire } from '../reportOfFireModel';
import { CommonUtilityService } from "../../../services/common-utility.service";
import { MatDialog } from '@angular/material/dialog';
import { LocationServicesDialogComponent } from './location-services-dialog/location-services-dialog.component';
import { equalsIgnoreCase } from '../../../utils';

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
  public compassHeading: number = 0;
  public currentLat: string;
  public currentLong: string;
  public heading: string = "0° N";
  public locationSupported: boolean = false;
  equalsIgnoreCase = equalsIgnoreCase; 

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
  if ( typeof( DeviceMotionEvent ) !== "undefined") {
    this.getOrientation();
    this.useMyCurrentLocation();
  } else {
    this.skip()
  }
}

async getOrientation() {
  try{
    let self = this;
    const requestPermission = (DeviceOrientationEvent as unknown as DeviceOrientationEventiOS).requestPermission;
    const iOS = typeof requestPermission === 'function';
    if (iOS) {
    const response = await requestPermission();
        if (equalsIgnoreCase(response, "granted")) {
          window.addEventListener("deviceorientation", (function(compass) {
            return function(e) {self.handler(e, compass); };
        }) (self), true);
        } else {
            this.dialog.open(LocationServicesDialogComponent, {
            width: '350px',
            data: {
              message: "Location services are required"
            }
          });
        }
      } else {
        window.addEventListener("deviceorientationabsolute", (function(compass) {
          return function(e) {self.handler(e, compass); };
      }) (self), true);
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

handler(e, self) {
  if (self.reportOfFire?.headingDetectionActive){
    try {
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
        cardinalDirection = "S"
      }else if (compassHeading >= 203 && compassHeading <= 246) {
        cardinalDirection = "SW"
      }else if (compassHeading >= 247 && compassHeading <= 292) {
        cardinalDirection = "W"
      }else if (compassHeading >= 293 && compassHeading <= 336) {
        cardinalDirection = "NW"
      }
  
      if (document.getElementById("compass-face-image")) document.getElementById("compass-face-image").style.transform = `rotate(${-compassHeading}deg)`;
      if (document.getElementById("compass-heading")) document.getElementById("compass-heading").innerText = compassHeading.toString() + "° " + cardinalDirection;
  
      self.reportOfFire.compassHeading = compassHeading;
  
      this.useMyCurrentLocation();
  
      this.reportOfFire = self.reportOfFire;
  
    } catch(err) {
      console.error('Could not set compass heading', err)
    }
  }
    
}

async useMyCurrentLocation(){
  try {
    const location = await this.commonUtilityService.getCurrentLocationPromise()
    if (location) {   
      this.currentLat = this.formatDDM(Number(location.coords.latitude));
      this.currentLong = this.formatDDM(Number(location.coords.longitude));
    }

    if (document.getElementById("location")) document.getElementById("location").innerText = this.currentLat + "," + this.currentLong;
  } catch(err){
    console.error('Could not find current location', err)
  }
  
}

confirmHeading() {
  try{
    this.reportOfFire.headingDetectionActive = false;
    this.next();
  } catch(err){
    console.error('Could not confirm heading', err)
  }

}

formatDDM(decimal: number){
  decimal = Math.abs(decimal);
  let d = Math.abs(Math.trunc(decimal));
  return d + "° " + (60 * (decimal - d)).toFixed(3) + "'";
}
 

}