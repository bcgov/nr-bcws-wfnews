import { Component, ChangeDetectionStrategy, ChangeDetectorRef } from "@angular/core";
import { RoFPage } from "../rofPage";
import { ReportOfFire } from "../reportOfFireModel";
import { ReportOfFirePage } from "@app/components/report-of-fire/report-of-fire.component";

@Component({
  selector: 'rof-simple-question-page',
  templateUrl: './rof-simple-question-page.component.html',
  styleUrls: ['./rof-simple-question-page.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class RoFSimpleQuestionPage extends RoFPage {
  public allowIDontKnowButton: boolean
  public localVal: any;
  public optionSelected: string;
  isEditMode: boolean = false;
  isPageDirty: boolean = false;
  offLine: boolean = false;

  public constructor(private reportOfFirePage: ReportOfFirePage,private cdr:ChangeDetectorRef) {
    super()
  }

  initialize (data: any, index: number, reportOfFire: ReportOfFire) {
    super.initialize(data, index, reportOfFire)
    this.allowIDontKnowButton = data.allowIDontKnowButton;
  }

  onValChange (value) {
    this.isPageDirty = true;
    this.optionSelected = value;
    if (value && this.updateAttribute && this.updateAttribute !== "") {
      this.reportOfFire[this.updateAttribute] = value;
    }
  }

  processToNext(){
    if( (this.id === 'response-page' || this.id === 'infrastructure-page') && this.optionSelected !== 'yes'){
      this.skip()
    }
    else{
      this.next()
    }
  }

  editMode() {
    this.isPageDirty = false;
    this.isEditMode = true;
    this.cdr.detectChanges()
  }

  backToReview() {
    if (this.id === 'callback-page' && this.reportOfFire[this.updateAttribute] === 'no') {
      this.reportOfFire.phoneNumber == null;
      this.reportOfFire.fullName == null;
    }
    this.reportOfFirePage.edit('review-page')
  }

  twoPartsQuestions() {
    if (this.id === 'callback-page' || this.id === 'response-page' || this.id === 'infrastructure-page') {
      if (this.reportOfFire[this.updateAttribute] === 'no' || this.reportOfFire[this.updateAttribute] === 'I\'m not sure') {
        return false;
      }
      return true;
    }
  }

  nextPart() {
    this.reportOfFirePage.edit(this.nextId);
  }
}
