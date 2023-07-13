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

/**
 * Report of Fire parent container. This will hold the reportOfFire data
 * (which may move to local storage with the offline support, so a temp thing for now)
 * As well as the create and store the pages for the "wizard"
 */
@Component({
  selector: 'report-of-fire',
  templateUrl: './report-of-fire.component.html',
  styleUrls: ['./report-of-fire.component.scss']
})
export class ReportOfFirePage implements OnInit, AfterContentInit {
  public reportOfFire: ReportOfFire;
  public pageComponents: Array<ComponentRef<any>> = [];
  public pageIndex = 0;
  public allowExit = false;
  public allowSkip = false;
  public showProgress = false;
  public progressSteps = [];
  public currentStep = 0;

  @ViewChild('dynamic', { static: true, read: ViewContainerRef })
  private dynamicContainer!: ViewContainerRef;

  constructor(private router: Router, protected cdr: ChangeDetectorRef) {
    this.pageComponents = [];
  }

  ngOnInit() {
    // On RoF form startup, we want to load the config json and iterate through the
    // pages. At the current time, page order in the config is the order that will be
    // used by the component, but I'd like to update this so we can put an
    // index in the config rather than rely on order
    for (let index = 0; ConfigJson.pages.length > index; index++) {
      const page = ConfigJson.pages[index];
      let component = undefined;
      // Create a new instance of an RoF.
      // This may change to load from local store for offline support in the future
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

      // ensure we actually have a created component before continuing
      if (component) {
        component.instance.initialize(page, index, this.reportOfFire);

        // handle the potentially dynamic skip and previous behaviour
        // some pages may need to skip multiple indexs or go back
        // multiple indexes
        if (!page.previousIndex) page.previousIndex = 1
        if (!page.skipIndex) page.skipIndex = 1

        if (page.showProgress && !this.progressSteps.includes(page.title)) {
          this.progressSteps.push(page.title)
        }

        // button definitions for go back, next question, and skip question.
        component.instance.previous = () => { this.selectPage(index - page.previousIndex) }
        component.instance.next = () => { this.selectPage(index + 1) }
        component.instance.skip = () => { this.selectPage(index + page.skipIndex) }
        component.instance.close = () => { this.exit() }

        // Keep track of the component so we can easily page
        this.pageComponents.push(component);
        // and detach it for now, once it's created and initialized
        // we'll reattach later
        this.dynamicContainer.detach(0)
      } else {
        console.warn('Failed to load dynamic RoF page ' + page.type)
      }
    }
  }

  ngAfterContentInit() {
    // Once we're initialized and loaded, select the first page
    this.selectPage(0)
  }

  /**
   * Page selection for navigation of the RoF forms
   * @param index The page index. Zero-based
   */
  selectPage (index: number) {
    // If the container is currently displaying a form, we want to
    // detach it before pushing another one in. Detach, do not destroy
    if (this.dynamicContainer.length > 0) {
      // But, before we detach it, granb the components RoF instance and update to the parent instance
      // just in case of missed changes
      this.updateReportOfFire(this.pageComponents[index].instance.reportOfFire, this.pageComponents[index].instance.updateAttribute)
      this.dynamicContainer.detach(0)
    }

    // For progress bar handling. If the page tracks progress and isn't a sub-page (title match), then incrememnt
    // or decrement the progress bar depending on if we're going to next or previous
    if (this.pageIndex < index && this.pageComponents[index].instance.showProgress && this.pageComponents[index].instance.title !== this.pageComponents[this.pageIndex].instance.title) {
      this.currentStep++;
    } else if (this.pageIndex > index && this.pageComponents[this.pageIndex].instance.showProgress && this.pageComponents[index].instance.title !== this.pageComponents[this.pageIndex].instance.title) {
      this.currentStep--;
    }

    // get the new page index, for progress bar tracking and whatnot
    this.pageIndex = index;
    const component = this.pageComponents[index];
    // update the component to use the latest parent reportOfFire object, just to be sure
    // all updates are matching on all forms
    component.instance.reportOfFire = this.reportOfFire;
    // and finally insert the component into the container
    this.dynamicContainer.insert(component.hostView);

    // Check if the component allows for the exit, skip buttons, and will display the progress
    // bar at the bottom
    this.allowExit = component.instance.allowExit;
    this.allowSkip = component.instance.allowSkip;
    this.showProgress = component.instance.showProgress;

    // And finally, just as a safety (but should not be needed), call a detect changes on the form
    this.cdr.detectChanges();
  }

  /**
   * When a component updates their instance of the RoF form, we want to make sure
   * we're tracking the result of changes in both the parent and the child
   * This will likely move to local store or some better implementation in the
   * future, but I wanted to wait until we also had offline support going before
   * causing a potential local store conflict
   * @param reportOfFire The report of fire from the component
   * @param attribute the attribute that was updated. Can be a string or an array
   * @returns nothing
   */
  updateReportOfFire (reportOfFire: ReportOfFire, attribute: string | Array<string>) {
    // If we don't have an attribute that we're targeting for an update, we should just ignore the whole thing
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
  }

  /**
   * Exit ROF form and return to the /map route
   * This may change for mobile vs desktop
   */
  exit () {
    this.router.navigateByUrl('/map')
  }

  /**
   * RoF Container skip handler. This will execute the currently
   * displayed components "skip"
   */
  skip () {
    if (this.pageIndex <= this.pageComponents.length - 1) {
      this.pageComponents[this.pageIndex].instance.skip();
    }
  }
}
