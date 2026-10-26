import { ChangeDetectorRef, Component } from '@angular/core';
import { ActivatedRoute, ParamMap, Router } from '@angular/router';
import { EventFeatureService } from '@app/services/event-feature.service';
import { PublishedIncidentService, SimpleIncident } from '@app/services/published-incident-service';
import { WatchlistService } from '@app/services/watchlist-service';
import { ResourcesRoutes, convertToDateYear, getStageOfControlIcon, getStageOfControlLabel, currentFireYear } from '@app/utils';

@Component({
  selector: 'wfnews-public-event-page',
  templateUrl: './public-event-page.component.html',
  styleUrls: ['./public-event-page.component.scss']
})
export class PublicEventPageComponent {
  public isLoading = true;
  public loadingFailed = false;
  public eventType: string;
  public eventNumber: string;
  public id : string;
  public eventName: string;
  public evac: string;
  public areaRestriction: any;
  public ban: string;
  public dangerRating: string;
  public incident: SimpleIncident;
  public incidents: SimpleIncident[];
  public bookmarkedIncidentNumbers: string[] = [];
  public isAssociatedWildfireBookmarked: boolean;

  constructor(
    private eventFeatureService: EventFeatureService,
    private activatedRoute: ActivatedRoute,
    private watchlistService: WatchlistService,
    private publishedIncidentService: PublishedIncidentService,
    private cdr: ChangeDetectorRef,
    private router: Router,
  ) {
    this.activatedRoute.queryParams.subscribe((params: ParamMap) => {
      this.eventType = params['eventType'];
      if (params && params['eventNumber'] && params['id'] &&
          (params['eventType'] === 'Order' || params['eventType'] === 'Alert')) {
        this.eventNumber = params['eventNumber'];
        this.id = params['id'];
        this.populateEvacByID();
        // Only an evacuation's event number is a fire number; a ban's or a rating's is a record id.
        this.populateIncident(this.eventNumber);
      } else if(params && params['eventName'] && params['eventType'] === 'area-restriction'){
        this.eventName = params['eventName'];
        this.populateAreaRestrictionByName();
      } else if(params && params['eventNumber'] && params['eventType'] === 'ban'){
        this.eventNumber = params['eventNumber'];
        this.populateBanById();
      } else if(params && params['eventNumber'] && params['eventType'] === 'danger-rating'){
        this.eventNumber = params['eventNumber'];
        this.populateDangerRatingById();
      }
    });
  }

  async populateEvacByID() {
    const evac = await this.eventFeatureService.getEvacuation({ id: this.id, eventNumber: this.eventNumber });
    if (evac?.geometry?.rings?.length) {
      this.evac = evac;
      this.isLoading = false;
    }
  }

  async populateAreaRestrictionByName() {
    const areaRestriction = await this.eventFeatureService.getAreaRestriction({ name: this.eventName });
    if (!areaRestriction?.geometry?.rings?.length) {
      return;
    }
    this.areaRestriction = areaRestriction;
    this.isLoading = false;
    try {
      this.incidents = await this.publishedIncidentService.populateIncidentsByPoint(
        areaRestriction.geometry.rings,
      );
      this.bookmarkedIncidentNumbers = this.incidents
        .filter(incident => this.onWatchlist(incident))
        .map(incident => incident.fireYear + ':' + incident.incidentNumberLabel);
      this.cdr.detectChanges();
    } catch (error) {
      console.error('Error while populating associated incident for area restriction: ' + error);
    }
  }

  async populateBanById() {
    const ban = await this.eventFeatureService.getBan(this.eventNumber);
    if (ban?.geometry?.rings?.length) {
      this.ban = ban;
      this.isLoading = false;
    }
  }

  async populateDangerRatingById() {
    const dangerRating = await this.eventFeatureService.getDangerRating(this.eventNumber);
    if (dangerRating?.geometry?.rings?.length) {
      this.dangerRating = dangerRating;
      this.isLoading = false;
    }
  }

