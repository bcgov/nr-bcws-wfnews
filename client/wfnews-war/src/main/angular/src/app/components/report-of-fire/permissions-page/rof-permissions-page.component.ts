import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  OnDestroy,
  OnInit,
} from '@angular/core';
import {
  locationBannerAction,
  locationBannerHeading,
  locationCanPrompt,
  PERMISSION_BANNER,
} from '@app/components/common/permission-banner/permission-banner.constants';
import { ReportOfFirePage } from '@app/components/report-of-fire/report-of-fire.component';
import {
  CapacitorService,
  LocationPermissionState,
} from '@app/services/capacitor-service';
import { CommonUtilityService } from '@app/services/common-utility.service';
import { Subscription } from 'rxjs';
import { ReportOfFire } from '../reportOfFireModel';
import { RoFPage } from '../rofPage';

@Component({
  selector: 'rof-permissions-page',
  templateUrl: './rof-permissions-page.component.html',
  styleUrls: ['./rof-permissions-page.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class RoFPermissionsPage extends RoFPage implements OnInit, OnDestroy {
  public dataShareAccepted = false;
  readonly bannerText = PERMISSION_BANNER;
  locationPermission: LocationPermissionState = 'prompt';
  private permissionSubscription: Subscription;

  public constructor(
    private reportOfFirePage: ReportOfFirePage,
    private commonUtilityService: CommonUtilityService,
    private capacitorService: CapacitorService,
    private cdr: ChangeDetectorRef,
  ) {
    super();
  }

  /**
   * This page is where a user first reads why the report wants a position, so the
   * banner covers `prompt` as well. The tap raises the dialog; nothing else does.
   */
  get showLocationBanner(): boolean {
    return (
      this.locationPermission === 'prompt' ||
      this.locationPermission === 'denied' ||
      this.locationPermission === 'denied-once' ||
      this.locationPermission === 'services-off'
    );
  }

  get locationBannerHeading(): string {
    return locationBannerHeading(this.locationPermission);
  }

  get locationBannerAction(): string {
    return locationBannerAction(this.locationPermission);
  }

  async onTurnOnLocation(): Promise<void> {
    if (locationCanPrompt(this.locationPermission)) {
      await this.capacitorService.requestLocationPermission();
      return;
    }
    await this.capacitorService.openLocationSettings(this.locationPermission);
  }

  ngOnInit(): void {
    this.permissionSubscription =
      this.capacitorService.locationPermission.subscribe((state) => {
        this.locationPermission = state;
        this.cdr.markForCheck();
      });
    // Reads the state only. The wizard builds every page up front, so anything
    // that asks here would raise the dialog while the title page is showing.
    this.capacitorService.refreshLocationPermission();
  }

  ngOnDestroy(): void {
    this.permissionSubscription?.unsubscribe();
  }

  /** The user can grant the permission in the phone settings while this page waits. */
  onShown(): void {
    this.capacitorService.refreshLocationPermission();
  }

  initialize(data: any, index: number, reportOfFire: ReportOfFire) {
    super.initialize(data, index, reportOfFire);
  }

  dataShareAcceptedToggle(event: boolean) {
    this.dataShareAccepted = event;
  }

  nextPage() {
    if (this.isMotionSensorActive()  && !this.commonUtilityService.checkIfLandscapeMode()) {
      this.reportOfFire.headingDetectionActive = true;
      this.next();
    } else {
      this.reportOfFirePage.selectPage('distance-page', null, false);
      // this.reportOfFirePage.currentStep++;
    }
  }

  isMotionSensorActive(): boolean {
    return this.reportOfFire.motionSensor !== 'no';
  }
}
