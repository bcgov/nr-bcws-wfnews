import {
  ChangeDetectorRef,
  Component,
  OnDestroy,
  OnInit,
} from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatIconRegistry } from '@angular/material/icon';
import { ActivatedRoute, Router } from '@angular/router';
import {
  CapacitorService,
  LocationPermissionState,
} from '@app/services/capacitor-service';
import { WFMapService } from '@app/services/wf-map.service';
import { isMobileView } from '@app/utils';
import { AppConfigService } from '@wf1/core-ui';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-wildfires-list-header',
  templateUrl: './wildfires-list-header.component.html',
  styleUrls: ['./wildfires-list-header.component.scss'],
})
export class WildfiresListHeaderComponent implements OnInit, OnDestroy {
  public selectedTab = 0;
  locationPermission: LocationPermissionState = 'prompt';
  private permissionSubscription: Subscription;

  public isMobileView = isMobileView;

  constructor(
    protected appConfigService: AppConfigService,
    protected router: Router,
    private activatedRoute: ActivatedRoute,
    protected matIconRegistry: MatIconRegistry,
    protected cdr: ChangeDetectorRef,
    protected dialog: MatDialog,
    protected wfMapService: WFMapService,
    private capacitorService: CapacitorService,
  ) {}

  /**
   * These lists sort by distance, so they need a position to draw themselves. That
   * makes them banner screens: they must never raise the Android dialog on their own.
   */
  get showLocationBanner(): boolean {
    return (
      this.locationPermission === 'denied' ||
      this.locationPermission === 'denied-once' ||
      this.locationPermission === 'prompt' ||
      this.locationPermission === 'services-off'
    );
  }

  get locationBannerHeading(): string {
    return this.locationPermission === 'services-off'
      ? 'Location services are off'
      : 'Location is off';
  }

  get locationBannerAction(): string {
    if (this.locationPermission === 'prompt' || this.locationPermission === 'denied-once') {
      return 'Turn on location';
    }
    return this.locationPermission === 'services-off'
      ? 'Open location settings'
      : 'Open settings';
  }

  async onTurnOnLocation(): Promise<void> {
    // A prompt still works from this state, so ask. Otherwise send them to settings.
    if (this.locationPermission === 'prompt' || this.locationPermission === 'denied-once') {
      await this.capacitorService.requestLocationPermission();
      return;
    }
    await this.capacitorService.openLocationSettings(this.locationPermission);
  }

  ngOnDestroy() {
    this.permissionSubscription?.unsubscribe();
  }

  selectTab(tab: number) {
    this.selectedTab = tab;
    // swap to the desired tab
    this.cdr.detectChanges();
  }

  ngOnInit() {
    this.permissionSubscription =
      this.capacitorService.locationPermission.subscribe((state) => {
        this.locationPermission = state;
        this.cdr.detectChanges();
      });
    this.capacitorService.refreshLocationPermission();

    this.activatedRoute.queryParams.subscribe((params) => {
      if (params && params['tab']) {
        const tab = params['tab'];
        this.selectTab(Number(tab));
      }
    });
  }
}
