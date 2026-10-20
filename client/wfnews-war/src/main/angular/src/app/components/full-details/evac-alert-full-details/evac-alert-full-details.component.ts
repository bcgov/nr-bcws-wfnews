import {
  EVACUATION_DRAWING_INFO,
  FIRE_PERIMETER_DRAWING_INFO,
} from '@app/services/map-config.service/layers/evacuation-orders-and-alerts-wms.config';
import { ChangeDetectorRef, Component, Input, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { LocationData } from '@app/components/wildfires-list-header/filter-by-location/filter-by-location-dialog.component';
import { EventFeatureService } from '@app/services/event-feature.service';
import { CommonUtilityService } from '@app/services/common-utility.service';
import {
  PublishedIncidentService,
  SimpleIncident,
} from '@app/services/published-incident-service';
import { WatchlistService } from '@app/services/watchlist-service';
import { ResourcesRoutes, convertToDateTime, convertToDateYear, currentFireYear, getStageOfControlIcon, getStageOfControlLabel } from '@app/utils';
import { FullDetailsMapService } from '@app/services/full-details-map.service';
import { MapConfigService } from '@app/services/map-config.service';
import { boundsToExtent, drawNearbyIncidents, extentToParam } from '@app/utils/preview-map';
import { filter, take } from 'rxjs/operators';
import { AppConfigService } from '@wf1/core-ui';
import { setDisplayColor } from '../../../utils';
import { Meta } from '@angular/platform-browser';

export class EvacData {
  public name: string;
  public eventNumber: string;
  public issuedDate: string;
  public bulletinUrl: string;
  public issuingAgency: string;
  public centroidLongitude: string;
  public centroidLatitude: string;
}

@Component({
  selector: 'wfnews-evac-alert-full-details',
  templateUrl: './evac-alert-full-details.component.html',
  styleUrls: ['./evac-alert-full-details.component.scss'],
})
export class EvacAlertFullDetailsComponent implements OnInit {
  // Closed for this visit only; the next full details page shows it again.
  bulletinDismissed = false;
  private evacFeature: any = null;
  @Input() id: string;
  @Input() name: string;
  @Input() eventNumber: string;

  public evacData: EvacData;
  public incident: SimpleIncident | null;
  public map: any;
  // The polygon box, so View on Map can fit the area instead of a fixed zoom.
  public extent: number[] | undefined;

  convertToDateTime = convertToDateTime;
  convertToDateYear = convertToDateYear;
  getStageOfControlIcon = getStageOfControlIcon;
  getStageOfControlLabel = getStageOfControlLabel;

  constructor(
    private eventFeatureService: EventFeatureService,
    private publishedIncidentService: PublishedIncidentService,
    private appConfigService: AppConfigService,
    private cdr: ChangeDetectorRef,
    protected router: Router,
    private watchlistService: WatchlistService,
    private commonUtilityService: CommonUtilityService,
    private metaService: Meta,
    private mapConfigService: MapConfigService,
    private fullDetailsMap: FullDetailsMapService
  ) { }

  async ngOnInit(): Promise<void> {
    await this.populateEvacByID();
    this.initMap();
    this.metaService.updateTag({ property: 'og:title', content: `Evacuation Alert for ${this.evacData.name}`});
    this.metaService.updateTag({ property: 'og:description', content: `Evacuation Alert for ${this.evacData.name}` });

  }

  async initMap() {
    // Create map and append data to the map component
    const location = [
      Number(this.evacData?.centroidLatitude),
      Number(this.evacData?.centroidLongitude),
    ];
    const rings = this.evacFeature?.geometry?.rings;
    const polygonData = rings?.length ? this.commonUtilityService.extractPolygonData(rings) : [];
    if (polygonData.length) {
      this.createMap(location, this.commonUtilityService.getPolygonBond(polygonData));
    } else {
      this.createMap(location);
    }
  }

  async createMap(location: number[], bounds?: any) {
    const external = this.appConfigService.getConfig()['externalAppConfig'];

    this.extent = boundsToExtent(bounds);
    const cfg = await this.mapConfigService.getPreviewMapConfig({
      baseMap: 'navigation',
      extent: this.extent,
      layers: [
        {
          type: 'esri-feature',
          id: 'agol-perimeters',
          title: 'Fire perimeters',
          serviceUrl: external['AGOLperimetres'].toString(),
          isVisible: true,
          drawingInfo: FIRE_PERIMETER_DRAWING_INFO,
        },
        {
          type: 'esri-feature',
          id: 'agol-evac-orders',
          title: 'Evacuation Orders and Alerts',
          serviceUrl: external['AGOLevacOrders'].toString(),
          isVisible: true,
          // esri-feature takes drawingInfo; it has no style option.
          drawingInfo: EVACUATION_DRAWING_INFO,
        },
      ],
    });
    this.fullDetailsMap.setConfig(cfg);

    const smk = await this.fullDetailsMap.smk$
      .pipe(filter((v) => !!v), take(1))
      .toPromise();
    this.map = smk.$viewer.map;

    try {
      const locationData = new LocationData();
      locationData.latitude = Number(this.evacData.centroidLatitude);
      locationData.longitude = Number(this.evacData.centroidLongitude);
      locationData.radius = 100;
      const incidents = await this.publishedIncidentService
        .fetchPublishedIncidentsList(0, 9999, locationData, null, null, [
          'OUT_CNTRL',
          'HOLDING',
          'UNDR_CNTRL',
        ])
        .toPromise();
      drawNearbyIncidents(smk, incidents?.collection);
    } catch (err) {
      console.error(
        'Could not retrieve surrounding incidents for evacuation alert',
      );
    }

    this.cdr.detectChanges();
  }

  async populateEvacByID() {
    this.evacData = null;
    const evac = await this.eventFeatureService.getEvacuation({ id: this.id, name: this.name, eventNumber: this.eventNumber });
    // The map reads the same feature, so it does not download it again.
    this.evacFeature = evac;
    if (evac) {
      this.evacData = new EvacData();
      this.evacData.name = evac.attributes.EVENT_NAME;
      this.evacData.eventNumber = evac.attributes.EVENT_NUMBER;
      this.evacData.issuingAgency = evac.attributes.ISSUING_AGENCY;
      this.evacData.issuedDate = evac.attributes.DATE_MODIFIED;
      this.evacData.bulletinUrl = evac.attributes.BULLETIN_URL;
      this.evacData.centroidLatitude = evac.centroid.y;
      this.evacData.centroidLongitude = evac.centroid.x;
      this.id = evac.attributes.EMRG_OAA_SYSID;

      await this.populateIncident(this.evacData.eventNumber);
    } else {
      console.error('Could not populate evacuation order by ID: ' + this.id);
    }
  }

  async populateIncident(eventNumber: string) {
    let simpleIncident: SimpleIncident = new SimpleIncident;
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
        }
      },
      error: error => {
        console.warn('No associated incident for evacuation ' + eventNumber + ': ' + (error?.status ?? error));
      },
    });
  }

  navToMap() {
    setTimeout(() => {
      this.router.navigate([ResourcesRoutes.ACTIVEWILDFIREMAP], {
        queryParams: {
          longitude: this.evacData.centroidLongitude,
          latitude: this.evacData.centroidLatitude,
          evacuationAlert: true,
          extent: extentToParam(this.extent),
        },
      });
    }, 200);
  }

  navToIncident(incident: SimpleIncident) {
    this.router.navigate([ResourcesRoutes.PUBLIC_INCIDENT], {
      queryParams: {
        fireYear: incident.fireYear,
        incidentNumber: incident.incidentNumberLabel,
        source: [ResourcesRoutes.FULL_DETAILS],
        sourceId: this.id,
        sourceType: 'evac-alert',
        name: this.name
      },
    });
  }

  navToBulletinUrl() {
    if (this.evacData?.bulletinUrl) {
      window.open(this.evacData.bulletinUrl, '_blank');
    } else {
      window.open('https://www.emergencyinfobc.gov.bc.ca', '_blank');
    }
  }

  onWatchlist(incident): boolean {
    return this.watchlistService
      .getWatchlist()
      .includes(incident.fireYear + ':' + incident.incidentNumberLabel);
  }

  setWatchlist(incident, bookmarked: boolean) {
    if (bookmarked) {
      this.watchlistService.saveToWatchlist(incident.fireYear, incident.incidentNumberLabel);
    } else {
      this.watchlistService.removeFromWatchlist(incident.fireYear, incident.incidentNumberLabel);
    }
  }

  shareMobile(status: string) {
    this.commonUtilityService.shareMobile(`Evacuation ${status} for ${this.evacData.name}`);
  }
}
