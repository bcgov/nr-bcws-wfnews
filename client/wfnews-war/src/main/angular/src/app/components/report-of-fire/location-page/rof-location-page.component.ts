import { LocationStrategy, PathLocationStrategy } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import {
  AfterViewInit,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  ElementRef,
  OnDestroy,
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
  CompassHeading,
  LocationPermissionState,
} from '@app/services/capacitor-service';
import { CommonUtilityService } from '@app/services/common-utility.service';
import { MapConfigService } from '@app/services/map-config.service';
import { LatLon, LonLat } from '@app/services/wfnews-map.service/util';
import { getActiveMap, hasOwn } from '@app/utils';
import { SmkApi } from '@app/utils/smk';
import { drawArrow, markerElement } from '../rof-arrow';
import { Subscription } from 'rxjs';
import offlineMapJson from '../../../../assets/maps/british-columbia.json';
import { ReportOfFire } from '../reportOfFireModel';
import { RoFPage } from '../rofPage';
import * as turf from '@turf/turf';

@Component({
  selector: 'rof-location-page',
  templateUrl: './rof-location-page.component.html',
  styleUrls: ['./rof-location-page.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [
    Location,
    { provide: LocationStrategy, useClass: PathLocationStrategy },
  ],
})
export class RoFLocationPage extends RoFPage implements AfterViewInit, OnDestroy {
  mapConfig = null;
  SMK: any;
  location?: any;
  distanceEstimateMeter = 1000;
  heading: CompassHeading;
  turf: any;
  fireLocation?: LatLon;
  smkApi: SmkApi;
  private smk: any;
  readonly bannerText = PERMISSION_BANNER;
  locationPermission: LocationPermissionState = 'prompt';
  private permissionSubscription: Subscription;
  http: HttpClient;
  fullScreenMode = false;
  isEditMode = false;
  /** Move the map to the device one time, so a user who has panned keeps their view. */
  private viewIsAtDevice = false;
  private mapBoxObserver: ResizeObserver;
  distance: number;
  public constructor(
    private mapConfigService: MapConfigService,
    private cdr: ChangeDetectorRef,
    private commonUtilityService: CommonUtilityService,
    private elementRef: ElementRef,
    private reportOfFirePage: ReportOfFirePage,
    private capacitorService: CapacitorService,
  ) {
    super();
  }

  /** The banner is the only thing that asks, so it must cover `prompt` as well. */
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

  get locationBannerMessage(): string {
    return PERMISSION_BANNER.location.message.reportOfFire;
  }

  get locationBannerAction(): string {
    return locationBannerAction(
      this.locationPermission,
      this.capacitorService.isIOSPlatform,
    );
  }

  async onTurnOnLocation(): Promise<void> {
    if (locationCanPrompt(this.locationPermission)) {
      const state = await this.capacitorService.requestLocationPermission();
      if (state === 'granted') {
        await this.useMyCurrentLocation();
      }
      return;
    }
    await this.capacitorService.openLocationSettings(this.locationPermission);
  }

  ngAfterViewInit(): void {
    this.permissionSubscription =
      this.capacitorService.locationPermission.subscribe((state) => {
        this.locationPermission = state;
        this.cdr.markForCheck();
        // The user can turn location on in the phone settings while this page waits.
        if (state === 'granted' && !this.location) {
          this.useMyCurrentLocation();
        }
      });
    this.loadMapConfig();
    this.setHeading();
  }

  ngOnDestroy(): void {
    this.permissionSubscription?.unsubscribe();
    this.mapBoxObserver?.disconnect();
  }

  initialize(data: any, index: number, reportOfFire: ReportOfFire) {
    // No position here. The wizard builds every page up front, so anything that asks
    // in initialize() raises the Android dialog while the title page is showing.
    super.initialize(data, index, reportOfFire);
  }

  /**
   * The wizard calls this when this page is put on the screen. It reads the state
   * only. The banner is what asks, so no dialog arrives on its own.
   */
  async onShown(): Promise<void> {
    const state = await this.capacitorService.refreshLocationPermission();
    if (state === 'granted') {
      await this.useMyCurrentLocation();
    }
    this.cdr.markForCheck();
  }

