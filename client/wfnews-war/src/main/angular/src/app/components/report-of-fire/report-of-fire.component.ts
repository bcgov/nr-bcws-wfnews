import { AfterContentInit, ChangeDetectorRef, Component, ComponentRef, OnInit, ViewChild, ViewContainerRef } from "@angular/core"
import { RoFTitlePage } from "./title-page/rof-title-page.component";
import { RoFPermissionsPage } from "./permissions-page/rof-permissions-page.component";
import { RoFSimpleQuestionPage } from "./simple-question-page/rof-simple-question-page.component";
import { RoFContactPage } from "./contact-page/rof-contact-page.component";
import { RoFLocationPage } from "./location-page/rof-location-page.component";
import { RoFPhotoPage } from "./photo-page/rof-photo-page.component";
import { ReportOfFire } from "./reportOfFireModel";
import { RoFComplexQuestionPage } from "./complex-question-page/rof-complex-question-page.component";

import ConfigJson from './report-of-fire.config.json';
import { RoFCommentsPage } from "./comment-page/rof-comments-page.component";
import { RoFReviewPage } from "./review-page/rof-review-page.component";
import { Router } from "@angular/router";
import { report } from "process";

@Component({
  selector: 'report-of-fire',
  templateUrl: './report-of-fire.component.html',
  styleUrls: ['./report-of-fire.component.scss']
})
export class ReportOfFirePage implements OnInit, AfterContentInit {
  public reportOfFire: ReportOfFire;
  public pageComponents: Array<ComponentRef<any>> = [];
  public pageIndex: number = 0;
  public allowExit: boolean = false;
  public allowSkip: boolean = false;

  @ViewChild('dynamic', { static: true, read: ViewContainerRef })
  private dynamicContainer!: ViewContainerRef;

  constructor(private router: Router, protected cdr: ChangeDetectorRef) {
    this.pageComponents = [];
  }

  ngOnInit() {
    for (let index = 0; ConfigJson.pages.length > index; index++) {
      const page = ConfigJson.pages[index];
      let component = undefined;
      this.reportOfFire = new ReportOfFire();

      switch(page.type) {
        case "RoFTitlePage":
          component = this.dynamicContainer.createComponent(RoFTitlePage);
        break;
        case "RoFPermissionsPage":
          component = this.dynamicContainer.createComponent(RoFPermissionsPage);
        break;
        case "RoFSimpleQuestionPage":
          component = this.dynamicContainer.createComponent(RoFSimpleQuestionPage);
        break;
        case "RoFContactPage":
          component = this.dynamicContainer.createComponent(RoFContactPage);
        break;
        case "RoFLocationPage":
          component = this.dynamicContainer.createComponent(RoFLocationPage);
        break;
        case "RoFPhotoPage":
          component = this.dynamicContainer.createComponent(RoFPhotoPage);
        break;
        case "RoFComplexQuestionPage":
          component = this.dynamicContainer.createComponent(RoFComplexQuestionPage);
        break;
        case "RoFCommentsPage":
          component = this.dynamicContainer.createComponent(RoFCommentsPage);
        break;
        case "RoFReviewPage":
          component = this.dynamicContainer.createComponent(RoFReviewPage);
        break;
      }

      if (component) {
        component.instance.initialize(page, index, this.reportOfFire);
        // button definitions for go back, next question, and skip question.

        if (!page.previousIndex) page.previousIndex = 1
        if (!page.skipIndex) page.skipIndex = 1

        component.instance.previous = () => { this.selectPage(index - page.previousIndex) }
        component.instance.next = () => { this.selectPage(index + 1) }
        component.instance.skip = () => { this.selectPage(index + page.skipIndex) }
        component.instance.close = () => { this.exit() }

        this.pageComponents.push(component);
        this.dynamicContainer.detach(0)
      } else {
        console.warn('Failed to load dynamic RoF page ' + page.type)
      }
    }
  }

  ngAfterContentInit() {
    this.selectPage(0)
  }

  selectPage (index: number) {
    if (this.dynamicContainer.length > 0) {
      // before detachment, update RoF
      this.updateReportOfFire(this.pageComponents[index].instance.reportOfFire, this.pageComponents[index].instance.updateAttribute)
      this.dynamicContainer.detach(0)
    }

    this.pageIndex = index;
    const component = this.pageComponents[index];
    component.instance.reportOfFire = this.reportOfFire;
    this.dynamicContainer.insert(component.hostView);

    this.allowExit = component.instance.allowExit;
    this.allowSkip = component.instance.allowSkip
  }

  updateReportOfFire (reportOfFire: ReportOfFire, attribute: string | Array<string>) {
    if (!attribute) {
      return;
    }

    if (Array.isArray(attribute)) {
      for (const att of attribute) {
        this.reportOfFire[att] = reportOfFire[att];
      }
    } else {
      this.reportOfFire[attribute] = reportOfFire[attribute];
    }

    console.log(this.reportOfFire)
  }

  exit () {
    this.router.navigateByUrl('/map')
  }

  skip () {
    if (this.pageIndex <= this.pageComponents.length - 1) {
      this.pageComponents[this.pageIndex].instance.skip();
    }
  }
}
