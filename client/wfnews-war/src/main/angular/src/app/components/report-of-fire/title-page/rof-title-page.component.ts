import { Component, ChangeDetectionStrategy, ChangeDetectorRef, OnInit } from "@angular/core";
import { RoFPage } from "../rofPage";
import { ReportOfFire } from "../reportOfFireModel";
import { MatDialog } from "@angular/material/dialog";
import { DialogLocationComponent } from "@app/components/report-of-fire/dialog-location/dialog-location.component";
import { CommonUtilityService } from "@app/services/common-utility.service";
import { ReportOfFirePage } from "@app/components/report-of-fire/report-of-fire.component";
import { App } from '@capacitor/app';
import { BackgroundTask } from '@capawesome/capacitor-background-task';

@Component({
  selector: 'rof-title-page',
  templateUrl: './rof-title-page.component.html',
  styleUrls: ['./rof-title-page.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class RoFTitlePage extends RoFPage implements OnInit {
  public imageUrl: string
  public closeButton: boolean
  public messages: any;
  public offLineMessages: any;
  offLine: boolean = false;

  public constructor(
    protected dialog: MatDialog,
    private commonUtilityService: CommonUtilityService,
    private cdr: ChangeDetectorRef,
    private reportOfFirePage: ReportOfFirePage
    ) {
    super()
  }

  ngOnInit(): void {
    // run background task
    const background = this.backgroundListener();
    // run when user comes back to app without sending app to background explicitlyng
    const listener = this.runBackground();
  }

  initialize (data: any, index: number, reportOfFire: ReportOfFire) {
    super.initialize(data, index, reportOfFire);
    this.imageUrl = data.imageUrl;
    this.closeButton = data.closeButton;
    this.messages = this.message.split('\n');
    this.offLineMessages = this.offLineMessage.split('\n');
    this.offLine = !window.navigator.onLine;    
  }

  async backgroundListener (){
    App.addListener('appStateChange', async () => {
      // The app state has been changed to inactive.
      // Start the background task by calling `beforeExit`.
      const taskId = await BackgroundTask.beforeExit(async () => {
        const self = this
        setInterval(function () {
          console.log('set interval')
          // Invoke function every minute while app is in background
          self.runBackground();
        }, 60000);
        BackgroundTask.finish({ taskId });
      });
    });
  }

  openCallPage () {
    this.reportOfFirePage.selectPage('call-page',null,false);
  }

  async runBackground() {
    // first check do 24 hour check in storage and remove offline RoF if timeframe has elapsed
    await this.commonUtilityService.removeInvalidOfflineRoF();

    // check if the app is in the background and online and if so, check for saved offline RoF to be submitted
    await (this.commonUtilityService.checkOnlineStatus().then(result => {
      if (result){
          this.commonUtilityService.syncDataWithServer()
      }
    }));
  }


 triggerLocationServiceCheck (){
  // re-check if user's device has gone offline since view was initialised and route to offline if so
    this.checkOnline().then((result) => {
      if(!result) this.nextId = 'disclaimer-page'
   })

    this.commonUtilityService.checkLocationServiceStatus().then((enabled) => {
      if (!enabled) {
        let dialogRef = this.dialog.open(DialogLocationComponent, {
          autoFocus: false,
          width: '80vw',
        });
      }else {
        this.next()
      }
    });
  }
  
  checkOnlineStatus() {
    this.commonUtilityService.pingSerivce().subscribe(
      () => {
        this.offLine = false;
        this.cdr.detectChanges()
      },
      () => {
        this.offLine = true;
        this.cdr.detectChanges()
      }
    );
  }

  async checkOnline() {
    try {
      await this.commonUtilityService.pingSerivce().toPromise();
      this.cdr.detectChanges();
      return true;
    } catch (error) {
      this.cdr.detectChanges();
      return false;
    }
  }

}
