import { ChangeDetectorRef, Component } from '@angular/core';
import { ActivatedRoute, ParamMap } from '@angular/router';
import { AGOLService, AgolOptions } from '@app/services/AGOL-service';
import { PublishedIncidentService, SimpleIncident } from '@app/services/published-incident-service';
import { WatchlistService } from '@app/services/watchlist-service';
import { convertToDateYear, getStageOfControlIcon, getStageOfControlLabel } from '@app/utils';

@Component({
  // eslint-disable-next-line @angular-eslint/component-selector
  selector: 'wfnews-public-event-page',
  templateUrl: './public-event-page.component.html',
  styleUrls: ['./public-event-page.component.scss']
})
export class PublicEventPageComponent {
  public isLoading = true;
  public loadingFailed = false;
  public eventType: string;
  public eventNumber: string;
  public eventName: string;
  public evac: string;
  public areaRestriction: string;
  public ban: string;
  public dangerRating: string;
  public incident: SimpleIncident;
  public isAssociatedWildfireBookmarked: boolean;

  constructor(
    private agolService: AGOLService,
    private router: ActivatedRoute,
    private watchlistService: WatchlistService,
    private publishedIncidentService: PublishedIncidentService,
    private cdr: ChangeDetectorRef,
  ) {
    this.router.queryParams.subscribe((params: ParamMap) => {
      this.eventType = params['eventType'];
      if (params && params['eventNumber'] && 
          (params['eventType'] === 'Order' || params['eventType'] === 'Alert')) {
        this.eventNumber = params['eventNumber'];
        this.populateEvacByID({
          returnGeometry: true,
          returnCentroid: true,
          returnExtent: false,
        });
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

      this.populateIncident(this.eventNumber);
      this.isAssociatedWildfireBookmarked = this.onWatchlist(this.incident);
    });
  }

  async populateEvacByID(options: AgolOptions = null) {
    this.agolService
      .getEvacOrdersByEventNumber(
        this.eventNumber,
        options
      )
      .toPromise()
      .then((response) => {
        if (response?.features?.length > 0 && response?.features[0].geometry?.rings?.length > 0) {
          this.evac = response.features[0];
          this.isLoading = false;
        }
      });
  }

  async populateAreaRestrictionByName(options: AgolOptions = null) {
    this.agolService
    .getAreaRestrictions(
      `NAME='${this.eventName}'`,
      null,
      {
        returnGeometry: true,
        returnCentroid: true,
        returnExtent: false,
      },
    )
      .toPromise()
      .then((response) => {
        if (response?.features?.length > 0 && response?.features[0].geometry?.rings?.length > 0) {
          this.areaRestriction = response.features[0];
          this.isLoading = false;
        }
      });
  }

  async populateBanById(options: AgolOptions = null) {
    this.agolService
    .getBansAndProhibitionsById(
      this.eventNumber, {
        returnGeometry: true,
        returnCentroid: true,
        returnExtent: false,
      })
      .toPromise()
      .then((response) => {
        if (response?.features?.length > 0 && response?.features[0].geometry?.rings?.length > 0) {
          this.ban = response.features[0];
          this.isLoading = false;
        }
      });
  }

  async populateDangerRatingById(options: AgolOptions = null) {
    this.agolService
    .getDangerRatings(
      `PROT_DR_SYSID ='${this.eventNumber}'`,
      null,
      {
        returnGeometry: true,
        returnCentroid: true,
      },
    )
      .toPromise()
      .then((response) => {
        if (response?.features?.length > 0 && response?.features[0].geometry?.rings?.length > 0) {
          this.dangerRating = response.features[0];
          this.isLoading = false;
        }
      });
  }

  async populateIncident(eventNumber: string) {
    const simpleIncident: SimpleIncident = new SimpleIncident();
    try {
        this.publishedIncidentService.fetchPublishedIncident(eventNumber).subscribe(response => {
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
            this.cdr.detectChanges();
          }
        });
    } catch (error) {
      console.error(
        'Caught error while populating associated incident for evacuation: ' +
          error,
      );
    }
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

  // navToIncident(incident: SimpleIncident) {
  //   this.router.navigate([ResourcesRoutes.PUBLIC_INCIDENT], {
  //     queryParams: {
  //       fireYear: incident.fireYear,
  //       incidentNumber: incident.incidentNumberLabel,
  //       source: [ResourcesRoutes.FULL_DETAILS],
  //       sourceId: this.id,
  //       sourceType: 'evac-order',
  //       name: this.name
  //     },
  //   });
  // }

  handleBookmarkClicked = ($event) => {
    this.addToWatchlist(this.incident);
    this.isAssociatedWildfireBookmarked = true;
  };

  handleViewDetailsClicked = () => {
    //this.navToIncident(this.incident);
  };
}
