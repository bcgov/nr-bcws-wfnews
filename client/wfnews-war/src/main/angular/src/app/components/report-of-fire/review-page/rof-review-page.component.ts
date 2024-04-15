import {
  Component,
  ChangeDetectionStrategy,
  AfterViewInit,
  ChangeDetectorRef,
  OnInit,
} from '@angular/core';
import { RoFPage } from '../rofPage';
import { ReportOfFire } from '../reportOfFireModel';
import ConfigJson from '../report-of-fire.config.json';
import * as L from 'leaflet';
import { ReportOfFirePage } from '@app/components/report-of-fire/report-of-fire.component';
import { CommonUtilityService } from '@app/services/common-utility.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import {
  ReportOfFireService,
  ReportOfFireType,
} from '@app/services/report-of-fire-service';
import { equalsIgnoreCase } from '../../../utils';
import offlineMapJson from '../../../../assets/maps/british-columbia.json';
import { SmkApi } from '@app/utils/smk';
import { LatLng } from 'leaflet';
import { v5 as uuidv5 } from 'uuid';

@Component({
  selector: 'rof-review-page',
  templateUrl: './rof-review-page.component.html',
  styleUrls: ['./rof-review-page.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class RoFReviewPage extends RoFPage implements AfterViewInit {
  public reportOfFirePages: any;
  map: any;
  smkApi: SmkApi;
  isOffLine: boolean;
  currentLocation: any;
  public constructor(
    private reportOfFirePage: ReportOfFirePage,
    private commonUtilityService: CommonUtilityService,
    private cdr: ChangeDetectorRef,
    private reportOfFireService: ReportOfFireService,
    protected snackbarService: MatSnackBar,
  ) {
    super();
  }

  ngAfterViewInit(): void {
    this.loadMap();
  }

  initialize(data: any, index: number, reportOfFire: ReportOfFire) {
    super.initialize(data, index, reportOfFire);
    this.reportOfFirePages = ConfigJson.pages;
    const pagesToRemove = [
      'first-page',
      'permissions-page',
      'callback-page',
      'compass-page',
      'distance-page',
      'infrastructure-page',
      'response-page',
      'review-page',
      'final-page',
    ];
    this.reportOfFirePages = this.reportOfFirePages.filter(
      (page) => !pagesToRemove.includes(page.id),
    );
    this.commonUtilityService.checkOnline().then((result) => {
      if (!result) {
        this.isOffLine = true;
      } else {
        this.isOffLine = false;
      }
    });
  }

  selectedAnswer(page: any) {
    switch (page.id) {
      case 'contact-page':
        return this.reportOfFire.consentToCall
          ? this.reportOfFire.consentToCall.charAt(0).toUpperCase() +
              this.reportOfFire.consentToCall.slice(1)
          : null;
      case 'location-page':
        return this.reportOfFire.fireLocation;
      case 'photo-page':
        return this.photoNumber();
      case 'smoke-color-page':
        return this.reportOfFire.smokeColor
          ? this.reportOfFire.smokeColor
              .map((item) => this.findLabelByValue(page.id, item))
              .join(', ')
          : null;
      case 'fire-size-page':
        return this.reportOfFire.fireSize
          ? this.findLabelByValue(page.id, this.reportOfFire.fireSize)
          : null;
      case 'response-details-page':
        //make the first letter of a string uppercase
        return this.reportOfFire.ifSignsOfResponse
          ? this.reportOfFire.ifSignsOfResponse.charAt(0).toUpperCase() +
              this.reportOfFire.ifSignsOfResponse.slice(1)
          : null;
      case 'visible-flame-page':
        return this.reportOfFire.visibleFlame
          ? this.reportOfFire.visibleFlame.charAt(0).toUpperCase() +
              this.reportOfFire.visibleFlame.slice(1)
          : null;
      case 'fire-spread-page':
        return this.reportOfFire.rateOfSpread
          ? this.findLabelByValue(page.id, this.reportOfFire.rateOfSpread)
          : null;
      case 'what-is-burning-page':
        return this.reportOfFire.burning
          ? this.reportOfFire.burning
              .map((item) => this.findLabelByValue(page.id, item))
              .join(', ')
          : null;
      case 'infrastructure-details-page':
        return this.reportOfFire.ifAssetsAtRisk
          ? this.reportOfFire.ifAssetsAtRisk.charAt(0).toUpperCase() +
              this.reportOfFire.ifAssetsAtRisk.slice(1)
          : null;
      case 'comments-page':
        return this.reportOfFire.otherInfo;
      default:
        return null;
    }
  }

  selectedAnswerPart2(page: any) {
    switch (page.id) {
      case 'contact-page':
        const phoneNumber = ('' + this.reportOfFire.phoneNumber).replace(
          /\D/g,
          '',
        );
        const match = phoneNumber.match(/^(\d{3})(\d{3})(\d{4})$/);
        // reformate to phonenumber
        if (match) {
          return (
            this.reportOfFire.fullName +
            '\n' +
            '(' +
            match[1] +
            ') ' +
            match[2] +
            '-' +
            match[3]
          );
        }
      case 'response-details-page':
        return this.reportOfFire.signsOfResponse
          ? this.reportOfFire.signsOfResponse
              .map((item) => this.findLabelByValue(page.id, item))
              .join(', ')
          : null;
      case 'infrastructure-details-page':
        return this.reportOfFire.assetsAtRisk
          ? this.reportOfFire.assetsAtRisk
              .map((item) => this.findLabelByValue(page.id, item))
              .join(', ')
          : null;
    }
  }

  twoPartsQuestions(page: any) {
    if (
      page.id === 'contact-page' &&
      this.reportOfFire.consentToCall === 'yes'
    ) {
      return true;
    } else if (
      page.id === 'response-details-page' &&
      this.reportOfFire.ifSignsOfResponse === 'yes'
    ) {
      return true;
    } else if (
      page.id === 'infrastructure-details-page' &&
      this.reportOfFire.ifAssetsAtRisk === 'yes'
    ) {
      return true;
    } else {
      return false;
    }
  }

  photoNumber() {
    let photoNumber = 0;
    if (this.reportOfFire.image1) {
      photoNumber++;
    }
    if (this.reportOfFire.image2) {
      photoNumber++;
    }
    if (this.reportOfFire.image3) {
      photoNumber++;
    }
    if (photoNumber === 0) {
      return 'Skipped';
    } else if (photoNumber === 1) {
      return photoNumber + ' photo added';
    } else {
      return photoNumber + ' photos added';
    }
  }

  loadMap() {
    if (this.map) {
      this.map.remove();
    }
    const location = this.reportOfFire.fireLocation;
    this.map = L.map('map', {
      attributionControl: false,
      zoomControl: false,
      dragging: false,
      doubleClickZoom: false,
      boxZoom: false,
      trackResize: false,
      scrollWheelZoom: false,
    });

    // Calculate the bounding box
    if (this.reportOfFire.currentLocation && this.reportOfFire.fireLocation) {
      const bbox = L.latLngBounds(
        this.reportOfFire.currentLocation,
        this.reportOfFire.fireLocation,
      );
      const zoomLevel = this.map.getBoundsZoom(bbox);
      this.map.setView(bbox.getCenter(), zoomLevel);
    }
    // Calculate the ideal zoom level to fit the bounding box within the map's view
    // configure map data
    L.tileLayer(
      'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
      {
        zoom: 5,
        subdomains: ['mt0', 'mt1', 'mt2', 'mt3'],
      },
    ).addTo(this.map);

    this.commonUtilityService.checkOnline().then((result) => {
      if (!result) {
        const geoJsonData = offlineMapJson;
        L.geoJson(geoJsonData, {
          style: {
            color: '#6495ED',
            weight: 8,
            fillColor: '',
            fillOpacity: 0.00001,
          },
          zoom: 6,
          subdomains: ['mt0', 'mt1', 'mt2', 'mt3'],
        }).addTo(this.map);
      }
    });

    const fireLocationIcon = L.divIcon({
      html: '<i class="fireLocationIcon material-icons">location_searching</i>',
      iconSize: [48, 48],
      className: 'fireLocationIcon',
    });
    L.marker(location, { icon: fireLocationIcon }).addTo(this.map);

    L.marker(this.reportOfFire.currentLocation, {
      icon: L.divIcon({
        className: 'rof-location',
        iconSize: [20, 20],
        iconAnchor: [14, 14],
      }),
    }).addTo(this.map);

    // draw the arrow and lines between fire location and current location
    const latlngs = Array();
    if (
      this.reportOfFire?.fireLocation?.length &&
      this.reportOfFire?.currentLocation?.length &&
      this.reportOfFire.estimatedDistance
    ) {
      // Code to be executed if both fireLocation and currentLocation arrays have elements
      const direction = this.commonUtilityService.calculateBearing(
        this.reportOfFire.currentLocation[0],
        this.reportOfFire.currentLocation[1],
        this.reportOfFire.fireLocation[0],
        this.reportOfFire.fireLocation[1],
      );

      const initialFirePoint: LatLng = L.latLng(
        this.reportOfFire.fireLocation[0],
        this.reportOfFire.fireLocation[1],
      );
      const currentLocationFirePoint: LatLng = L.latLng(
        this.reportOfFire.currentLocation[0],
        this.reportOfFire.currentLocation[1],
      );
      const pointI = this.map.latLngToContainerPoint(initialFirePoint); // convert to containerpoint (px);
      const pointC = this.map.latLngToContainerPoint(currentLocationFirePoint); // convert to containerpoint (px);

      const distanceInPixels = this.calculateDistanceInPixels(
        pointI.x,
        pointI.y,
        pointC.x,
        pointC.y,
      );
      const metersPerPixel =
        this.reportOfFire.estimatedDistance / distanceInPixels;
      const offSet = metersPerPixel * 35;
      const angleInRadians = ((direction + 180) * Math.PI) / 180;
      // calculates a new latitude value by adding a offset (in meters) to the initial latitude,
      // considering the angle and the Earth's radius
      const newLatitude =
        initialFirePoint.lat +
        (offSet * Math.cos(angleInRadians)) / ((Math.PI * 6378137) / 180);
      const newLongitude =
        initialFirePoint.lng +
        (offSet * Math.sin(angleInRadians)) /
          ((Math.PI * 6378137) / 180) /
          Math.cos((initialFirePoint.lat * Math.PI) / 180);
      const newFirePoint = [newLatitude, newLongitude];

      latlngs.push(newFirePoint);
      latlngs.push(this.reportOfFire.currentLocation);
      L.polyline(latlngs, { color: 'yellow', opacity: 0.7 }).addTo(this.map);

      L.marker(newFirePoint, {
        icon: L.divIcon({
          className: 'rof-arrow-head',
          html: `<i class="material-icons" style="transform:rotateZ(${direction}deg);color:yellow;">navigation</i>`,
          iconSize: [24, 24],
          iconAnchor: [12, 12],
        }),
      }).addTo(this.map);

      const middlePoint = this.calculateMiddlePoint(
        this.reportOfFire.fireLocation[0],
        this.reportOfFire.fireLocation[1],
        this.reportOfFire.currentLocation[0],
        this.reportOfFire.currentLocation[1],
      );
      L.tooltip({})
        .setContent(
          (this.reportOfFire.estimatedDistance / 1000).toFixed(3) + ' km',
        )
        .setLatLng(middlePoint)
        .addTo(this.map);
    }
  }

  edit(pageId: string, secondStep?: boolean) {
    if (pageId === 'contact-page' && !secondStep) {
      this.reportOfFirePage.edit('callback-page');
    } else if (pageId === 'response-details-page' && !secondStep) {
      this.reportOfFirePage.edit('response-page');
    } else if (pageId === 'infrastructure-details-page' && !secondStep) {
      this.reportOfFirePage.edit('infrastructure-page');
    } else {
      this.reportOfFirePage.edit(pageId);
    }
  }

  findLabelByValue(pageId: string, valueToFind: string) {
    if (pageId && valueToFind) {
      const page = this.reportOfFirePages.find((page: { id: string }) => page.id === pageId);
      const button = page.buttons.find(
        (button: { value: string }) => button.value === valueToFind,
      );
      if (valueToFind === 'Unknown') {
        return 'Unknown';
      }
      if (button) {
        const label = button.label;
        return label;
      }
    }
  }

  async useMyCurrentLocation() {
    this.currentLocation =
      await this.commonUtilityService.getCurrentLocationPromise();
  }

  async submitRof() {
    await this.commonUtilityService.checkOnline().then(async (result) => {
      if (!result) {
        await this.useMyCurrentLocation();
        this.reportOfFire.fireLocation = [
          this.currentLocation.coords.latitude,
          this.currentLocation.coords.longitude,
        ];
      }
    });

    // seed string to create submission UUID
    const fixedFireLocation = [this.reportOfFire.fireLocation[0].toFixed(3), this.reportOfFire.fireLocation[1].toFixed(3)]
    const seedString = this.reportOfFire.fullName + this.reportOfFire.phoneNumber + fixedFireLocation.toString();

    // uuid library requires custom namespace GUID e.g. 7f7c68e7-8eab-4281-9c1f-4fe3d3e56e62
    const uniqueID = uuidv5(seedString, "7f7c68e7-8eab-4281-9c1f-4fe3d3e56e62")

    const rofResource: ReportOfFireType = {
      fullName: this.nullEmptyStrings(this.reportOfFire.fullName),
      phoneNumber: this.nullEmptyStrings(this.reportOfFire.phoneNumber),
      consentToCall: equalsIgnoreCase(this.reportOfFire.consentToCall, 'Yes')
        ? true
        : false,
      estimatedDistance: this.reportOfFire.estimatedDistance,
      fireLocation: this.reportOfFire.fireLocation,
      deviceLocation: this.reportOfFire.deviceLocation,
      fireSize: this.nullEmptyStrings(this.reportOfFire.fireSize),
      rateOfSpread: this.reportOfFire.rateOfSpread,
      burning: this.reportOfFire.burning,
      smokeColor: this.reportOfFire.smokeColor,
      weather: this.reportOfFire.weather,
      assetsAtRisk: this.reportOfFire.assetsAtRisk,
      signsOfResponse: this.reportOfFire.signsOfResponse,
      otherInfo: this.reportOfFire.otherInfo,
      submittedTimestamp: new Date().getTime().toString(),
      visibleFlame: new Array<string>(this.reportOfFire.visibleFlame),
      submissionID: uniqueID
    };

    try {
      this.reportOfFireService.saveReportOfFire(
        rofResource,
        this.reportOfFire.image1,
        this.reportOfFire.image2,
        this.reportOfFire.image3,
      );
      this.next();
    } catch (err) {
      this.snackbarService.open(
        'Failed to submit Report Of Fire: ' + JSON.stringify(err.message),
        'OK',
        { duration: 10000, panelClass: 'snackbar-error' },
      );
    } finally {
      this.cdr.detectChanges();
    }
  }
  nullEmptyStrings(value: string) {
    return !value ? null : value;
  }

  calculateMiddlePoint(
    lat1: number,
    lon1: number,
    lat2: number,
    lon2: number,
  ): { lat: number; lon: number } {
    const middleLat = (lat1 + lat2) / 2;
    const middleLon = (lon1 + lon2) / 2;
    return { lat: middleLat, lon: middleLon };
  }

  calculateDistanceInPixels(x1, y1, x2, y2) {
    const xDistance = x2 - x1;
    const yDistance = y2 - y1;
    // Calculate the distance using the Pythagorean theorem
    const distance = Math.sqrt(xDistance * xDistance + yDistance * yDistance);

    return distance;
  }
}