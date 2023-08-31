import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';
import { RoFPage } from "../rofPage";
import { ReportOfFire } from '../reportOfFireModel';
import { CommonUtilityService } from "../../../services/common-utility.service";
import { CapacitorService } from "../../../services/capacitor-service";

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
  public currentLat: number
  public currentLong: number
  public heading: string = "0° N";

  constructor(private commonUtilityService: CommonUtilityService,
    private capacitorService: CapacitorService) {
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

getOrientation() {
  if (this.capacitorService.isIOSPlatform) {
    (DeviceOrientationEvent as any).requestPermission()
      .then((response) => {
        if (response === "granted") {
          window.addEventListener("deviceorientation", this.handler, true);
        } else {
          alert("has to be allowed!");
        }
      })
      .catch(() => alert("not supported"));
  } else {
    window.addEventListener("deviceorientationabsolute", this.handler, true);
  }

}

handler(e) {
  var compassHeading = e.webkitCompassHeading || Math.abs(e.alpha - 360);
    compassHeading = Math.trunc(compassHeading)
    var polarDirection = ""

    if ((compassHeading >= 0 && compassHeading <= 22) || (compassHeading >= 337 && compassHeading <= 360)) {
      polarDirection = "N"
    }else if (compassHeading >= 23 && compassHeading <= 66) {
      polarDirection = "NE"
    }else if (compassHeading >= 67 && compassHeading <= 112) {
      polarDirection = "E"  
    }else if (compassHeading >= 113 && compassHeading <= 157) {
      polarDirection = "SE"
    }else if (compassHeading >= 158 && compassHeading <= 202) {
      polarDirection = "SW"
    }else if (compassHeading >= 203 && compassHeading <= 246) {
      polarDirection = "S"
    }else if (compassHeading >= 247 && compassHeading <= 292) {
      polarDirection = "W"
    }else if (compassHeading >= 293 && compassHeading <= 336) {
      polarDirection = "NW"
    }

    document.getElementById("compass-face-image").style.transform = `rotate(${-compassHeading}deg)`;
    document.getElementById("compass-heading").innerText = compassHeading.toString() + "° " + polarDirection;

}

async useMyCurrentLocation() {

  const location = await this.commonUtilityService.getCurrentLocationPromise()
  if (location) {
    this.currentLat = Number(location.coords.latitude);
    this.currentLong = Number(location.coords.longitude);
  }
  
}

}
