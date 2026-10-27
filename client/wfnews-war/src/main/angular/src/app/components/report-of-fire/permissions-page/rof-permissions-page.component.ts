import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  OnDestroy,
} from '@angular/core';
import {
  locationBannerAction,
  PERMISSION_BANNER,
} from '@app/components/common/permission-banner/permission-banner.constants';
import { ReportOfFirePage } from '@app/components/report-of-fire/report-of-fire.component';
import { CapacitorService } from '@app/services/capacitor-service';
import {
  CommonUtilityService,
  Position,
} from '@app/services/common-utility.service';
import {
  PermissionService,
  PermissionState,
} from '@app/services/permission.service';
import { Subscription } from 'rxjs';
import { ReportOfFire } from '../reportOfFireModel';
import { RoFPage } from '../rofPage';

// A browser tells no page when its settings change, so the page reads them again.
const RECHECK_INTERVAL = 2 * 1000;
// A quick fix shows no banner. A slow one says why Continue is off.
const SLOW_FIND = 1500;
// After a visible search, the green check shows this long, then the banner fades.
const FOUND_SHOWN = 1500;
const FOUND_FADE = 300;

interface LocationBanner {
  heading: string;
  message: string;
  action?: string;
  busy?: boolean;
  success?: boolean;
}

@Component({
  selector: 'rof-permissions-page',
  templateUrl: './rof-permissions-page.component.html',
  styleUrls: ['./rof-permissions-page.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class RoFPermissionsPage extends RoFPage implements OnDestroy {
  public dataShareAccepted = false;
  readonly bannerText = PERMISSION_BANNER;
  /** Undefined until read, so no banner flashes on a page that has location. */
  locationState?: PermissionState;
  position?: Position;
  banner: LocationBanner | null = null;
  bannerLeaving = false;
  private offline = false;
  private locating = false;
  private slowFind = false;
  private recheckTimer?: ReturnType<typeof setInterval>;
  private permissionSubscription?: Subscription;

  public constructor(
    private reportOfFirePage: ReportOfFirePage,
    private commonUtilityService: CommonUtilityService,
    private capacitorService: CapacitorService,
    private cdr: ChangeDetectorRef,
    private permissionService: PermissionService,
  ) {
    super();
  }

  /** A report needs a position, so Continue waits for one. */
  get canContinue(): boolean {
    return this.dataShareAccepted && !!this.position;
  }

  /** A user with no location can still report the fire by phone. */
  get showCallOption(): boolean {
    return !!this.banner && !this.position;
  }

  initialize(data: any, index: number, reportOfFire: ReportOfFire) {
    super.initialize(data, index, reportOfFire);
  }

  /** The wizard builds every page up front, so nothing is read before this. */
  async onShown(): Promise<void> {
    if (this.position) {
      return;
    }
    // Offline, only GPS can answer, so the search waits longer. Read it before the first.
    this.offline = !(await this.commonUtilityService.checkOnline());
    // The app reads the state again when the user comes back from the settings.
    this.permissionSubscription ??=
      this.capacitorService.locationPermission.subscribe(() => this.recheck());
    clearInterval(this.recheckTimer);
    this.recheckTimer = setInterval(() => this.recheck(), RECHECK_INTERVAL);
    this.recheck();
  }

  onHidden(): void {
    this.stopWatching();
  }

  ngOnDestroy(): void {
    this.stopWatching();
  }

  dataShareAcceptedToggle(event: boolean) {
    this.dataShareAccepted = event;
  }

  /** The banner action: ask, or open the settings page that can repair the state. */
  async onBannerAction(): Promise<void> {
    const state = this.locationState;
    if (this.permissionService.canOpenSettings('location', state)) {
      await this.permissionService.openSettings('location', state);
      return;
    }
    // A browser asks when the page asks for a position.
    if (this.permissionService.isWeb) {
      await this.find();
      return;
    }
    this.setState(await this.permissionService.request('location'));
    if (this.locationState === 'granted') {
      await this.find();
    }
  }

  openCallPage(): void {
    this.reportOfFirePage.selectPage('call-page', null, false);
  }

  nextPage() {
    if (!this.canContinue) {
      return;
    }
    const here = [
      Number(this.position.coords.latitude),
      Number(this.position.coords.longitude),
    ];
    this.reportOfFire.currentLocation = [...here];
    this.reportOfFire.deviceLocation = [...here];
    // The fire starts where the user is, so no later page can send [0, 0].
    const [lat, lon] = this.reportOfFire.fireLocation ?? [];
    if (!lat && !lon) {
      this.reportOfFire.fireLocation = [...here];
    }

    if (
      this.isMotionSensorActive() &&
      !this.commonUtilityService.checkIfLandscapeMode()
    ) {
      this.reportOfFire.headingDetectionActive = true;
      this.next();
    } else {
      this.reportOfFirePage.selectPage('distance-page', null, false);
    }
  }

  isMotionSensorActive(): boolean {
    return this.reportOfFire.motionSensor !== 'no';
  }

  /** Reads the state with no prompt, and takes a position once it is granted. */
  private async recheck(): Promise<void> {
    if (this.position || this.locating) {
      return;
    }
    const state = this.permissionService.isWeb
      ? await this.permissionService.readBrowserLocation()
      : await this.permissionService.check('location');
    // With no query (Safari before 16), only a tap can tell.
    if (state === undefined) {
      if (this.locationState === undefined) {
        this.setState('prompt');
      }
      return;
    }
    if (state !== 'granted') {
      this.setState(state);
      return;
    }
    // A slow or failed fix keeps its banner while the page tries again.
    if (this.locationState !== 'no-position' && this.locationState !== 'services-off') {
      this.setState('granted');
    }
    await this.find();
  }

  private async find(): Promise<void> {
    this.locating = true;
    const slow = setTimeout(() => {
      this.slowFind = true;
      this.refresh();
    }, SLOW_FIND);
    this.refresh();
    const result = await this.permissionService.locate(this.offline);
    clearTimeout(slow);
    this.locating = false;
    this.slowFind = false;
    this.position = result.position;
    this.locationState = result.state;
    if (this.position) {
      this.stopWatching();
      // The user saw a search, so show it ended well before the banner goes.
      if (this.banner) {
        this.showFound();
        return;
      }
    }
    this.refresh();
  }

  private showFound(): void {
    this.banner = { ...PERMISSION_BANNER.location.reportOfFire.found, success: true };
    this.cdr.markForCheck();
    setTimeout(() => {
      this.bannerLeaving = true;
      this.cdr.markForCheck();
    }, FOUND_SHOWN);
    setTimeout(() => {
      this.banner = null;
      this.bannerLeaving = false;
      this.cdr.markForCheck();
    }, FOUND_SHOWN + FOUND_FADE);
  }

  private setState(state: PermissionState): void {
    this.locationState = state;
    this.refresh();
  }

  private refresh(): void {
    this.banner = this.bannerFor(this.locationState);
    this.cdr.markForCheck();
  }

  private bannerFor(state?: PermissionState): LocationBanner | null {
    if (this.position || state === undefined) {
      return null;
    }
    const text = PERMISSION_BANNER.location;
    const own = text.reportOfFire;
    const web = this.permissionService.isWeb;
    switch (state) {
      case 'granted':
        if (!this.slowFind) {
          return null;
        }
        return { ...(this.offline ? own.searchingOffline : own.searching), busy: true };
      case 'prompt':
        return {
          heading: text.heading.off,
          message: text.message.reportOfFire,
          action: text.action.turnOn,
        };
      case 'denied':
        return web
          ? own.browserDenied
          : {
            heading: text.heading.off,
            message: text.message.reportOfFire,
            action: text.action.appSettings,
          };
      case 'services-off':
        return web
          ? own.browserServicesOff
          : {
            heading: text.heading.off,
            message: text.message.reportOfFire,
            action: locationBannerAction(
              'services-off',
              this.capacitorService.isIOSPlatform,
            ),
          };
      case 'no-position':
        // The page keeps trying, so the spinner stays between attempts.
        return { ...own.noPosition, busy: true };
      default:
        return own.unsupported;
    }
  }

  private stopWatching(): void {
    clearInterval(this.recheckTimer);
    this.recheckTimer = undefined;
    this.permissionSubscription?.unsubscribe();
    this.permissionSubscription = undefined;
  }
}
