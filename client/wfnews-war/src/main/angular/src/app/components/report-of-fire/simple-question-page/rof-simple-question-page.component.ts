import {
  Component,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  ViewChild,
} from '@angular/core';
import { RoFPage } from '../rofPage';
import { ReportOfFire } from '../reportOfFireModel';
import { ReportOfFirePage } from '@app/components/report-of-fire/report-of-fire.component';
import { CommonUtilityService } from '@app/services/common-utility.service';
import { MatButtonToggleGroup } from '@angular/material/button-toggle';

@Component({
  selector: 'rof-simple-question-page',
  templateUrl: './rof-simple-question-page.component.html',
  styleUrls: ['./rof-simple-question-page.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class RoFSimpleQuestionPage extends RoFPage {
  @ViewChild('questionOptions') questionOptions: MatButtonToggleGroup; // This captures questionOptions

  public allowIDontKnowButton: boolean;
  public localVal: any;
  public optionSelected: string;
  isEditMode = false;
  isPageDirty = false;
  offLine = false;

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
    this.offLine = !window.navigator.onLine;
  }

  onValChange(value) {
    this.isPageDirty = true;
    this.optionSelected = value;
    if (value && this.updateAttribute && this.updateAttribute !== '') {
      this.reportOfFire[this.updateAttribute] = value;
    }
  }

  processToNext() {
    console.log("WTF WHERE AM I")
    if (this.id === 'callback-page') {
this.reportOfFire.headingDetectionActive = true;
}
    if (
      (this.id === 'response-page' || this.id === 'infrastructure-page') &&
      this.optionSelected !== 'yes'
    ) {
      this.skip();
    } else {
      this.next();
    }
  }

  editMode() {
    this.isPageDirty = false;
    this.isEditMode = true;
    this.cdr.detectChanges();
  }

  backToReview() {
    if (
      this.id === 'callback-page' &&
      this.reportOfFire[this.updateAttribute] === 'no'
    ) {
      this.reportOfFire.phoneNumber = null;
      this.reportOfFire.fullName = null;
    }
    this.reportOfFirePage.edit('review-page');
  }

  twoPartsQuestions() {
    if (
      this.id === 'callback-page' ||
      this.id === 'response-page' ||
      this.id === 'infrastructure-page'
    ) {
      if (
        this.reportOfFire[this.updateAttribute] === 'no' ||
        this.reportOfFire[this.updateAttribute] === 'Unknown'
      ) {
        return false;
      }
      return true;
    }
  }

  nextPart() {
    this.reportOfFirePage.edit(this.nextId);
  }

  checkOnlineStatus() {
    this.commonUtilityService.pingService().subscribe(
      () => {
        this.offLine = false;
        this.cdr.detectChanges();
      },
      () => {
        this.offLine = true;
        this.cdr.detectChanges();
      },
    );
  }

  nextPage() {
    if (this.id === 'callback-page') {
      this.reportOfFire.headingDetectionActive = true;
      this.next();
    }
  }

  skipPage() {
    if (this.id === 'callback-page') {
      this.reportOfFire.headingDetectionActive = true;
      if (this.reportOfFire.motionSensor !== 'no' && !this.commonUtilityService.checkIfLandscapeMode()) {
        this.skip();
      } else {
        this.reportOfFirePage.selectPage('review-page', null, false);
      }
    } else {
      this.skip();
    }
  }

    getButtonText(): string {
      if (this.showProgress || this.id === 'callback-page' || this.id === 'contact-page') {
        return 'Next';
      }
      return 'Continue';
    }
  
    handleConfirmButtonClick(): void {
      if (this.id === 'callback-page' || this.id === 'contact-page') {
        // Special handling for callback-page and contact-page
        if (this.questionOptions?.value === 'no') {
          this.skipPage();  // Skip the page if 'no' is selected
        } else if (this.questionOptions?.value === 'yes') {
          this.nextPage();  // Proceed to the next page if 'yes' is selected
        } else {
          this.processToNext();  // If any other value or no value is selected
        }
      } else if (!this.showProgress) {
        // Handle 'Continue' behavior for other pages
        if (this.questionOptions?.value === 'yes') {
          this.nextPage();
        } else {
          this.skipPage();
        }
      } else {
        // Handle 'Next' behavior if showProgress is true
        this.processToNext();
      }
    }
    
  
}
