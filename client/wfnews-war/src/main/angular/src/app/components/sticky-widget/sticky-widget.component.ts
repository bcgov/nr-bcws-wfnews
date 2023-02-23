import { ChangeDetectorRef, Component, OnDestroy } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { PublishedIncidentService } from '../../services/published-incident-service';
import { WatchlistService } from '../../services/watchlist-service';
import { ResourcesRoutes, isMobileView as mobileView } from '../../utils';
import { ContactWidgetDialogComponent } from './contact-widget-dialog/contact-widget-dialog.component';

@Component({
    selector: 'sticky-widget',
    templateUrl: 'sticky-widget.component.html',
    styleUrls: ['./sticky-widget.component.scss']
})
export class StickyWidgetComponent implements OnDestroy {
  public showWatchlist = false
  public watchlist: any[] = []
  private closeProgressInterval: any
  public progressValue = 0

  public isMobileView = mobileView

  constructor(protected dialog: MatDialog, protected cdr: ChangeDetectorRef, private router: Router, private watchlistService: WatchlistService, private publishedIncidentService: PublishedIncidentService) {}

  ngOnDestroy(): void {
    clearInterval(this.closeProgressInterval)
  }

  openContactForm() {
    this.dialog.open(ContactWidgetDialogComponent, {
      width: '950px',
    });
  }

  openIncident (incident: any) {
    const url = this.router.serializeUrl(
      this.router.createUrlTree([ResourcesRoutes.PUBLIC_INCIDENT], { queryParams: { fireYear: incident.fireYear, incidentNumber: incident.incidentNumberLabel } })
    )
    window.open(url, '_blank')
  }

  removeFromWatchlist (incident: any) {
    this.watchlistService.removeFromWatchlist(incident.fireYear, incident.incidentNumberLabel)
    this.showWatchlist = !this.showWatchlist
    this.loadWatchlist()
  }

  stopDelay () {
    if (this.closeProgressInterval) {
      clearInterval(this.closeProgressInterval)
      this.closeProgressInterval = null
      this.progressValue = 0
    }
  }

  delayClose () {
    this.closeProgressInterval = setInterval(() => {
      if (this.progressValue > 100) {
        this.loadWatchlist()
        this.stopDelay()
      } else {
        this.progressValue += 2
      }
    }, 100)
  }

  async loadWatchlist () {
    this.showWatchlist = !this.showWatchlist
    if (this.showWatchlist) {
      this.watchlist = []
      const watchlistItems = this.watchlistService.getWatchlist()
      for (const item of watchlistItems) {
        const fireYear = item.split(':')[0]
        const incidentNumber = item.split(':')[1]
        const incident = await this.publishedIncidentService.fetchPublishedIncident(incidentNumber, fireYear).toPromise()
        if (incident) {
          const options: Intl.DateTimeFormatOptions = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
          incident.lastUpdatedTimestamp = new Date(incident.lastUpdatedTimestamp).toLocaleTimeString("en-US", options);
          this.watchlist.push(incident)
        }
      }
    }
    this.cdr.detectChanges()
  }
}
