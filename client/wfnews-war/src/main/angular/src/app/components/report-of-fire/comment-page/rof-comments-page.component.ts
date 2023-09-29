import { Component, ChangeDetectionStrategy, ChangeDetectorRef } from "@angular/core";
import { RoFPage } from "../rofPage";
import { ReportOfFire } from "../reportOfFireModel";
import { ReportOfFirePage } from "@app/components/report-of-fire/report-of-fire.component";

@Component({
  selector: 'rof-comments-page',
  templateUrl: './rof-comments-page.component.html',
  styleUrls: ['./rof-comments-page.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class RoFCommentsPage extends RoFPage {
  isEditMode: boolean = false;
  isPageDirty: boolean = false;
  maxLength: number = 500;
  public constructor(private cdr: ChangeDetectorRef, private reportOfFirePage: ReportOfFirePage) {
    super()
  }

  initialize (data: any, index: number, reportOfFire: ReportOfFire) {
    super.initialize(data, index, reportOfFire);
  }

  editMode() {
    this.isPageDirty = false;
    this.isEditMode = true;
    this.cdr.detectChanges()
  }

  onTextAreaChange() {
    this.isPageDirty = true;
  }

  backToReview() {
    this.reportOfFirePage.edit('review-page')
  }
}
