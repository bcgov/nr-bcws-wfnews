import { Component, ChangeDetectionStrategy } from "@angular/core";
import { RoFPage } from "../RoFPage";
import { ReportOfFire } from "../reportOfFireModel";

@Component({
  selector: 'rof-complex-question-page',
  templateUrl: './rof-complex-question-page.component.html',
  styleUrls: ['./rof-complex-question-page.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class RoFComplexQuestionPage extends RoFPage {
  public allowIDontKnowButton: boolean;
  public allowMultiSelect: boolean;
  public buttons: Array<any>;

  public constructor() {
    super()
  }

  initialize (data: any, index: number, reportOfFire: ReportOfFire) {
    super.initialize(data, index, reportOfFire);
    this.allowIDontKnowButton = data.allowIDontKnowButton;
    this.allowMultiSelect = data.allowMultiSelect;
    this.buttons = data.buttons;
  }

  onValChange (value) {
    if (this.updateAttribute && this.updateAttribute !== '') {

      if (Array.isArray(this.reportOfFire[this.updateAttribute]) && !this.reportOfFire[this.updateAttribute].includes(value)) {
        this.reportOfFire[this.updateAttribute].push(value)
      } if (Array.isArray(this.reportOfFire[this.updateAttribute]) && this.reportOfFire[this.updateAttribute].includes(value)) {
        const index = this.reportOfFire[this.updateAttribute].indexOf(value);
        this.reportOfFire[this.updateAttribute].splice(index, 1)
      } else {
        this.reportOfFire[this.updateAttribute] = value;
      }
    }
  }
}
