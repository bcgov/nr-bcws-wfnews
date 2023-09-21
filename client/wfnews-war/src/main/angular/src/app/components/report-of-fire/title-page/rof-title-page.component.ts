import { Component, ChangeDetectionStrategy, ChangeDetectorRef } from "@angular/core";
import { RoFPage } from "../rofPage";
import { ReportOfFire } from "../reportOfFireModel";
import { MatDialog } from "@angular/material/dialog";
import { DialogLocationComponent } from "@app/components/report-of-fire/dialog-location/dialog-location.component";
import { CommonUtilityService } from "@app/services/common-utility.service";

@Component({
  selector: 'rof-title-page',
  templateUrl: './rof-title-page.component.html',
  styleUrls: ['./rof-title-page.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class RoFTitlePage extends RoFPage {
  public imageUrl: string
  public closeButton: boolean
  public messages: any;
  public offLineMessages: any;
  offLine: boolean = false;

  public constructor(
    protected dialog: MatDialog,
    private commonUtilityService: CommonUtilityService,
    private cdr: ChangeDetectorRef,
    ) {
    super()
  }

  initialize (data: any, index: number, reportOfFire: ReportOfFire) {
    super.initialize(data, index, reportOfFire);
    this.imageUrl = data.imageUrl;
    this.closeButton = data.closeButton;
    this.messages = this.message.split('\n');
    this.offLineMessages = this.offLineMessage.split('\n');
    this.offLine = !window.navigator.onLine;
  }

  openCallPage () {
    // not yet implemented
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
