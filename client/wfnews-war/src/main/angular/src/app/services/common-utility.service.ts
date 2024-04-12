import { NumberFormatStyle } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Injectable, Injector } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { App } from '@capacitor/app';
import { Geolocation } from '@capacitor/geolocation';
import { AppConfigService } from '@wf1/core-ui';
import { Observable } from 'rxjs';
import { ReportOfFireService } from './report-of-fire-service';
import { LocalStorageService } from './local-storage-service';

const MAX_CACHE_AGE = 30 * 1000;

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
  private myLocation;
  private locationTime;
  private location;
  private rofService;

  constructor(
    protected snackbarService: MatSnackBar,
    private http: HttpClient,
    private appConfigService: AppConfigService,
    private injector: Injector,
    private storageService: LocalStorageService
  ) {
    setTimeout(() => (this.rofService = injector.get(ReportOfFireService)));
  }

  getCurrentLocationPromise(): Promise<Position> {
    const self = this;
    const now = Date.now();
    if (this.locationTime && now - this.locationTime < MAX_CACHE_AGE) {
      return this.location;
    }

    this.locationTime = now;
    this.location = Geolocation.getCurrentPosition();
    return this.location;
  }

  getCurrentLocation(callback?: (p: Position) => void) {
    if (navigator && navigator.geolocation) {
      return Geolocation.getCurrentPosition().then(
        (position) => {
          this.myLocation = position ? position.coords : undefined;
          if (callback) {
            callback(position);
          }
          return position ? position.coords : undefined;
        },
        (error) => {
          this.snackbarService.open(
            'Unable to retrieve the current location.',
            '',
            {
              duration: 5,
            },
          );
        },
      );
    } else {
      console.warn('Unable to access geolocation');
      this.snackbarService.open('Unable to access location services.', '', {
        duration: 5,
      });
    }
  }

  preloadGeolocation() {
    Geolocation.getCurrentPosition().then(
      (position) => {
        this.myLocation = position.coords;
      },
      (error) => {
        this.snackbarService.open(
          'Unable to retrieve the current location',
          'Cancel',
          {
            duration: 5000,
          },
        );
      },
    );
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

  countdown(timeoutDuration) {
    const promise = new Promise<boolean>((resolve) => {
      setTimeout(() => resolve(false), timeoutDuration);
    });
    return promise;
  }

  checkLocation() {
    const promise = new Promise<boolean>((resolve) => {
      Geolocation.getCurrentPosition().then(
        (position) => {
          resolve(true)
        },
        (error) => {
          resolve(false)
        },
      );
    })

    return promise;
  }

  async checkLocationServiceStatus(): Promise<boolean> {
    const timeoutDuration = 5000; // 5 seconds limit
   
    const locationPromise = await this.checkLocation()
    const timeoutPromise = this.countdown(timeoutDuration)

    return Promise.race([timeoutPromise, locationPromise]);
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
      // Fetch locally stored data
      const offlineReportSaved = this.storageService.getData('offlineReportData');
      if (offlineReportSaved) {
        const offlineReport = JSON.parse(offlineReportSaved);

        if (offlineReport.resource) {
          const resource = JSON.parse(offlineReport.resource);
          // Remove the locally stored data if it was submitted more than 24 hours ago
          if (
            resource.submittedTimestamp &&
            this.invalidTimestamp(resource.submittedTimestamp)
          ) {
            this.storageService.removeData('offlineReportData');
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

  private deg2rad(deg: number): number {
    return deg * (Math.PI / 180);
  }
  private rad2deg(rad: number): number {
    return rad * (180 / Math.PI);
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
    if ((window.innerWidth > window.innerHeight) || (window.innerWidth <= 1024 && window.innerWidth >= 768 && window.innerHeight > window.innerWidth) ) {
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
    const polygonData = [];
    for (const element of response) {
      polygonData.push(...element);
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
      ? { attributionControl: false, zoomControl: false, dragging: false, doubleClickZoom: false, boxZoom: false, trackResize: false, scrollWheelZoom: false }
      : { attributionControl: false, zoomControl: false, dragging: false, doubleClickZoom: false, boxZoom: false, trackResize: false, scrollWheelZoom: false, center: location, zoom: 9 };
  }
  
}