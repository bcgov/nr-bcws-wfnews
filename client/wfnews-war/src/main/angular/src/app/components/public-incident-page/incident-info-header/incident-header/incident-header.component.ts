import { Component, EventEmitter, Input, Output, ViewEncapsulation } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { ShareService } from '@app/services/share.service';
import { WatchlistService } from '@app/services/watchlist-service';
import {
  convertFireNumber,
  convertToFireCentreDescription,
  getStageOfControlLabel,
  isMobileView,
} from '@app/utils';
import { ContactUsDialogComponent } from '@app/components/admin-incident-form/contact-us-dialog/contact-us-dialog.component';
import { toCanvas } from 'qrcode';

@Component({
  selector: 'wfnews-incident-header',
  templateUrl: './incident-header.component.html',
  styleUrls: ['./incident-header.component.scss'],
  encapsulation: ViewEncapsulation.None,
})
export class IncidentHeaderComponent {
  @Input() public incident: any;
  @Input() public incidentEvacOrders = [];
  @Input() public incidentEvacAlerts = [];
  @Output() requestPrint = new EventEmitter<void>();

  convertToFireCentreDescription = convertToFireCentreDescription;
  convertFireNumber = convertFireNumber;
  getStageOfControlLabel = getStageOfControlLabel;
  isMobileView = isMobileView;

  constructor(
    private watchlistService: WatchlistService,
    private dialog: MatDialog,
    private shareService: ShareService,
  ) {}

  onWatchlist(): boolean {
    if (!this.incident?.fireYear || !this.incident?.incidentNumberLabel) {
      return false;
    }
    return this.watchlistService
      .getWatchlist()
      .includes(
        this.incident.fireYear + ':' + this.incident.incidentNumberLabel,
      );
  }

  addToWatchlist() {
    if (this.onWatchlist()) {
      this.removeFromWatchlist();
    } else {
      this.watchlistService.saveToWatchlist(
        this.incident.fireYear,
        this.incident.incidentNumberLabel,
      );
    }
  }

  removeFromWatchlist() {
    this.watchlistService.removeFromWatchlist(
      this.incident.fireYear,
      this.incident.incidentNumberLabel,
    );
  }

  openContactUsWindow(mode?: string) {
    this.dialog.open(ContactUsDialogComponent, {
      panelClass: 'contact-us-dialog',
      width: mode === 'desktop' ? '500px' : undefined,
      data: {
        incident: this.incident,
      },
    });
  }

  openShareWindow() {
    this.shareService.openShareWindow('Wildfire', this.incident?.incidentName);
  }

  shareMobile() {
    this.shareService.shareMobile(this.incident.incidentName);
  }

  public printPage() {
    const twoColumnContent = document.getElementsByClassName('two-column-content-cards-container')[0];
    twoColumnContent?.classList.add('print');

    const printContents =
      document.getElementsByClassName('page-container')[0]?.innerHTML;

    const appRoot = document.getElementById('app-root') ? document.body.removeChild(
      document.getElementById('app-root'),
    ) : null;

    if (printContents) {
      document.body.innerHTML = printContents;
    }

    const canvas = document.getElementById('qr-code');
    toCanvas(canvas, window.location.href, (error) => {
      if (error) {
        console.error(error);
      }
      window.print();
      document.body.innerHTML = '';
      if (appRoot) {
        document.body.appendChild(appRoot);
      }
      twoColumnContent?.classList.remove('print');
    });
    this.requestPrint.emit();
  }
}

