import { NumberFormatStyle } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Injectable, Injector } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Meta, Title } from '@angular/platform-browser';
import { Router } from '@angular/router';
import { ShareDialogComponent } from '@app/components/admin-incident-form/share-dialog/share-dialog.component';
import { snowPlowHelper } from '@app/utils';
import { Capacitor, CapacitorHttp } from '@capacitor/core';
import { Geolocation } from '@capacitor/geolocation';
import { Share } from '@capacitor/share';
import { AppConfigService } from '@wf1/core-ui';
import { from, Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { CapacitorService } from './capacitor-service';
import { IonicStorageService } from './ionic-storage.service';
import { ReportOfFireService } from './report-of-fire-service';

const MAX_CACHE_AGE = 30 * 1000;
const POSITION_LIMIT = 10 * 1000;

/**
 * The Android plugin does not apply its own `timeout`. A request measured on a
 * Pixel XL was still pending after 100 002 ms with the device Location setting
 * off, so the limit must be here. See PIXEL_XL_FINDINGS_STE.md section 6.3.
 */
function withLimit<T>(work: Promise<T>, limit: number): Promise<T> {
  return new Promise<T>((resolve, reject) => {
    const timer = setTimeout(
      () => reject(new Error('The location request took too long.')),
      limit,
    );
    work.then(
      (value) => {
        clearTimeout(timer);
        resolve(value);
      },
      (error) => {
        clearTimeout(timer);
        reject(error);
      },
    );
  });
}
export interface Coordinates {
  readonly accuracy: number;
  readonly altitude: number | null;
  readonly altitudeAccuracy: number | null;
  readonly heading: number | null;
  readonly latitude: number;
  readonly longitude: number;
  readonly speed: number | null;
}

export interface Position {
  readonly coords: Coordinates;
  readonly timestamp: NumberFormatStyle;
}

@Injectable({
  providedIn: 'root',
})
export class CommonUtilityService {
  snowPlowHelper = snowPlowHelper;
  private myLocation;
  private locationTime;
  private location;
  private rofService;

  constructor(
    protected snackbarService: MatSnackBar,
    private http: HttpClient,
    private appConfigService: AppConfigService,
    private injector: Injector,
    private ionicStorageService: IonicStorageService,
    private capacitorService: CapacitorService,
    private router: Router,
    private dialog: MatDialog,
    private titleService: Title,
    private metaService: Meta,
    private currentRouter: Router,

  ) {
    setTimeout(() => (this.rofService = injector.get(ReportOfFireService)));
  }

  private requestPosition(): Promise<Position> {
    return withLimit(
      Geolocation.getCurrentPosition({
        // With no options the plugin takes its LocationManager fallback, measured at
        // over five seconds indoors and often failing. Off, the fused provider
        // answers in under a tenth of a second.
        enableLocationFallback: false,
        maximumAge: MAX_CACHE_AGE,
        timeout: POSITION_LIMIT,
      }),
      POSITION_LIMIT,
    );
  }

  /**
   * A position, but only when the permission is already granted. It never raises the
   * Android dialog. A screen that draws itself with a position must use this, so that
   * it does not ask on load. See LOCATION_AND_STARTUP_PLAN_STE.md section 5.1.
   */
  async getPositionIfPermitted(): Promise<Position | undefined> {
    try {
      const status = await Geolocation.checkPermissions();
      if (status.location !== 'granted' && status.coarseLocation !== 'granted') {
        return undefined;
      }
      return await this.getCurrentLocationPromise();
    } catch (error) {
      return undefined;
    }
  }

  getCurrentLocationPromise(): Promise<Position> {
    const now = Date.now();
    if (this.location && this.locationTime && now - this.locationTime < MAX_CACHE_AGE) {
      return this.location;
    }

    // Cache a good answer only. The old code stamped the time before the answer
    // came, so one failure was returned again for the whole window.
    this.location = this.requestPosition().then(
      (position) => {
        this.locationTime = Date.now();
        this.myLocation = position?.coords;
        return position;
      },
      (error) => {
        this.location = undefined;
        this.locationTime = undefined;
        throw error;
      },
    );
    return this.location;
  }

  sortAddressList(results: any, value: string) {
    let address = null;
    let trimmedAddress = null;
    let valueLength = null;
    let valueMatch = null;
    results.forEach((result) => {
      address = this.getFullAddress(result);
      result.address = address.trim();
      trimmedAddress = result.address;
      valueLength = value.length;
      if (trimmedAddress != null) {
        valueMatch = trimmedAddress.substring(0, valueLength);
      }

      if (
        address != null &&
        valueLength != null &&
        valueMatch != null &&
        (value.toUpperCase() === address.toUpperCase() ||
          value.toUpperCase() === valueMatch.toUpperCase())
      ) {
        const index = results.indexOf(result);
        if (index !== -1) {
          results.splice(index, 1);
        }
        const resultToBeUnshifted = result;

        results.unshift(resultToBeUnshifted);
      }
    });

    return results;
  }

  getFullAddress(location) {
    let result = '';

    if (location.civicNumber) {
      result += location.civicNumber;
    }

    if (location.streetName) {
      result += ' ' + location.streetName;
    }

    if (location.streetQualifier) {
      result += ' ' + location.streetQualifier;
    }

    if (location.streetType) {
      result += ' ' + location.streetType;
    }

    return result;
  }

  isIPhone(): boolean {
    const userAgent = window.navigator.userAgent.toLowerCase();
    return /iphone/.test(userAgent);
  }

  /**
   * Can we get a position right now? This never raises the Android dialog, because it
   * runs on load, for example when the Active Wildfire Map starts. A control that
   * should ask must call requestLocationPermission() on the CapacitorService instead.
   */
  async checkLocation(): Promise<boolean> {
    return (await this.getPositionIfPermitted()) !== undefined;
  }

  async checkLocationServiceStatus(): Promise<boolean> {
    // requestPosition carries its own limit now, so the old countdown race is gone.
    // That race never applied: it awaited the answer before it raced it.
    return this.checkLocation();
  }

  pingService(): Observable<any> {
    const url = this.appConfigService.getConfig().rest['wfnews'];
    return this.http.get(url);
  }

  calculateBearing(
    lat1: number,
    lon1: number,
    lat2: number,
    lon2: number,
  ): number {
    const dLon = this.deg2rad(lon2 - lon1);
    const x = Math.sin(dLon) * Math.cos(this.deg2rad(lat2));
    const y =
      Math.cos(this.deg2rad(lat1)) * Math.sin(this.deg2rad(lat2)) -
      Math.sin(this.deg2rad(lat1)) *
      Math.cos(this.deg2rad(lat2)) *
      Math.cos(dLon);
    const bearing = Math.atan2(x, y);
    const bearingDegrees = this.rad2deg(bearing);
    return (bearingDegrees + 360) % 360;
  }

  formatDDM(decimal: number) {
    decimal = Math.abs(decimal);
    const d = Math.abs(Math.trunc(decimal));
    return d + '° ' + (60 * (decimal - d)).toFixed(3) + '\'';
  }

  async checkOnlineStatus(): Promise<boolean> {
    try {
      await this.pingService().toPromise();
      return true;
    } catch (error) {
      return false;
    }
  }

  async removeInvalidOfflineRoF() {
    try {
      let offlineReportSaved = null;
      // Fetch locally stored data
      await this.ionicStorageService.get('offlineReportData').then(response => {
        offlineReportSaved = response;
      });

      if (offlineReportSaved) {
        const offlineReport = JSON.parse(offlineReportSaved);

        if (offlineReport.resource) {
          const resource = JSON.parse(offlineReport.resource);
          // Remove the locally stored data if it was submitted more than 24 hours ago
          if (
            resource.submittedTimestamp &&
            this.invalidTimestamp(resource.submittedTimestamp)
          ) {
            this.ionicStorageService.clear();
          }
        }
      }
    } catch (error) {
      console.error('Error removing invalid RoF data:', error);
    }
  }

  invalidTimestamp(timestamp: string): boolean {
    // check if submitted timestamp is more than 24 hours ago
    const now = new Date().getTime();
    const submittedTimestamp = Number(timestamp);
    const oneDay = 24 * 60 * 60 * 1000;
    return now - submittedTimestamp > oneDay;
  }



  async checkOnline() {
    try {
      await this.pingService().toPromise();
      return true;
    } catch (error) {
      return false;
    }
  }

  isAttributePresent(array, attributeName, attributeValue) {
    return array.some(existingItem => existingItem.attributes[attributeName] === attributeValue);
  }

  checkIfLandscapeMode() {
    // also return true if this is table portrait mode wfnews-2022. 
    if (
      (window.innerWidth > window.innerHeight) ||
      (window.innerWidth <= 1024 && window.innerWidth >= 768 && window.innerHeight > window.innerWidth)) {
      return true;
    } else {
      return false;
    }
  }

  hasSQLKeywords(jsonBlob) {
    //detect standalone sql words
    const sqlKeywords = /\b(SELECT|INSERT|UPDATE|DELETE|ALTER|DROP|CREATE)\b(?!\s*\*)/i;
    const sqlDetected = sqlKeywords.test(jsonBlob);
    return sqlDetected;
  }

  extractPolygonData(response) {
    let polygonData = [];

    for (const element of response) {
      polygonData = polygonData.concat(element);
    }

    return polygonData;
  }

  createConvex(polygonData) {
    const turfPoints = polygonData.map(coord => window['turf'].point(coord));
    const pointsFeatureCollection = window['turf'].featureCollection(turfPoints);
    const convexHull = window['turf'].convex(pointsFeatureCollection)?.geometry?.coordinates[0];
    return convexHull;
  }

  getPolygonBond(polygonData) {
    const convex = this.createConvex(polygonData);
    const bounds = convex?.reduce((acc, coord) => [
      [Math.min(acc[0][0], coord[1]), Math.min(acc[0][1], coord[0])],
      [Math.max(acc[1][0], coord[1]), Math.max(acc[1][1], coord[0])]
    ], [[Infinity, Infinity], [-Infinity, -Infinity]]);
    return bounds;
  }

  getMapOptions(bounds: any, location: number[]) {
    return bounds
      ? {
        attributionControl: false,
        zoomControl: false,
        dragging: false,
        doubleClickZoom: false,
        boxZoom: false,
        trackResize: false,
        scrollWheelZoom: false
      } : {
        attributionControl: false,
        zoomControl: false,
        dragging: false,
        doubleClickZoom: false,
        boxZoom: false,
        trackResize: false,
        scrollWheelZoom: false,
        center: location,
        zoom: 9
      };
  }

  shareMobile(shareTitle: string) {
    const url = this.appConfigService.getConfig().application.baseUrl.toString() + this.currentRouter.url.slice(1);

    this.snowPlowHelper(url, {
      action: 'share_from_mobile_device',
      text: `${shareTitle}: ${url}`
    });

    const currentUrl = this.appConfigService.getConfig().application.baseUrl.toString() + this.router.url.slice(1);
    // contents of the share is out of scope for wfnews-2403. Enhancment should be available in wfnews-2422
    const imageUrl = this.appConfigService.getConfig().application.baseUrl.toString() + '/assets/images/share-wildfire.png';
    document.querySelector('meta[property="og:title"]')?.setAttribute('content', `${shareTitle}`);

    Share.share({
      title: shareTitle,
      url: currentUrl,
      text: '',
      dialogTitle: 'Share',
    }).then(() => {
      console.log('Sharing successful');
    }).catch(err => {
      console.error('Error sharing:', err);
    });
  }

  openShareWindow(type: string, incidentName: string) {
    const url = this.appConfigService.getConfig().application.baseUrl.toString() + this.router.url.slice(1);

    this.snowPlowHelper(url, {
      action: 'share_from_desktop',
      text: `${type}, ${incidentName}: ${url}`
    });
    this.dialog.open(ShareDialogComponent, {
      panelClass: 'contact-us-dialog',
      width: '500px',
      data: {
        incidentType: type,
        currentUrl: url,
        name: incidentName
      },
    });
  }

  getRequest<T>(url: string): Observable<T> {
    if (Capacitor.isNativePlatform()) {
      return from(CapacitorHttp.request({
        method: 'GET',
        url: encodeURI(url),
        headers: {
          accept: '*/*',
        }
      })).pipe(
        map(response => response.data)
      );
    } else {
      return this.http.get<T>(encodeURI(url));
    }
  }

  private deg2rad(deg: number): number {
    return deg * (Math.PI / 180);
  }
  private rad2deg(rad: number): number {
    return rad * (180 / Math.PI);
  }

}
