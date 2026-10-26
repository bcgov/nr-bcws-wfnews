import {
  AfterViewInit,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component
} from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ReportOfFirePage } from '@app/components/report-of-fire/report-of-fire.component';
import { CommonUtilityService } from '@app/services/common-utility.service';
import {
  ReportOfFireService,
  ReportOfFireType,
} from '@app/services/report-of-fire-service';
import { MapConfigService } from '@app/services/map-config.service';
import { coordsToExtent } from '@app/utils/preview-map';
import * as fnv from 'fnv-plus';
import { equalsIgnoreCase } from '../../../utils';
import { drawArrow, markerElement, toLonLat } from '../rof-arrow';
import ConfigJson from '../report-of-fire.config.json';
import { ReportOfFire } from '../reportOfFireModel';
import { RoFPage } from '../rofPage';
import * as turf from '@turf/turf';

@Component({
  selector: 'rof-review-page',
  templateUrl: './rof-review-page.component.html',
  styleUrls: ['./rof-review-page.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class RoFReviewPage extends RoFPage implements AfterViewInit {
  public reportOfFirePages: any;
  mapConfig = null;
  isOffLine: boolean;
  currentLocation: any;
  submitting: boolean = false;
  public constructor(
    private reportOfFirePage: ReportOfFirePage,
    private commonUtilityService: CommonUtilityService,
    private cdr: ChangeDetectorRef,
    private reportOfFireService: ReportOfFireService,
    private mapConfigService: MapConfigService,
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

  /**
   * The map is only in the DOM when online, so there is no offline branch here.
   * The extent holds both points; previewMapConfig caps how far it zooms in.
   */
  async loadMap() {
    const fire = this.reportOfFire?.fireLocation;
    if (!fire?.length) {
      return;
    }

    const coords = [toLonLat(fire)];
    const here = this.reportOfFire?.currentLocation;
    if (here?.length) {
      coords.push(toLonLat(here));
    }

    this.mapConfig = await this.mapConfigService.getPreviewMapConfig({
      extent: coordsToExtent(coords),
      maxZoom: 18,
      // A drag on the map scrolls the page; Edit is the way to change the location.
      pan: false,
    });
    this.cdr.markForCheck();
  }

  initMap(smk: any) {
    const fire = toLonLat(this.reportOfFire.fireLocation);

    smk.showFeature('rof-fire-location', turf.point(fire), {
      htmlMarker: () =>
        markerElement(
          'fireLocationIcon',
          '<i class="fireLocationIcon material-icons">location_searching</i>',
        ),
    });

    const here = this.reportOfFire?.currentLocation;
    if (!here?.length || !this.reportOfFire.estimatedDistance) {
      return;
    }

    const start = toLonLat(here);
    smk.showFeature('rof-current-location', turf.point(start), {
      htmlMarker: () => markerElement('rof-location'),
    });

    drawArrow(smk, start, fire);
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

  /** Never throws. The report must continue with no position. */
  async useMyCurrentLocation() {
    try {
      this.currentLocation =
        await this.commonUtilityService.getCurrentLocationPromise();
    } catch (error) {
      this.currentLocation = undefined;
    }
  }

  async submitRof() {
    if (this.submitting) {
      return;
    }

    this.submitting = true;

    try {
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
        visibleFlame: new Array<string>(this.reportOfFire.visibleFlame)
      };

      // use a modified resource object as the checksum seed to create a unique ID based on content
      // Round fireLocation coordinates to 4 decimals (approx 11m accuracy) so minor GPS drifts don't break deduplication
      const seedResource = { ...rofResource };
      if (seedResource.fireLocation && seedResource.fireLocation.length === 2) {
        seedResource.fireLocation = [
          Number(seedResource.fireLocation[0].toFixed(4)),
          Number(seedResource.fireLocation[1].toFixed(4))
        ];
      }

      let seedString = JSON.stringify(seedResource);

      if (this.reportOfFire.image1 && this.reportOfFire.image1.path) {
        seedString += this.reportOfFire.image1.path;
      }
      if (this.reportOfFire.image2 && this.reportOfFire.image2.path) {
        seedString += this.reportOfFire.image2.path;
      }
      if (this.reportOfFire.image3 && this.reportOfFire.image3.path) {
        seedString += this.reportOfFire.image3.path;
      }

      // Generate a fast 64-bit FNV-1a hash to use as the submissionID
      const uniqueID = fnv.hash(seedString, 64).hex();

      rofResource.submissionID = uniqueID;
      rofResource.submittedTimestamp = new Date().getTime().toString();

      await this.reportOfFireService.saveReportOfFire(
        rofResource,
        this.reportOfFire.image1,
        this.reportOfFire.image2,
        this.reportOfFire.image3,
      );
      this.next();
    } catch (err) {
      this.submitting = false;
      this.snackbarService.open(
        'Failed to submit Report Of Fire: ' + JSON.stringify(err.message || err),
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

}