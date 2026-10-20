import { ChangeDetectorRef, Component, Input, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { LocationData } from '@app/components/wildfires-list-header/filter-by-location/filter-by-location-dialog.component';
import { AGOLService, AgolOptions } from '@app/services/AGOL-service';
import { CommonUtilityService } from '@app/services/common-utility.service';
import {
  PublishedIncidentService,
  SimpleIncident,
} from '@app/services/published-incident-service';
import { WatchlistService } from '@app/services/watchlist-service';
import { ResourcesRoutes, convertToDateTime, convertToDateYear, currentFireYear, getStageOfControlIcon, getStageOfControlLabel, openLink } from '@app/utils';
import { FullDetailsMapService } from '@app/services/full-details-map.service';
import { MapConfigService } from '@app/services/map-config.service';
import { boundsToExtent, drawNearbyIncidents } from '@app/utils/preview-map';
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
  @Input() id: string;
  @Input() name: string;
  @Input() eventNumber: string;

  public evacData: EvacData;
  public incident: SimpleIncident | null;
  public map: any;

  convertToDateTime = convertToDateTime;
  convertToDateYear = convertToDateYear;
  openLink = openLink;
  getStageOfControlIcon = getStageOfControlIcon;
  getStageOfControlLabel = getStageOfControlLabel;

  constructor(
    private agolService: AGOLService,
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
    await this.populateEvacByID({
      returnGeometry: true,
      returnCentroid: true,
      returnExtent: false,
    });
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
    let bounds = null;
    this.agolService
      .getEvacOrdersById(
        this.id,
        {
          returnGeometry: true,
        },
      )
      .toPromise()
      .then((response) => {
        if (response?.features?.length > 0 && response?.features[0].geometry?.rings?.length > 0) {
          const matchingFeature = response.features.find(feature => feature.attributes.EVENT_NUMBER === this.eventNumber);
          const polygonData = this.commonUtilityService.extractPolygonData(matchingFeature.geometry.rings);
          if (polygonData?.length) {
            bounds = this.commonUtilityService.getPolygonBond(polygonData);
            this.createMap(location, bounds);
          }
        }
        else {
          this.createMap(location)
        }
      });
  }

  async createMap(location: number[], bounds?: any) {
    const external = this.appConfigService.getConfig()['externalAppConfig'];

    const cfg = await this.mapConfigService.getPreviewMapConfig({
      baseMap: 'navigation',
      extent: boundsToExtent(bounds),
      layers: [
        {
          type: 'esri-feature',
          id: 'agol-perimeters',
          title: 'Fire perimeters',
          serviceUrl: external['AGOLperimetres'].toString(),
          isVisible: true,
          style: { strokeColor: '#e60000', strokeWidth: 2, fillOpacity: 0 },
        },
        {
          type: 'esri-feature',
          id: 'agol-evac-orders',
          title: 'Evacuation Orders and Alerts',
          serviceUrl: external['AGOLevacOrders'].toString(),
          isVisible: true,
          // An Order is red and an Alert is orange, as the leaflet style did.
          style: {
            strokeWidth: 2.25,
            fillOpacity: 0.5,
            where: {
              field: 'ORDER_ALERT_STATUS',
              Order: { fillColor: '#ff3a35', strokeColor: '#ff3a35' },
              Alert: { fillColor: '#fa9600', strokeColor: '#fa9600' },
            },
          },
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

  async populateEvacByID(options: AgolOptions = null) {
    this.evacData = null;
    const response = this.id ?
      await this.agolService.getEvacOrdersByParam(`EMRG_OAA_SYSID='${this.id}'`, options).toPromise():
      await this.agolService.getEvacOrdersByParam(`EVENT_NAME='${this.name}'`, options).toPromise() ;
    if (response?.features?.length > 0) {
      const matchingFeature = response.features.find(feature => feature.attributes.EVENT_NUMBER === this.eventNumber);
      const evac = matchingFeature;
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
        }
      })
    } catch (error) {
      console.error(
        'Caught error while populating associated incident for evacuation: ' +
        error,
      );
    }
  }

  navToMap() {
    setTimeout(() => {
      this.router.navigate([ResourcesRoutes.ACTIVEWILDFIREMAP], {
        queryParams: {
          longitude: this.evacData.centroidLongitude,
          latitude: this.evacData.centroidLatitude,
          evacuationAlert: true,
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

  addToWatchlist(incident) {
    if (!this.onWatchlist(incident)) {
      this.watchlistService.saveToWatchlist(
        incident.fireYear,
        incident.incidentNumberLabel,
      );
    }
  }

  shareMobile(status: string) {
    this.commonUtilityService.shareMobile(`Evacuation ${status} for ${this.evacData.name}`);
  }
}