  async populateIncident(eventNumber: string) {
    const simpleIncident: SimpleIncident = new SimpleIncident();
    if (!eventNumber) {
      return;
    }
    // A 404 is an evacuation with no published fire, not a fault.
    this.publishedIncidentService.fetchPublishedIncident(eventNumber,currentFireYear().toString()).subscribe({
        next: response => {
          if (response) {
            simpleIncident.discoveryDate = convertToDateYear(response.discoveryDate);
            simpleIncident.incidentName = response.incidentName?.replace('Fire', '').trim() + ' Wildfire';
            simpleIncident.fireCentreName = response.fireCentreName;
            simpleIncident.fireYear = response.fireYear;
            simpleIncident.incidentNumberLabel = response.incidentNumberLabel;
            simpleIncident.fireOfNoteInd = response.fireOfNoteInd;
            simpleIncident.stageOfControlCode = response.stageOfControlCode;
            simpleIncident.stageOfControlIcon = getStageOfControlIcon(
              response?.stageOfControlCode,
            );
            simpleIncident.stageOfControlLabel = getStageOfControlLabel(
              response?.stageOfControlCode,
            );
            this.incident = simpleIncident;
            this.isAssociatedWildfireBookmarked = this.onWatchlist(this.incident);
            this.cdr.detectChanges();
          }
        },
        error: error => {
          console.warn('No associated incident for evacuation ' + eventNumber + ': ' + (error?.status ?? error));
        },
      });
  }

  onWatchlist(incident): boolean {
    return this.watchlistService
      .getWatchlist()
      .includes(incident.fireYear + ':' + incident.incidentNumberLabel);
  }

  addToWatchlist(incident) {
    if (!this.onWatchlist(incident)) {
      this.watchlistService.saveToWatchlist(
        incident.fireYear,
        incident.incidentNumberLabel,
      );
    }
  }

  removeFromWatchlist(incident) {
    if (this.onWatchlist(incident)) {
      this.watchlistService.removeFromWatchlist(
        incident.fireYear,
        incident.incidentNumberLabel,
      );
    }
  }

  navToIncident(incident: SimpleIncident) {
    this.router.navigate([ResourcesRoutes.PUBLIC_INCIDENT], {
      queryParams: {
        fireYear: incident.fireYear,
        incidentNumber: incident.incidentNumberLabel,
        source: ResourcesRoutes.FULL_DETAILS,
        sourceId: incident.incidentNumber,
        sourceType: this.eventType ,
        eventNumber: this.eventNumber,
        name: incident.incidentName,
        sourceName: this.eventType === 'area-restriction' ? this.eventName : undefined,
        sourceEventId: (this.eventType === 'Order' || this.eventType === 'Alert') ? this.id : undefined,
      },
    });
  }

  handleBookmarkClicked = ($event) => {
    this.isAssociatedWildfireBookmarked = $event;
    if ($event) {
      this.addToWatchlist(this.incident);
    } else {
      this.removeFromWatchlist(this.incident);
    }
  };

  handleViewDetailsClicked = () => {
    this.navToIncident(this.incident);
  };

  handleAreaRestrictionBookmarkClicked = ({ incident, isBookmarked }: { incident: SimpleIncident; isBookmarked: boolean }) => {
    const key = incident.fireYear + ':' + incident.incidentNumberLabel;
    if (isBookmarked) {
      this.addToWatchlist(incident);
      this.bookmarkedIncidentNumbers = [...this.bookmarkedIncidentNumbers, key];
    } else {
      this.removeFromWatchlist(incident);
      this.bookmarkedIncidentNumbers = this.bookmarkedIncidentNumbers.filter(num => num !== key);
    }
  };

  handleAreaRestrictionViewDetailsClicked = (incident: SimpleIncident) => {
    this.navToIncident(incident);
  };
}
