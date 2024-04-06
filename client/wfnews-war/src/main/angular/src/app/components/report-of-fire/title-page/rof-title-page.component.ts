import {
  Component,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  OnInit,
  OnDestroy,
} from '@angular/core';
import { RoFPage } from '../rofPage';
import { ReportOfFire } from '../reportOfFireModel';
import { MatDialog } from '@angular/material/dialog';
import { DialogLocationComponent } from '@app/components/report-of-fire/dialog-location/dialog-location.component';
import { CommonUtilityService } from '@app/services/common-utility.service';
import { ReportOfFirePage } from '@app/components/report-of-fire/report-of-fire.component';
import { App } from '@capacitor/app';
import { BackgroundTask } from '@capawesome/capacitor-background-task';

@Component({
  selector: 'rof-title-page',
  templateUrl: './rof-title-page.component.html',
  styleUrls: ['./rof-title-page.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class RoFTitlePage extends RoFPage implements OnInit, OnDestroy {
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

  ngOnDestroy(): void {
    if (this.intervalRef) {
      clearInterval(this.intervalRef);
    }
  }

  async backgroundListener() {

    const self = this;
    if (this.intervalRef) {
      clearInterval(this.intervalRef);
      this.intervalRef = null;
    }

    this.intervalRef = setInterval(function () {
      // Invoke function every minute while app is in background
      self.checkStoredRoF();
    }, 30000);

  }

  openCallPage() {
    this.reportOfFirePage.selectPage('call-page', null, false);
  }

  async checkStoredRoF() {
    console.log('rof: checking')
    // first check do 24 hour check in storage and remove offline RoF if timeframe has elapsed
    await this.commonUtilityService.removeInvalidOfflineRoF();

    // check if the app is in the background and online and if so, check for saved offline RoF to be submitted
    await this.commonUtilityService.checkOnlineStatus().then(async (result) => {
      if (result) {
        await this.commonUtilityService.syncDataWithServer();
      };
    });
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