import {
  AfterContentInit,
  ChangeDetectorRef,
  Component,
  ComponentRef,
  OnInit,
  ViewChild,
  ViewContainerRef,
} from '@angular/core';
import { RoFTitlePage } from './title-page/rof-title-page.component';
import { Location } from '@angular/common';
import { RoFPermissionsPage } from './permissions-page/rof-permissions-page.component';
import { RoFSimpleQuestionPage } from './simple-question-page/rof-simple-question-page.component';
import { RoFContactPage } from './contact-page/rof-contact-page.component';
import { RoFLocationPage } from './location-page/rof-location-page.component';
import { RoFPhotoPage } from './photo-page/rof-photo-page.component';
import { ReportOfFire } from './reportOfFireModel';
import { RoFComplexQuestionPage } from './complex-question-page/rof-complex-question-page.component';
import ConfigJson from './report-of-fire.config.json';
import { RoFCommentsPage } from './comment-page/rof-comments-page.component';
import { RoFReviewPage } from './review-page/rof-review-page.component';
import { Router } from '@angular/router';
import { RoFCompassPage } from './compass-page/rof-compass-page.component';
import { CommonUtilityService } from '@app/services/common-utility.service';
import { RoFDisclaimerPage } from './disclaimer-page/rof-disclaimer-page.component';
import { RofCallPage } from '@app/components/report-of-fire/rof-callback-page/rof-call-page.component';
import { MatDialog } from '@angular/material/dialog';
import { DialogExitComponent } from '@app/components/report-of-fire/dialog-exit/dialog-exit.component';

enum PageOperation {
  Next = 1,
  Skip,
  previous,
}

/**
 * Report of Fire parent container. This will hold the reportOfFire data
 * (which may move to local storage with the offline support, so a temp thing for now)
 * As well as the create and store the pages for the "wizard"
 */
@Component({
  selector: 'report-of-fire',
  templateUrl: './report-of-fire.component.html',
  styleUrls: ['./report-of-fire.component.scss'],
  providers: [CommonUtilityService],
})
export class ReportOfFirePage implements OnInit, AfterContentInit {
  @ViewChild('dynamic', { static: true, read: ViewContainerRef })
  public dynamicContainer!: ViewContainerRef;
  
  public reportOfFire: ReportOfFire;
  public pageComponents: Array<ComponentRef<any>> = [];
  public currentPage: ComponentRef<any>;
  public allowExit = false;
  public allowSkip = false;
  public showProgress = false;
  public isEditMode = false;
  public progressSteps = [];
  public currentStep = 0;

  constructor(
    private locationService: Location,
    private router: Router,
    protected cdr: ChangeDetectorRef,
    private commonUtilityService: CommonUtilityService,
    protected dialog: MatDialog,
  ) {
    this.pageComponents = [];
  }

  ngOnInit() {
    // On RoF form startup, we want to load the config json and iterate through the
    // pages. At the current time, page order in the config is the order that will be
    // used by the component, but I'd like to update this so we can put an
    // index in the config rather than rely on order
    for (let index = 0; ConfigJson.pages.length > index; index++) {
      const page = ConfigJson.pages[index];
      let component;
      // Create a new instance of an RoF.
      // This may change to load from local store for offline support in the future
      this.reportOfFire = new ReportOfFire();

      switch (page.type) {
        case 'RoFTitlePage':
          component = this.dynamicContainer.createComponent(RoFTitlePage);
          break;
        case 'RofCallPage':
          component = this.dynamicContainer.createComponent(RofCallPage);
          break;
        case 'RoFDisclaimerPage':
          component = this.dynamicContainer.createComponent(RoFDisclaimerPage);
          break;
        case 'RoFPermissionsPage':
          component = this.dynamicContainer.createComponent(RoFPermissionsPage);
          break;
        case 'RoFSimpleQuestionPage':
          component = this.dynamicContainer.createComponent(
            RoFSimpleQuestionPage,
          );
          break;
        case 'RoFContactPage':
          component = this.dynamicContainer.createComponent(RoFContactPage);
          break;
        case 'RoFLocationPage':
          component = this.dynamicContainer.createComponent(RoFLocationPage);
          break;
        case 'RoFPhotoPage':
          component = this.dynamicContainer.createComponent(RoFPhotoPage);
          break;
        case 'RoFComplexQuestionPage':
          component = this.dynamicContainer.createComponent(
            RoFComplexQuestionPage,
          );
          break;
        case 'RoFCommentsPage':
          component = this.dynamicContainer.createComponent(RoFCommentsPage);
          break;
        case 'RoFReviewPage':
          component = this.dynamicContainer.createComponent(RoFReviewPage);
          break;
        case 'RoFCompassPage':
          component = this.dynamicContainer.createComponent(RoFCompassPage);
          break;
      }

      // ensure we actually have a created component before continuing
      if (component) {
        component.instance.initialize(page, index, this.reportOfFire);

        if (page.showProgress && !this.progressSteps.includes(page.title)) {
          this.progressSteps.push(page.title);
        }
        // button definitions for go back, next question, and skip question.
        component.instance.previous = () => {
          this.selectPage(
            component.instance.previousId,
            PageOperation.previous,
          );
        };
        component.instance.next = () => {
          this.selectPage(component.instance.nextId, PageOperation.Next);
        };
        // on skip, go to the "skip" id. If unset, go to "next" instead. some pages may use a different
        // page on skip vs. next.
        component.instance.skip = () => {
          this.selectPage(
            component.instance.skipId || component.instance.nextId,
            PageOperation.Skip,
          );
        };
        component.instance.close = () => {
          this.exit();
        };

        // Keep track of the component so we can easily page
        this.pageComponents.push(component);
        // and detach it for now, once it's created and initialized
        // we'll reattach later
        this.dynamicContainer.detach(0);
      } else {
        console.warn('Failed to load dynamic RoF page ' + page.type);
      }
    }
  }

