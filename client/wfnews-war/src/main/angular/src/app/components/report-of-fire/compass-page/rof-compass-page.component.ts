import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  NgZone,
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
  // The sensor fires ~60Hz. Recomputing this per event, and again on every change
  // detection pass from the template, read window dimensions each time and forced
  // a layout. Cache it and refresh only when the viewport actually changes.
  private landscapeMode = false;
  private viewportListener: () => void;
  equalsIgnoreCase = equalsIgnoreCase;

  constructor(
    private commonUtilityService: CommonUtilityService,
    protected dialog: MatDialog,
    private zone: NgZone,
    private cdr: ChangeDetectorRef,
  ) {
    super();
  }

  isLandscapeMode(): boolean {
    return this.landscapeMode;
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
    this.landscapeMode = this.commonUtilityService.checkIfLandscapeMode();
    this.viewportListener = () => {
      const landscape = this.commonUtilityService.checkIfLandscapeMode();
      if (landscape === this.landscapeMode) {
        return;
      }
      this.landscapeMode = landscape;
      this.cdr.detectChanges();
    };
    window.addEventListener('resize', this.viewportListener);
    window.addEventListener('orientationchange', this.viewportListener);

    this.getOrientation();
    this.useMyCurrentLocation();
  }

  onHidden(): void {
    if (this.viewportListener) {
      window.removeEventListener('resize', this.viewportListener);
      window.removeEventListener('orientationchange', this.viewportListener);
      this.viewportListener = null;
    }
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
          // Outside the zone: the sensor fires ~60Hz, and letting zone.js see each
          // event ran a full application-wide change detection pass every time.
          // handler() re-enters the zone only when the shown heading changes.
          this.zone.runOutsideAngular(() => {
            window.addEventListener(
              'deviceorientation',
              this.orientationListener,
              true,
            );
          });
        } else {
          this.dialog.open(LocationServicesDialogComponent, {
            width: '350px',
            data: {
              message: 'Location services are required',
            },
          });
        }
      } else {
        this.zone.runOutsideAngular(() => {
          window.addEventListener(
            'deviceorientationabsolute',
            this.orientationListener,
            true,
          );
        });
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

  // Runs outside the Angular zone, once per sensor event. Keep it free of work that
  // reads layout, and re-enter the zone only when something on screen actually changes.
  handler(e, self) {
    // Only the page on screen may move the wizard, and only while it reads the sensor.
    if (!self.reportOfFire?.headingDetectionActive) {
      return;
    }
    if (this.landscapeMode) {
      this.zone.run(() => this.skip());
      return;
    }
    // A heading of exactly 0 is a true north reading, not a missing sensor.
    if (e.alpha == null && e.webkitCompassHeading == null) {
      this.zone.run(() => {
        this.reportOfFire.motionSensor = 'no';
        this.skip();
      });
      return;
    } else if (this.reportOfFire.motionSensor !== 'yes') {
      // Drives the template's *ngIf, so this one needs the zone.
      this.zone.run(() => {
        this.reportOfFire.motionSensor = 'yes';
      });
    }

    try {
      let compassHeading = e.webkitCompassHeading || Math.abs(e.alpha - 360);
      compassHeading = Math.trunc(compassHeading);
      // Truncated to whole degrees, so most events repeat the last value. Redrawing
      // only on a real change is what keeps this off the 60Hz change detection path.
      if (compassHeading === this.compassHeading) {
        return;
      }
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

      // This component's own view is all that changed, so redraw just it rather
      // than re-entering the zone and checking the whole tree.
      this.cdr.detectChanges();
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
