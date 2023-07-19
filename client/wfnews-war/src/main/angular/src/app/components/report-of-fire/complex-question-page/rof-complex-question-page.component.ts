import { Component, ChangeDetectionStrategy } from "@angular/core";
import { RoFPage } from "../rofPage";
import { ReportOfFire } from "../reportOfFireModel";
import { MatButtonToggleChange } from "@angular/material/button-toggle";

@Component({
  selector: 'rof-complex-question-page',
  templateUrl: './rof-complex-question-page.component.html',
  styleUrls: ['./rof-complex-question-page.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class RoFComplexQuestionPage extends RoFPage {
  public allowIDontKnowButton: boolean;
  public allowMultiSelect: boolean;
  public disableNext: boolean = true;
  public buttons: Array<any>;
  public highlightedButton: HTMLElement;

  public constructor() {
    super()
  }

  initialize (data: any, index: number, reportOfFire: ReportOfFire) {
    super.initialize(data, index, reportOfFire);
    this.allowIDontKnowButton = data.allowIDontKnowButton;
    this.allowMultiSelect = data.allowMultiSelect;
    this.buttons = data.buttons;
  }

  onValChange (value: string, event: MatButtonToggleChange | PointerEvent) {
    // Handler to ensure single select buttons highlight on click
    // to match the toggle button appearance
    if ( event instanceof PointerEvent) {
      // middle of the button will return the span, edges will return the button itself
      // which is super annoying, so we need to check that we have an id set
      const clickedButton = (event.target as HTMLElement).id !== '' ? event.target as HTMLElement : (event.target as HTMLElement).parentElement;

      // remove the highlight on the currently selected button
      if (this.highlightedButton) {
        this.highlightedButton.classList.remove("btn-highlight");
      }

      // highlight the new button
      clickedButton.classList.add("btn-highlight");
      // and store it for later events
      this.highlightedButton = clickedButton
    }

    if (value && this.updateAttribute && this.updateAttribute !== '') {
      if (Array.isArray(this.reportOfFire[this.updateAttribute]) && !this.reportOfFire[this.updateAttribute].includes(value)) {
        this.reportOfFire[this.updateAttribute].push(value)
      } else if (Array.isArray(this.reportOfFire[this.updateAttribute]) && this.reportOfFire[this.updateAttribute].includes(value)) {
        const index = this.reportOfFire[this.updateAttribute].indexOf(value);
        this.reportOfFire[this.updateAttribute].splice(index, 1)
      } else {
        this.reportOfFire[this.updateAttribute] = value;
      }
    } else {
      this.highlightedButton.classList.remove("btn-highlight");
    }

    this.disableNext = false;
  }
}
