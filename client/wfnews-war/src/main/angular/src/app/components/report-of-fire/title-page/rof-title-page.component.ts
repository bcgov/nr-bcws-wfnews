import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
} from '@angular/core';
import { ReportOfFirePage } from '@app/components/report-of-fire/report-of-fire.component';
import { ReportOfFire } from '../reportOfFireModel';
import { RoFPage } from '../rofPage';
import { ConnectivityService } from '@app/services/connectivity.service';

@Component({
  selector: 'rof-title-page',
  templateUrl: './rof-title-page.component.html',
  styleUrls: ['./rof-title-page.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class RoFTitlePage extends RoFPage {
  public imageUrl: string;
  public closeButton: boolean;
  public messages: any;
  public offLineMessages: any;
  offLine = false;

  public constructor(
    private connectivityService: ConnectivityService,
    private cdr: ChangeDetectorRef,
    private reportOfFirePage: ReportOfFirePage,
  ) {
    super();
  }

  initialize(data: any, index: number, reportOfFire: ReportOfFire) {
    super.initialize(data, index, reportOfFire);
    this.imageUrl = data.imageUrl;
    this.closeButton = data.closeButton;
    this.messages = this.message.split('\n');
    this.offLineMessages = this.offLineMessage.split('\n');
    this.offLine = !window.navigator.onLine;
  }

  openCallPage() {
    this.reportOfFirePage.selectPage('call-page', null, false);
  }

  async startReport() {
    // Await it. next() reads nextId, so a promise that has not settled sends an
    // offline user to the permissions page.
    const online = await this.connectivityService.checkOnlineStatus();
    if (!online) {
      this.nextId = 'disclaimer-page';
    }

    // No permission call here. A dialog with no words on the screen is jarring, so
    // the permissions page carries the banner and the tap asks.
    this.next();
  }

  checkOnlineStatus() {
    this.connectivityService.pingService().subscribe(
      () => {
        this.offLine = false;
        this.cdr.detectChanges();
      },
      () => {
        this.offLine = true;
        this.nextId = 'disclaimer-page';
        this.cdr.detectChanges();
      },
    );
  }
}