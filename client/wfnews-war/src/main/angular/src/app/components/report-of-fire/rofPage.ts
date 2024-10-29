import { Component } from '@angular/core';
import { ReportOfFire } from './reportOfFireModel';
import { v4 as uuidv4 } from 'uuid';

/**
 * This is the default page component used for the ROF screens
 * Made this a component rather than an interface in case we wanted
 * a "stub" page for injection, but this might not be needed so we
 * can likely change it to a plain interface in the future
 */

@Component({
  selector: 'rof-page',
  template: '<div></div>',
})
export class RoFPage {
  public id: string;
  public previousId: string;
  public nextId: string;
  public skipId: string;
  public isStartPage: boolean;
  public index: number;
  public allowSkip: boolean;
  public allowExit: boolean;
  public reportOfFire: ReportOfFire;
  public title: string;
  public offLineTitle: string;
  public subtitle: string;
  public offLineSubtitle: string;
  public message: string;
  public offLineMessage: string;
  public updateAttribute: string;
  public showProgress: boolean;
  public allowMultiSelect: boolean;

  initialize(data: any, index: number, reportOfFire: ReportOfFire) {
    this.allowExit = data.allowExit;
    this.allowSkip = data.allowSkip;
    this.isStartPage = data.isStartPage || false;
    this.message = data.message;
    this.offLineMessage = data.offLineMessage;
    this.title = data.title;
    this.offLineTitle = data.offLineTitle;
    this.subtitle = data.subtitle;
    this.offLineSubtitle = data.offLineSubtitle;
    this.showProgress = data.showProgress;
    this.allowMultiSelect = data.allowMultiSelect;
    this.updateAttribute = data.updateAttribute || '';
    this.index = index;
    this.reportOfFire = reportOfFire;
    this.id = data.id || uuidv4();
    this.previousId = data.previousId || null;
    this.nextId = data.nextId || null;
    this.skipId = data.skipId || null;
  }

  previous() {
    // stub used for instantiation of extended components
  }

  next() {
    // stub used for instantiation of extended components
  }

  skip() {
    // stub used for instantiation of extended components
  }

  close() {
    // stub used for instantiation of extended components
  }
}
