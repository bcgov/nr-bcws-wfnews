import {
  Component,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  OnInit,
} from '@angular/core';
import { RoFPage } from '../rofPage';
import { ReportOfFire } from '../reportOfFireModel';
import { MatDialog } from '@angular/material/dialog';
import { DialogLocationComponent } from '@app/components/report-of-fire/dialog-location/dialog-location.component';
import { CommonUtilityService } from '@app/services/common-utility.service';
import { ReportOfFirePage } from '@app/components/report-of-fire/report-of-fire.component';
import { App } from '@capacitor/app';
import { BackgroundTask } from '@capawesome/capacitor-background-task';
import { ReportOfFireService } from '@app/services/report-of-fire-service';

@Component({
  selector: 'rof-title-page',
  templateUrl: './rof-title-page.component.html',
  styleUrls: ['./rof-title-page.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class RoFTitlePage extends RoFPage implements OnInit {
  public imageUrl: string;
  public closeButton: boolean;
  public messages: any;
  public offLineMessages: any;
  offLine = false;
  private intervalRef;

  public constructor(
    protected dialog: MatDialog,
    private commonUtilityService: CommonUtilityService,
    private cdr: ChangeDetectorRef,
    private reportOfFirePage: ReportOfFirePage,
    private reportOfFireService: ReportOfFireService
  ) {
    super();
  }

  ngOnInit(): void {
    if (this.reportOfFirePage.currentPage.instance.id === 'first-page') {
      App.removeAllListeners();
      // run background task
      (async () => {
        await this.backgroundListener();
      })();
    }
  }

  initialize(data: any, index: number, reportOfFire: ReportOfFire) {
    super.initialize(data, index, reportOfFire);
    this.imageUrl = data.imageUrl;
    this.closeButton = data.closeButton;
    this.messages = this.message.split('\n');
    this.offLineMessages = this.offLineMessage.split('\n');
    this.offLine = !window.navigator.onLine;
  }

  async backgroundListener() {
    App.addListener('appStateChange', async ({ isActive }) => {
      if (isActive) {
        return;
      }
      // The app state has been changed to inactive.
      // Start the background task by calling `beforeExit`.
      const taskId = await BackgroundTask.beforeExit(async () => {

        if(!this.intervalRef) {
            this.intervalRef = setInterval(async () => {
            if(await this.checkStoredRoF())
              this.clearBackgroundInterval()
          }, 30000);
        }

        BackgroundTask.finish({ taskId });
      });
    });
  }

  clearBackgroundInterval() {
    clearInterval(this.intervalRef)
    this.intervalRef = null;
  }

  openCallPage() {
    this.reportOfFirePage.selectPage('call-page', null, false);
  }

  async checkStoredRoF() {
    let rofSubmitted = false;

    // first check do 24 hour check in storage and remove offline RoF if timeframe has elapsed
    await this.commonUtilityService.removeInvalidOfflineRoF();

    // check if the app is in the background and online and if so, check for saved offline RoF to be submitted
    await this.commonUtilityService.checkOnlineStatus().then(async (result) => {
      if (result) {
        await this.reportOfFireService.syncDataWithServer().then(response => {
          if(response) {
            rofSubmitted = true;
          }
        });      
      };
    });
    return rofSubmitted;
  }

  triggerLocationServiceCheck() {
    // re-check if user's device has gone offline since view was initialised and route to offline if so
    this.commonUtilityService.checkOnline().then((result) => {
      if (!result) {
        this.nextId = 'disclaimer-page';
      }
    });

    this.commonUtilityService.checkLocationServiceStatus().then((enabled) => {
      if (!enabled) {
        this.dialog.open(DialogLocationComponent, {
          autoFocus: false,
          width: '80vw',
        });
      } else {
        this.next();
      }
    });
  }

  checkOnlineStatus() {
    this.commonUtilityService.pingService().subscribe(
      () => {
        this.offLine = false;
        this.cdr.detectChanges();
      },
      () => {
        this.offLine = true;
        this.cdr.detectChanges();
      },
    );
  }
}