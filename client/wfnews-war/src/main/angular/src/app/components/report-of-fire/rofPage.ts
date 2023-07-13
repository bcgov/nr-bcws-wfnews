import { Component } from "@angular/core"
import { ReportOfFire } from "./reportOfFireModel"

@Component({
  selector: 'rof-page',
  template: '<div></div>'
})
export class RoFPage {
  public id: string
  public index: number
  public allowSkip: boolean
  public allowExit: boolean
  public reportOfFire: ReportOfFire
  public title: string
  public message: string
  public updateAttribute: string
  public showProgress: boolean

  initialize (data: any, index: number, reportOfFire: ReportOfFire) {
    this.allowExit = data.allowExit;
    this.allowSkip = data.allowSkip;
    this.message = data.message;
    this.title = data.title;
    this.showProgress = data.showProgress;
    this.updateAttribute = data.updateAttribute || '';
    this.index = index;
    this.reportOfFire = reportOfFire;
  }

  previous () {
    // stub used for instantiation of extended components
  }

  next () {
    // stub used for instantiation of extended components
  }

  skip () {
    // stub used for instantiation of extended components
  }
}
