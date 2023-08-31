import { Component, ChangeDetectionStrategy } from "@angular/core";
import { RoFPage } from "../rofPage";
import { ReportOfFire } from "../reportOfFireModel";
import ConfigJson from '../report-of-fire.config.json';
import { startWith } from "rxjs/operators";


@Component({
  selector: 'rof-review-page',
  templateUrl: './rof-review-page.component.html',
  styleUrls: ['./rof-review-page.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class RoFReviewPage extends RoFPage {
  public reportOfFirePages: any;

  public constructor() {
    super()
  }

  initialize (data: any, index: number, reportOfFire: ReportOfFire) {
    super.initialize(data, index, reportOfFire);
    this.reportOfFirePages = ConfigJson.pages
    const pagesToRemove = [
      'first-page',
      'permissions-page',
      'callback-page',
      'distance-page',
      'infrastructure-page',
      'response-page',
      'review-page',
      'final-page'
    ];
    this.reportOfFirePages = this.reportOfFirePages.filter(page => !pagesToRemove.includes(page.id));
  }

  selectedAnswer(page:any) {
    switch(page.id){
      case 'contact-page' : 
        if (this.reportOfFire.consentToCall) {
          
        }
        return this.reportOfFire.consentToCall ? 'Yes' : 'No';
      case 'location-page' :
        return this.reportOfFire.fireLocation
    }
    console.log(page);
    // return 'Value001'
  }

  selectedAnswerPart2(page: any) {
    switch(page.id) {
      case 'contact-page' :
        return (this.reportOfFire.fullName) + '\n' +(this.reportOfFire.phoneNumber)
    }
  }

  twoPartsQuestions(page:any) {
    switch(page.id) {
      case 'contact-page' :
        if (this.reportOfFire.consentToCall && this.reportOfFire.fullName && this.reportOfFire.phoneNumber) {
          debugger
          return true
        }
      default:
        return false;
    }
  }

  parseJson () {
    console.log(ConfigJson)
    return JSON.stringify(this.reportOfFire);
  }

  edit() {
    console.log('EDIT')
    //todo: navigate to the step page
  }
}
