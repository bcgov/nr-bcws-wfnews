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
    if (this.id === 'distance-page') {
      this.commonUtilityService.checkOnline().then((result) => {
        if (!result) {
          this.reportOfFirePage.selectPage('photo-page', null, false);
        } else {
          this.next();
        }
      });
    } else {
      this.next();
    }
  }
}