  get currentHeading() {
    if (!this.hasHeading) {
      return 0;
    }
    return this.heading.trueHeading || 0;
  }
  get hasHeading() {
    if (!this.heading) {
      return false;
    }
    if (this.heading.error) {
      return false;
    }
    return true;
  }

  setHeading() {
    const compassHeading = {} as CompassHeading;
    compassHeading.trueHeading = this.reportOfFire.compassHeading;
    this.heading = compassHeading;
  }

  toggleFullScreen(): void {
    this.fullScreenMode = !this.fullScreenMode;
    const mapContainer =
      this.elementRef.nativeElement.querySelector('#mapView');
    if (this.fullScreenMode) {
      mapContainer.requestFullscreen();
    } else {
      document.exitFullscreen();
    }
  }

  setLocation() {
    // the map should trigger this once configured
    this.reportOfFire.estimatedDistance = 0;
    this.reportOfFire.fireLocation = [-112, 50];
  }

  /** Never throws. A user can report a fire with no position, by hand on the map. */
  async useMyCurrentLocation() {
    try {
      this.location =
        await this.commonUtilityService.getCurrentLocationPromise();
      this.applyPosition();
    } catch (error) {
      this.location = undefined;
    }
  }

  /**
   * Puts the position on the map and into the report. Safe to call more than one
   * time, because the user can accept the permission after the map has drawn.
   */
  private applyPosition() {
    if (!this.location?.coords || !this.smk) {
      return;
    }

    const lat = Number(this.location.coords.latitude);
    const lon = Number(this.location.coords.longitude);

    this.reportOfFire[this.updateAttribute] = [lat, lon];
    this.reportOfFire.currentLocation = [lat, lon];

    // The map drew before the position arrived, so bring the view to it. A marker
    // off the screen is why turning location on looked as if it did nothing.
    if (!this.viewIsAtDevice) {
      const area = this.areaAroundDevice();
      const map = this.smk?.$viewer?.map;
      if (area && map) {
        // Measure first. Fitting against a stale size puts the view in the wrong place.
        map.resize();
        // Fit the area, do not only pan to it. A pan alone keeps the province-wide
        // zoom the map opened with, and the marker is a dot in the middle of BC.
        const box = turf.bbox(area);
        map.fitBounds([
          [box[0], box[1]],
          [box[2], box[3]],
        ]);
        this.viewIsAtDevice = true;
      }
    }

    this.smk.showFeature(
      'location',
      { type: 'Point', coordinates: [lon, lat] },
      { htmlMarker: () => markerElement('rof-location') },
    );
    this.cdr.markForCheck();
  }

  initMap(smk: any) {
    this.smkApi = new SmkApi(smk);
    this.smk = smk;
    this.watchMapBox();

    // The map must draw with no position. applyPosition adds the marker when
    // there is one, now or later.
    this.applyPosition();

    const map = smk.$viewer.map;

    const toolbar = document.querySelector('.smk-toolbar') as HTMLElement;
    if (toolbar) {
      toolbar.style.display = 'none';
    }

    map.on('zoom', () => {
      connector();
    });
    map.on('move', () => {
      connector();
    });

    const connector = () => {
      const photo = map.getCenter();
      this.fireLocation = [photo.lat, photo.lng];

      // The arrow runs from the device to the fire, so it needs a device position.
      // The map still pans and zooms without one.
      if (!this.location?.coords) {
        return;
      }
      const loc = [
        this.location.coords.longitude,
        this.location.coords.latitude,
      ] as LonLat;

      this.distance = drawArrow(smk, loc, [photo.lng, photo.lat]);
    };

    connector();

    this.commonUtilityService.checkOnline().then((result) => {
      if (!result) {
        this.addOfflineLayer();
      }
    });
  }

