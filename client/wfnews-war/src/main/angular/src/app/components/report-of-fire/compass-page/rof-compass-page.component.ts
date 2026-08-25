import {
  ChangeDetectionStrategy,
  Component,
  OnDestroy,
  OnInit,
} from '@angular/core';
import { RoFPage } from '../rofPage';
import { ReportOfFire } from '../reportOfFireModel';
import { CommonUtilityService } from '../../../services/common-utility.service';
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
  changeDetection: ChangeDetectionStrategy.Default,
})
export class RoFCompassPage extends RoFPage implements OnInit, OnDestroy {
  public compassFaceUrl: string;
  public compassHandUrl: string;
  public compassHeading = 0;
  public currentLat: string;
  public currentLong: string;
  public heading = '0° N';
  public locationSupported = false;
  private orientationListener: (e: DeviceOrientationEvent) => void;
  equalsIgnoreCase = equalsIgnoreCase;

  constructor(
    private commonUtilityService: CommonUtilityService,
    protected dialog: MatDialog,
  ) {
    super();
  }

  isLandscapeMode(): boolean {
    return this.commonUtilityService.checkIfLandscapeMode();
  }

  initialize(data: any, index: number, reportOfFire: ReportOfFire) {
    super.initialize(data, index, reportOfFire);
    this.compassFaceUrl = data.compassFaceUrl;
    this.compassHandUrl = data.compassHandUrl;
  }

  ngOnInit(): void {
    // Nothing here. The wizard builds every page at the start, so a sensor started
    // here keeps running, and its skip() moves a page the user is reading.
  }

  ngOnDestroy(): void {
    this.onHidden();
  }

  onShown(): void {
    this.getOrientation();
    this.useMyCurrentLocation();
  }

  onHidden(): void {
    if (!this.orientationListener) {
      return;
    }
    window.removeEventListener(
      'deviceorientationabsolute',
      this.orientationListener,
      true,
    );
    window.removeEventListener(
      'deviceorientation',
      this.orientationListener,
      true,
    );
    this.orientationListener = null;
  }

  async getOrientation() {
    try {
      const self = this;
      const requestPermission = (
        DeviceOrientationEvent as unknown as DeviceOrientationEventiOS
      ).requestPermission;
      const iOS = typeof requestPermission === 'function';
      this.orientationListener = (e: DeviceOrientationEvent) =>
        this.handler(e, self);
      if (iOS) {
        const response = await requestPermission();
        if (equalsIgnoreCase(response, 'granted')) {
          window.addEventListener(
            'deviceorientation',
            this.orientationListener,
            true,
          );
        } else {
          this.dialog.open(LocationServicesDialogComponent, {
            width: '350px',
            data: {
              message: 'Location services are required',
            },
          });
        }
      } else {
        window.addEventListener(
          'deviceorientationabsolute',
          this.orientationListener,
          true,
        );
      }
    } catch (err) {
      this.dialog.open(LocationServicesDialogComponent, {
        width: '350px',
        data: {
          message: 'Location services are not supported',
        },
      });
    }
  }

  handler(e, self) {
    // Only the page on screen may move the wizard, and only while it reads the sensor.
    if (!self.reportOfFire?.headingDetectionActive) {
      return;
    }
    if (this.commonUtilityService.checkIfLandscapeMode()) {
      this.skip();
      return;
    }
    // A heading of exactly 0 is a true north reading, not a missing sensor.
    if (e.alpha == null && e.webkitCompassHeading == null) {
      this.reportOfFire.motionSensor = 'no';
      this.skip();
      return;
    } else {
      this.reportOfFire.motionSensor = 'yes';
    }

    try {
      let compassHeading = e.webkitCompassHeading || Math.abs(e.alpha - 360);
      compassHeading = Math.trunc(compassHeading);
      let cardinalDirection = '';

      if (
        (compassHeading >= 0 && compassHeading <= 22) ||
        (compassHeading >= 337 && compassHeading <= 360)
      ) {
        cardinalDirection = 'N';
      } else if (compassHeading >= 23 && compassHeading <= 66) {
        cardinalDirection = 'NE';
      } else if (compassHeading >= 67 && compassHeading <= 112) {
        cardinalDirection = 'E';
      } else if (compassHeading >= 113 && compassHeading <= 157) {
        cardinalDirection = 'SE';
      } else if (compassHeading >= 158 && compassHeading <= 202) {
        cardinalDirection = 'S';
      } else if (compassHeading >= 203 && compassHeading <= 246) {
        cardinalDirection = 'SW';
      } else if (compassHeading >= 247 && compassHeading <= 292) {
        cardinalDirection = 'W';
      } else if (compassHeading >= 293 && compassHeading <= 336) {
        cardinalDirection = 'NW';
      }

      // Bind these. Writing the DOM here as well made the two values fight, and
      // the text flashed between the reading and the one Angular held.
      this.compassHeading = compassHeading;
      this.heading = compassHeading.toString() + '° ' + cardinalDirection;

      self.reportOfFire.compassHeading = compassHeading;
      this.reportOfFire = self.reportOfFire;
    } catch (err) {
      console.error('Could not set compass heading', err);
    }
  }

  async useMyCurrentLocation() {
    try {
      const location =
        await this.commonUtilityService.getPositionIfPermitted();
      if (location) {
        this.currentLat = this.commonUtilityService.formatDDM(
          Number(location.coords.latitude),
        );
        this.currentLong = this.commonUtilityService.formatDDM(
          Number(location.coords.longitude),
        );
      }
    } catch (err) {
      console.error('Could not find current location', err);
    }
  }

  confirmHeading() {
    try {
      this.reportOfFire.headingDetectionActive = false;
      this.next();
    } catch (err) {
      console.error('Could not confirm heading', err);
    }
  }

  checkIfLandscapeMode() {
    if (window.innerWidth > window.innerHeight) {
      return true;
    } else {
      return false;
    }
  }
}
