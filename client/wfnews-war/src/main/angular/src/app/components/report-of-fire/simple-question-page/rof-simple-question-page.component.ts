import { Component, ChangeDetectionStrategy } from "@angular/core";
import { RoFPage } from "../RoFPage";
import { ReportOfFire } from "../reportOfFireModel";

@Component({
  selector: 'rof-simple-question-page',
  templateUrl: './rof-simple-question-page.component.html',
  styleUrls: ['./rof-simple-question-page.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class RoFSimpleQuestionPage extends RoFPage {
  public allowIDontKnowButton: boolean
  public localVal: any;

  public constructor() {
    super()
  }

  initialize (data: any, index: number, reportOfFire: ReportOfFire) {
    super.initialize(data, index, reportOfFire)
    this.allowIDontKnowButton = data.allowIDontKnowButton;
  }

  onValChange (value) {
    if (value && this.updateAttribute && this.updateAttribute !== '') {
      this.reportOfFire[this.updateAttribute] = value;
    }
  }
}