  ngAfterContentInit() {
    // Once we're initialized and loaded, select the startup page or, if unset, the first page
    this.currentPage =
      this.pageComponents.find((c) => c.instance.isStartPage) ||
      this.pageComponents[0];
    this.selectPage(this.currentPage.instance.id, PageOperation.Next);
  }

  /**
   * Page selection for navigation of the RoF forms
   * @param index The page index. Zero-based
   */
  selectPage(pageId: string, operation: PageOperation, editMode?: boolean) {
    if (!pageId) {
      return;
    }

    // If the container is currently displaying a form, we want to
    // detach it before pushing another one in. Detach, do not destroy
    if (this.dynamicContainer.length > 0) {
      // But, before we detach it, grab the components RoF instance and update to the parent instance
      // just in case of missed changes
      this.updateReportOfFire(
        this.currentPage.instance.reportOfFire,
        this.currentPage.instance.updateAttribute,
      );
      this.dynamicContainer.detach(0);
    }

    // find out what the next page will be
    const nextPage = this.pageComponents.find((c) => c.instance.id === pageId);
    if (!nextPage) {
      console.error(
        'Failed to route to page ' + pageId + ' operation: ' + operation,
      );
      return;
    }

    // For progress bar handling. If the page tracks progress and isn't a sub-page (title match), then incrememnt
    // or decrement the progress bar depending on if we're going to next or previous
    if (
      operation !== PageOperation.previous &&
      nextPage.instance.showProgress &&
      nextPage.instance.title !== this.currentPage.instance.title
    ) {
      this.currentStep++;
    } else if (
      operation === PageOperation.previous &&
      this.currentPage.instance.showProgress &&
      nextPage.instance.title !== this.currentPage.instance.title
    ) {
      this.currentStep--;
    }

    // get the new page index, for progress bar tracking and whatnot
    this.currentPage = nextPage;
    // update the component to use the latest parent reportOfFire object, just to be sure
    // all updates are matching on all forms
    this.currentPage.instance.reportOfFire = this.reportOfFire;
    // and finally insert the component into the container
    this.dynamicContainer.insert(this.currentPage.hostView);

    // reload the map in location-page to pick up the distance && compass changes from previous step
    if (pageId === 'location-page') {
      const locationPageComponent = this.currentPage
        .instance as RoFLocationPage;
      if (locationPageComponent.mapConfig) {
        locationPageComponent.loadMapConfig();
      }
    }

    if (editMode) {
      this.isEditMode = true;

      switch (pageId) {
        case 'contact-page':
          const contactPageComponent = this.currentPage
            .instance as RoFContactPage;
          contactPageComponent.editMode();
        case 'location-page':
          const locationPageComponent = this.currentPage
            .instance as RoFLocationPage;
          locationPageComponent.editMode();
        case 'photo-page':
          const photoPageComponent = this.currentPage.instance as RoFPhotoPage;
          photoPageComponent.editMode();
        case 'smoke-color-page':
        case 'fire-size-page':
        case 'response-details-page':
        case 'what-is-burning-page':
        case 'infrastructure-details-page':
          const complexQuestionPageComponent = this.currentPage
            .instance as RoFComplexQuestionPage;
          complexQuestionPageComponent.editMode();

        case 'callback-page':
        case 'visible-flame-page':
        case 'fire-spread-page':
        case 'response-page':
        case 'infrastructure-page':
          const simpleQustionPageComponent = this.currentPage
            .instance as RoFSimpleQuestionPage;
          simpleQustionPageComponent.editMode();

        case 'comments-page':
          const commentPageComponent = this.currentPage
            .instance as RoFCommentsPage;
          commentPageComponent.editMode();
        case 'review-page':
          const reviewPageComponent = this.currentPage
            .instance as RoFReviewPage;
          if (reviewPageComponent.map) {
            reviewPageComponent.loadMap();
          }
        default:
          return null;
      }
    }

    // Check if the component allows for the exit, skip buttons, and will display the progress
    // bar at the bottom
    this.allowExit = this.currentPage.instance.allowExit;
    this.allowSkip = this.currentPage.instance.allowSkip;
    this.showProgress = this.currentPage.instance.showProgress;
    if (this.currentPage.instance.offLineMessage) {
      switch (pageId) {
        case 'first-page':
        case 'final-page':
          const rofTitlePageComponent = this.currentPage
            .instance as RoFTitlePage;
          this.commonUtilityService.checkOnline().then((result) => {
            if (!result) {
              this.currentPage.instance.nextId = 'disclaimer-page';
            }
          });
        case 'callback-page':
          const roFSimpleQuestionPageComponent = this.currentPage
            .instance as RoFSimpleQuestionPage;
          roFSimpleQuestionPageComponent.checkOnlineStatus();
        case 'contact-page':
          const roFContactPageComponent = this.currentPage
            .instance as RoFContactPage;
          roFContactPageComponent.checkOnlineStatus();
      }
    }

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
  updateReportOfFire(
    reportOfFire: ReportOfFire,
    attribute: string | Array<string>,
  ) {
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
  exit() {
    if (this.isEditMode && this.currentPage.instance.id !== 'review-page') {
      this.edit('review-page');
      this.isEditMode = false;
      this.cdr.detectChanges();
    } else if (this.currentPage.instance.id === 'final-page') {
      //this.router.navigateByUrl('/map')
      this.locationService.back();
    } else {
      let dialogRef;
      if (window.innerWidth >= 850) {
        dialogRef = this.dialog.open(DialogExitComponent, {
          autoFocus: false,
          width: '500px',
          data: {
            confirmButton: 'Exit',
            text: 'If you exit, your report will not be saved or submitted.',
          },
        });
      } else {
        dialogRef = this.dialog.open(DialogExitComponent, {
          autoFocus: false,
          width: '80vw',
          data: {
            confirmButton: 'Exit',
            text: 'If you exit, your report will not be saved or submitted.',
          },
        });
      }

      dialogRef.afterClosed().subscribe((result) => {
        if (result['exit']) {
          //this.router.navigateByUrl('/dashboard')
          this.locationService.back();
        }
      });
    }
  }

  /**
   * RoF Container skip handler. This will execute the currently
   * displayed components "skip"
   */
  skip() {
    if (this.currentPage.instance.id === 'distance-page') {
      this.commonUtilityService.checkOnline().then((result) => {
        if (!result) {
          this.selectPage('photo-page', null, false);
        }
      });
    }
    if (
      this.currentPage.instance.id === 'callback-page' ||
      this.currentPage.instance.id === 'contact-page'
    ) {
      this.reportOfFire.headingDetectionActive = true;

      if (this.commonUtilityService.checkIfLandscapeMode() || this.reportOfFire.motionSensor === 'no') {
        this.selectPage('distance-page', null, false);
      } else {
        this.currentPage.instance.skip();
      }
    } else if (
      this.currentPage.instance.nextId ||
      this.currentPage.instance.skipId
    ) {
      this.currentPage.instance.skip();
    }
  }

  edit(pageId) {
    this.selectPage(pageId, null, true);
    this.showProgress = false;
  }

  exitText() {
      return 'Exit';
  }
}
