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
        return this.reportOfFire.consentToCall ? 'Yes' : 'No';
      case 'location-page' :
        return this.reportOfFire.fireLocation
      case 'photo-page' :
        return this.photoNumber()
      case 'smoke-color-page' :
        return this.reportOfFire.smokeColor;
      case 'fire-size-page' :
        return this.reportOfFire.fireSize;
      case 'response-details-page' :
        return this.reportOfFire.signsOfResponse;
      case 'visible-flame-page' :
        return this.reportOfFire.visibleFlame;
      case 'fire-spread-page' :
        return this.reportOfFire.rateOfSpread;
      case 'what-is-burning-page' :
        return this.reportOfFire.burning;
      case 'infrastructure-details-page' :
        return this.reportOfFire.assetsAtRisk;
      case 'comments-page' :
        return this.reportOfFire.otherInfo;
      default :
        return null;
    }
  }

  selectedAnswerPart2(page: any) {
    switch(page.id) {
      case 'contact-page' :
        var phoneNumber = ('' + this.reportOfFire.phoneNumber).replace(/\D/g, '');
        var match = phoneNumber.match(/^(\d{3})(\d{3})(\d{4})$/); 
        // reformate to phonenumber
        if (match) {
          console.log(match)
          return (this.reportOfFire.fullName) + '\n' + '(' + match[1] + ') ' + match[2] + '-' + match[3];
        }
    }
  }

  twoPartsQuestions(page:any) {
    switch(page.id) {
      case 'contact-page' :
        if (this.reportOfFire.consentToCall && this.reportOfFire.fullName && this.reportOfFire.phoneNumber) {
          return true
        }
      default:
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
    if ( photoNumber === 0) {
      return 'Skipped'
    }
    else if ( photoNumber === 1) {
      return photoNumber + ' photo added'
    }
    else  {
      return photoNumber + ' photos added'
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
