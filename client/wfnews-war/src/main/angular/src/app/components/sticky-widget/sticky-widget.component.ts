import { ChangeDetectorRef, Component } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { PublishedIncidentService } from '../../services/published-incident-service';
import { WatchlistService } from '../../services/watchlist-service';
import { ContactWidgetDialogComponent } from './contact-widget-dialog/contact-widget-dialog.component';

@Component({
    selector: 'sticky-widget',
    templateUrl: 'sticky-widget.component.html',
    styleUrls: ['./sticky-widget.component.scss']
})
export class StickyWidgetComponent {
  public showWatchlist = false
  public watchlist: any[] = []

  constructor(protected dialog: MatDialog, protected cdr: ChangeDetectorRef, private watchlistService: WatchlistService, private publishedIncidentService: PublishedIncidentService){}

  openContactForm() {
    this.dialog.open(ContactWidgetDialogComponent, {
      width: '950px',
    });
  }

  async loadWatchlist () {
    this.showWatchlist = !this.showWatchlist
    if (this.showWatchlist) {
      this.watchlist = []
      const watchlistItems = this.watchlistService.getWatchlist()
      for (const item of watchlistItems) {
        const incident = await this.publishedIncidentService.fetchPublishedIncident(item).toPromise()
        if (incident) {
          this.watchlist.push(incident)
        }
      }
    }
    this.cdr.detectChanges()
  }
}
