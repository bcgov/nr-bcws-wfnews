import {
  Component,
  ChangeDetectionStrategy,
  ViewChild,
  ChangeDetectorRef,
} from '@angular/core';
import { RoFPage } from '../rofPage';
import { ReportOfFire } from '../reportOfFireModel';
import {
  MatButtonToggleChange,
  MatButtonToggleGroup,
} from '@angular/material/button-toggle';
import { ReportOfFirePage } from '@app/components/report-of-fire/report-of-fire.component';
import { CommonUtilityService } from '@app/services/common-utility.service';
import * as turf from '@turf/turf';

/** The value that "I'm not sure" stores, on this page and in the review. */
const UNKNOWN = 'Unknown';

@Component({
  selector: 'rof-complex-question-page',
  templateUrl: './rof-complex-question-page.component.html',
  styleUrls: ['./rof-complex-question-page.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class RoFComplexQuestionPage extends RoFPage {
  public allowIDontKnowButton: boolean;
  public allowMultiSelect: boolean;
  public disableNext = true;
  public buttons: Array<any>;
  isEditMode = false;
  isPageDirty = false;
  readonly unknownValue = UNKNOWN;

  @ViewChild(MatButtonToggleGroup) group?: MatButtonToggleGroup;

  public constructor(
    private reportOfFirePage: ReportOfFirePage,
    private cdr: ChangeDetectorRef,
    private commonUtilityService: CommonUtilityService,
  ) {
    super();
  }

  initialize(data: any, index: number, reportOfFire: ReportOfFire) {
    super.initialize(data, index, reportOfFire);
    this.allowIDontKnowButton = data.allowIDontKnowButton;
    this.allowMultiSelect = data.allowMultiSelect;
    this.buttons = data.buttons;
    this.disableNext = !this.hasSelection();
  }

  /** What the group shows. The report holds the answer, so it is the one source. */
  get selection(): string | string[] {
    return this.reportOfFire?.[this.updateAttribute];
  }

  private hasSelection(): boolean {
    const value = this.selection;
    return Array.isArray(value) ? value.length > 0 : !!value;
  }

  editMode() {
    this.isPageDirty = false;
    this.isEditMode = true;
    this.cdr.detectChanges();
  }

  /**
   * One group holds every option, so Material keeps the selection and the markup says
   * what the control is. The only rule left here is that "I'm not sure" stands alone.
   */
  onSelectionChange(event: MatButtonToggleChange): void {
    this.isPageDirty = true;
    let value = event.value;

    if (
      this.allowMultiSelect &&
      Array.isArray(value) &&
      value.length > 1 &&
      value.includes(UNKNOWN)
    ) {
      value =
        event.source.value === UNKNOWN
          ? [UNKNOWN]
          : value.filter((item: string) => item !== UNKNOWN);
      this.group.value = value;
    }

    this.reportOfFire[this.updateAttribute] = value;
    this.disableNext = !this.hasSelection();
    this.cdr.markForCheck();
  }

  backToReview() {
    this.reportOfFirePage.edit('review-page');
  }

  previousPage() {
    if (this.id === 'distance-page') {
      this.reportOfFire.headingDetectionActive = true;
      if (this.reportOfFire.motionSensor === 'yes' && !this.commonUtilityService.checkIfLandscapeMode()) {
        this.previous();
      } else {
        this.reportOfFirePage.selectPage('permissions-page', null, false);
      }
    } else {
      this.previous();
    }
  }

  nextPage() {
    return this.leave(() => this.next());
  }

  /** The wizard header calls this. Offline, Skip also passes the map page. */
  skipPage() {
    return this.leave(() => this.skip());
  }

  /**
   * With no network the location page is skipped, because a map needs tiles. The
   * fire is placed here instead, from the position the Permissions page took.
   */
  private async leave(online: () => void) {
    if (
      this.id !== 'distance-page' ||
      (await this.commonUtilityService.checkOnline())
    ) {
      online();
      return;
    }
    this.placeFireOffline();
    this.reportOfFirePage.selectPage('photo-page', null, false);
  }

  /**
   * `turf.destination` is the same calculation that places the fire on the location
   * page, and it is in the bundle, so it works with no network.
   */
  private placeFireOffline(): void {
    const [lat, lon] = (this.reportOfFire.deviceLocation ?? []).map(Number);
    if (!lat && !lon) {
      return;
    }

    const km = Number(this.reportOfFire.estimatedDistance) / 1000;
    const heading = Number(this.reportOfFire.compassHeading);
    if (!turf || !km || Number.isNaN(heading)) {
      // No heading or no distance. The device position is the best answer left.
      this.reportOfFire.fireLocation = [lat, lon];
      return;
    }

    // turf works in [longitude, latitude]. The report holds [latitude, longitude].
    const point = turf.destination([lon, lat], km, heading);
    const [fireLon, fireLat] = point.geometry.coordinates;
    this.reportOfFire.fireLocation = [Number(fireLat), Number(fireLon)];
  }
}