  confirmLocation() {
    if (this.location?.coords?.latitude && this.location?.coords?.longitude) {
      this.reportOfFire.deviceLocation[0] = this.location.coords.latitude;
      this.reportOfFire.deviceLocation[1] = this.location.coords.longitude;
    }
    if (this.distance) {
      this.reportOfFire.estimatedDistance = this.distance * 1000;
    }
    const direction = this.location?.coords
      ? this.commonUtilityService.calculateBearing(
        this.location.coords.latitude,
        this.location.coords.longitude,
        this.fireLocation[0],
        this.fireLocation[1],
      )
      : undefined;
    if (direction) {
      this.reportOfFire.compassHeading = direction;
    }
    this.reportOfFire[this.updateAttribute] = this.fireLocation;
  }

  /**
   * The banner takes height from the map box, so the map re-measures when the
   * box changes size.
   */
  private watchMapBox(): void {
    const box = this.elementRef.nativeElement.querySelector('.map-container');
    if (!box || typeof ResizeObserver === 'undefined') {
      return;
    }
    this.mapBoxObserver = new ResizeObserver(() =>
      this.smk?.$viewer?.map?.resize(),
    );
    this.mapBoxObserver.observe(box);
  }

  /** The area to show: around where the fire should be, from the distance and heading. */
  private areaAroundDevice(): any {
    if (!this.location?.coords) {
      return null;
    }
    const loc = [
      this.location.coords.longitude,
      this.location.coords.latitude,
    ];
    const dist =
      this.reportOfFire.estimatedDistance &&
        this.reportOfFire.estimatedDistance !== 0
        ? this.reportOfFire.estimatedDistance / 1000
        : this.distanceEstimateMeter / 1000; //km
    const head = this.reportOfFire.compassHeading;
    const photo = turf.destination(loc, dist, head);
    const poly = turf.circle(photo.geometry.coordinates, dist);
    return turf.transformScale(poly, 1.1);
  }

  /** The same area as a map config, for a map that has not drawn yet. */
  private extentAroundDevice(): any {
    const area = this.areaAroundDevice();
    return area
      ? { viewer: { location: { extent: turf.bbox(area) } } }
      : null;
  }

  loadMapConfig() {
    this.commonUtilityService.checkOnline().then((result) => {
      if (!result) {
        this.mapConfigService.getReportOfFireOfflineMapConfig().then((cfg) => {
          const view = this.extentAroundDevice();
          this.mapConfig = view ? [cfg, view] : [cfg];
          this.cdr.detectChanges();
        });
      } else {
        this.mapConfigService.getReportOfFireMapConfig().then((cfg) => {
          const view = this.extentAroundDevice();
          this.mapConfig = view ? [cfg, view] : [cfg];
          this.cdr.detectChanges();
        });
      }
    });
  }

  editMode() {
    this.isEditMode = true;
  }

  backToReview() {
    this.reportOfFirePage.edit('review-page');
  }

  addOfflineLayer() {
    const SMK = window['SMK'];
    for (const smkMap in SMK.MAP) {
      if (hasOwn(SMK.MAP, smkMap)) {
        const map = getActiveMap(SMK).$viewer.map;

        // The raster tiles go under the outline, so add that source first.
        if (!map.getSource('offline-tiles')) {
          // Only zoom 5 is on disk, so cap the source there and let MapLibre
          // scale those tiles. Without the cap it asks for tiles that 404.
          map.addSource('offline-tiles', {
            type: 'raster',
            tiles: ['/assets/offline-maps/{z}/{y}/{x}.jpg'],
            tileSize: 256,
            minzoom: 5,
            maxzoom: 5,
          });
          map.addLayer({
            id: 'offline-tiles',
            type: 'raster',
            source: 'offline-tiles',
          });
        }

        if (!map.getSource('offline-outline')) {
          map.addSource('offline-outline', {
            type: 'geojson',
            data: offlineMapJson,
          });
          map.addLayer({
            id: 'offline-outline',
            type: 'line',
            source: 'offline-outline',
            paint: { 'line-color': '#6495ED', 'line-width': 8 },
          });
        }

        map.setZoom(5);
      }
    }
  }
}
