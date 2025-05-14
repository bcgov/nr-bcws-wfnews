import {
  Component,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  AfterViewInit,
  ElementRef,
} from '@angular/core';
import { RoFPage } from '../rofPage';
import { ReportOfFire } from '../reportOfFireModel';
import { HttpClient } from '@angular/common/http';
import { CompassHeading } from '@app/services/capacitor-service';
import { LatLon, LonLat } from '@app/services/wfnews-map.service/util';
import { SmkApi } from '@app/utils/smk';
import { MapConfigService } from '@app/services/map-config.service';
import { CommonUtilityService } from '@app/services/common-utility.service';
import { ReportOfFirePage } from '@app/components/report-of-fire/report-of-fire.component';
import { LocationStrategy, PathLocationStrategy } from '@angular/common';
import offlineMapJson from '../../../../assets/maps/british-columbia.json';
import * as L from 'leaflet';
import { getActiveMap } from '@app/utils';

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
export class RoFLocationPage extends RoFPage implements AfterViewInit {
  mapConfig = null;
  SMK: any;
  location?: any;
  distanceEstimateMeter = 1000;
  heading: CompassHeading;
  turf: any;
  fireLocation?: LatLon;
  smkApi: SmkApi;
  http: HttpClient;
  fullScreenMode = false;
  isEditMode = false;
  distance: number;
  public constructor(
    private mapConfigService: MapConfigService,
    private cdr: ChangeDetectorRef,
    private commonUtilityService: CommonUtilityService,
    private elementRef: ElementRef,
    private reportOfFirePage: ReportOfFirePage,
  ) {
    super();
  }

  ngAfterViewInit(): void {
    this.loadMapConfig();
    this.setHeading();
  }

  async initialize(data: any, index: number, reportOfFire: ReportOfFire) {
    await this.useMyCurrentLocation();
    super.initialize(data, index, reportOfFire);
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

  async useMyCurrentLocation() {
    this.location = await this.commonUtilityService.getCurrentLocationPromise();
  }

  initMap(smk: any) {
    this.smkApi = new SmkApi(smk);

    const L = window['L'];

    const loc = {
      type: 'Point',
      coordinates: [
        this.location.coords.longitude,
        this.location.coords.latitude,
      ],
    };

    this.reportOfFire[this.updateAttribute] = [
      Number(this.location.coords.latitude),
      Number(this.location.coords.longitude),
    ];
    this.reportOfFire.currentLocation = [
      Number(this.location.coords.latitude),
      Number(this.location.coords.longitude),
    ];
    smk.showFeature('location', loc, {
      pointToLayer(geojson, latlng) {
        return L.marker(latlng, {
          icon: L.divIcon({
            className: 'rof-location',
            iconSize: [20, 20],
            iconAnchor: [14, 14],
          }),
        });
      },
    });
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
        const loc = [
          this.location.coords.longitude,
          this.location.coords.latitude,
        ] as LonLat;

      this.fireLocation = [photo.lat, photo.lng];

      this.arrow(smk, loc, [photo.lng, photo.lat]);
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
    const direction = this.commonUtilityService.calculateBearing(
      this.location.coords.latitude,
      this.location.coords.longitude,
      this.fireLocation[0],
      this.fireLocation[1],
    );
    if (direction) {
      this.reportOfFire.compassHeading = direction;
    }
    this.reportOfFire[this.updateAttribute] = this.fireLocation;
  }

  // start -----> end
  arrow(smk: any, start: LonLat, end: LonLat) {
    const L = window['L'];
    const T = window['turf'];
    const view = smk.$viewer.getView();
    const lineStartOffsetPx = 15;
    const lineEndOffsetPx = 35;

    const arrowLine = T.lineString([start, end]);
    const arrowLen = T.length(arrowLine);
    this.distance = arrowLen;

    const startOffset = (view.metersPerPixel * lineStartOffsetPx) / 1000;
    const endOffset = (view.metersPerPixel * lineEndOffsetPx) / 1000;

    const headPt = T.along(T.lineString([end, start]), endOffset);
    const headRot = T.bearing(headPt.geometry.coordinates, end);
    smk.showFeature('arrow-head', headPt, {
      pointToLayer(geojson, latlng) {
        return L.marker(latlng, {
          icon: L.divIcon({
            className: 'rof-arrow-head',
            html: `<i class="material-icons" style="transform:rotateZ(${headRot}deg);">navigation</i>`,
            iconSize: [24, 24],
            iconAnchor: [12, 12],
          }),
          interactive: false,
        });
      },
    });

    const startPt = T.along(
      T.lineString([start, headPt.geometry.coordinates]),
      startOffset,
    ).geometry.coordinates;
    const line = T.lineString([startPt, headPt.geometry.coordinates]);

    smk.showFeature('arrow-line', line, {
      style() {
        return {
          color: 'yellow',
          weight: 5,
          lineCap: 'butt',
          interactive: false,
        };
      },
      onEachFeature(ft, ly) {
        ly.bindTooltip(formatDist(arrowLen) + ' km', {
          permanent: true,
        });
      },
    });

    smk.showFeature('arrow-line-shadow', line, {
      style() {
        return {
          color: 'rgba(0,0,0,36%)',
          weight: 7,
          lineCap: 'butt',
          interactive: false,
        };
      },
    });
  }

  loadMapConfig() {
    this.commonUtilityService.checkOnline().then((result) => {
      if (!result) {
        this.mapConfigService.getReportOfFireOfflineMapConfig().then((cfg) => {
          const turf = window['turf'];
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
            const exp = turf.transformScale(poly, 1.1);
            const bbox = turf.bbox(exp);
            const view = { viewer: { location: { extent: bbox } } };
          this.mapConfig = [cfg, view];
          this.cdr.detectChanges();
        });
      } else {
        this.mapConfigService.getReportOfFireMapConfig().then((cfg) => {
          const turf = window['turf'];
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
            const exp = turf.transformScale(poly, 1.1);
            const bbox = turf.bbox(exp);
            const view = { viewer: { location: { extent: bbox } } };
          this.mapConfig = [cfg, view];
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
      if (Object.hasOwn(SMK.MAP, smkMap)) {
        const geoJsonData = offlineMapJson;
        const offlineLyaer = L.geoJson(geoJsonData, {
          style: {
            color: '#6495ED',
            weight: 8,
            fillColor: '',
            fillOpacity: 0.00001,
          },
          zoom: 6,
          subdomains: ['mt0', 'mt1', 'mt2', 'mt3'],
        });
        getActiveMap(SMK).$viewer.map;
        offlineLyaer.addTo(getActiveMap(SMK).$viewer.map);
        getActiveMap(SMK).$viewer.map.setZoom(5);
        const offlineUrl = '/assets/offline-maps/{z}/{y}/{x}.jpg';
        L.tileLayer(offlineUrl, {
          zoom: 5,
          subdomains: ['mt0', 'mt1', 'mt2', 'mt3'],
        }).addTo(getActiveMap(SMK).$viewer.map);
      }
    }
  }
}

function formatDist(dist: number): string {
  if (dist == null) {
return '';
}

  const rounded = parseFloat(dist.toPrecision(6));
  const a = Math.abs(rounded);
    const s = Math.sign(rounded);
    const i = Math.floor(a);
    const f = a - i;

  return (s * i).toLocaleString() + f.toFixed(3).substr(1);
}
