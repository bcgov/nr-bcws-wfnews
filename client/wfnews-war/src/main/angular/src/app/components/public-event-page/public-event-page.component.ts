import { ChangeDetectorRef, Component } from '@angular/core';
import { ActivatedRoute, ParamMap, Router } from '@angular/router';
import { AGOLService, AgolOptions } from '@app/services/AGOL-service';
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
  public isAssociatedWildfireBookmarked: boolean;

  constructor(
    private agolService: AGOLService,
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
    });
  }

  async populateEvacByID(options: AgolOptions = null) {
    this.agolService
      .getEvacOrdersById(
        this.id,
        options
      )
      .toPromise()
      .then((response) => {
        if (response?.features?.length > 0 && response?.features[0].geometry?.rings?.length > 0) {
          // testing purpose: EMRG_OAA_SYSID (id) is supposed to be unique ID. 
          // However in AGOL TEST, all the evacucation orders and alerts' id are 0, so we need to use the event number to filter them out
          const matchingFeature = response.features.find(feature => feature.attributes.EVENT_NUMBER === this.eventNumber);
          this.evac = matchingFeature;
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
      .then(async (response) => {
        if (response?.features?.length > 0 && response?.features[0].geometry?.rings?.length > 0) {
          this.areaRestriction = response.features[0];
          this.isLoading = false;
            if (this.areaRestriction) {
              const restrictionPolygon = this.areaRestriction.geometry.rings;
              try {
                this.incident =
                  await this.publishedIncidentService.populateIncidentByPoint(
                    restrictionPolygon,
                  );
                  this.isAssociatedWildfireBookmarked = this.onWatchlist(this.incident);
                  this.cdr.detectChanges();
              } catch (error) {
                console.error(
                  'Error while populating associated incident for area restriction: ' +
                    error,
                );
              }
            
            }
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
    if (!eventNumber) {
      return;
    }
    try {
        this.publishedIncidentService.fetchPublishedIncident(eventNumber,currentFireYear().toString()).subscribe(response => {
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
        sourceId: this.incident.incidentNumber,
        sourceType: this.eventType ,
        eventNumber: this.eventNumber,
        name: this.incident.incidentName,
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
}
