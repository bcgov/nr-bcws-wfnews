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
import { PERMISSION_DIALOG } from '@app/components/common/permission-banner/permission-banner.constants';
import { PermissionDialogService } from '@app/components/common/permission-dialog/permission-dialog.service';
import { PermissionService } from '@app/services/permission.service';
import { equalsIgnoreCase } from '../../../utils';

// A browser with no compass sends no reading at all, so the wait needs an end.
const NO_READING_MS = 2000;

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
  public compassUnsupported = false;
  private noReadingTimer: ReturnType<typeof setTimeout>;
  private orientationListener: (e: DeviceOrientationEvent) => void;
  // The sensor fires ~60Hz. Recomputing this per event, and again on every change
  // detection pass from the template, read window dimensions each time and forced
  // a layout. Cache it and refresh only when the viewport actually changes.
  private landscapeMode = false;
  private viewportListener: () => void;
  equalsIgnoreCase = equalsIgnoreCase;

  constructor(
    private commonUtilityService: CommonUtilityService,
    private permissionService: PermissionService,
    private permissionDialog: PermissionDialogService,
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

    this.noReadingTimer = setTimeout(() => {
      if (this.reportOfFire.motionSensor !== 'yes') {
        this.showUnsupported();
      }
    }, NO_READING_MS);
  }

  showUnsupported(): void {
    this.reportOfFire.motionSensor = 'no';
    this.compassUnsupported = true;
    this.cdr.detectChanges();
  }

  continueWithoutCompass(): void {
    this.reportOfFire.headingDetectionActive = false;
    this.next();
  }

  onHidden(): void {
    clearTimeout(this.noReadingTimer);
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
    let state = await this.permissionService.check('compass');
    // The tap that opened this page can still count, so try before the dialog asks.
    if (state === 'prompt') {
      state = await this.permissionService.request('compass');
    }
    if (state === 'prompt' || state === 'denied') {
      const result = await this.permissionDialog.open('compass', state, {
        cancelLabel: PERMISSION_DIALOG.action.skip,
      });
      if (result === 'granted') {
        state = 'granted';
      }
    }
    // The user may have left the page while the dialog was open.
    if (!this.viewportListener) {
      return;
    }
    if (state !== 'granted') {
      this.skip();
      return;
    }

    this.orientationListener = (e: DeviceOrientationEvent) =>
      this.handler(e, this);
    // Chrome has requestPermission now too, so pick the event, not the platform.
    // Only the absolute event gives a compass heading there; iOS has its own field.
    const event =
      'ondeviceorientationabsolute' in window
        ? 'deviceorientationabsolute'
        : 'deviceorientation';
    // Outside the zone: the sensor fires ~60Hz, and letting zone.js see each
    // event ran a full application-wide change detection pass every time.
    // handler() re-enters the zone only when the shown heading changes.
    this.zone.runOutsideAngular(() => {
      window.addEventListener(event, this.orientationListener, true);
    });
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
      if (!this.compassUnsupported) {
        this.zone.run(() => this.showUnsupported());
      }
      return;
    } else if (this.reportOfFire.motionSensor !== 'yes') {
      // Drives the template's *ngIf, so this one needs the zone.
      this.zone.run(() => {
        clearTimeout(this.noReadingTimer);
        this.compassUnsupported = false;
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
