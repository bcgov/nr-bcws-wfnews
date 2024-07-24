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
import { ResourcesRoutes, convertToDateTime, convertToDateYear, getStageOfControlIcon, getStageOfControlLabel, openLink } from '@app/utils';
import { AppConfigService } from '@wf1/core-ui';
import * as esri from 'esri-leaflet';
import L from 'leaflet';
import { setDisplayColor } from '../../../utils';

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

  ) {}

  async ngOnInit(): Promise<void> {
    await this.populateEvacByID({
      returnGeometry: true,
      returnCentroid: true,
      returnExtent: false,
    });
    this.initMap();
  }

  async initMap() {
    // Create map and append data to the map component
    const location = [
      Number(this.evacData?.centroidLatitude),
      Number(this.evacData?.centroidLongitude),
    ];
    let bounds = null;
    this.agolService
    .getEvacOrdersByEventNumber(
      this.eventNumber,
      {
        returnGeometry: true,
      },
    )
    .toPromise()
    .then((response) => {
        if (response?.features?.length > 0 && response?.features[0].geometry?.rings?.length > 0){
          const polygonData = this.commonUtilityService.extractPolygonData(response.features[0].geometry.rings);
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
    const mapOptions = this.commonUtilityService.getMapOptions(bounds, location);
  
    // Create the map using the mapOptions
    this.map = L.map('restrictions-map', mapOptions);
  
  // If bounds exist, fit the map to the bounds; otherwise, set the view to the default location and zoom level
  if (bounds) {
    this.map.fitBounds(bounds);
  }
    L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution:
        '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    }).addTo(this.map);

      esri.featureLayer({
        url: this.appConfigService.getConfig()['externalAppConfig']['AGOLperimetres'].toString(),
        ignoreRenderer: true,
        precision: 3,
        style: (feature) => {
            return {
              fillColor: '#e60000',
              color: '#e60000',
              weight: 2,
              fillOpacity: 1
            };
        }
      })
      .addTo(this.map);

    esri.featureLayer({
        url: this.appConfigService.getConfig()['externalAppConfig']['AGOLevacOrders'].toString(),
        ignoreRenderer: true,
        precision: 10,
        style: (feature) => {
          if (feature.properties.ORDER_ALERT_STATUS === 'Order') {
            return {
              fillColor: '#ff3a35',
              color: '#ff3a35',
              weight: 2.25,
              fillOpacity: 0.15
            };
          } else if (feature.properties.ORDER_ALERT_STATUS === 'Alert') {
            return {
              fillColor: '#fa9600',
              color: '#fa9600',
              weight: 2.25,
              fillOpacity: 0.15
            };
          }
        }
      })
      .addTo(this.map);

    const fireOfNoteIcon = L.icon({
      iconUrl: '/assets/images/local_fire_department.png',
      iconSize: [35, 35],
      shadowAnchor: [4, 62],
      popupAnchor: [1, -34],
      shadowSize: [41, 41],
    });

    // now fetch the rest of the incidents in the area and display on map
    try {
      const locationData = new LocationData();
      locationData.latitude = Number(this.evacData.centroidLatitude);
      locationData.longitude = Number(this.evacData.centroidLongitude);
      locationData.radius = 100;
      const stageOfControlCodes = ['OUT_CNTRL', 'HOLDING', 'UNDR_CNTRL'];
      const incidents = await this.publishedIncidentService
        .fetchPublishedIncidentsList(
          0,
          9999,
          locationData,
          null,
          null,
          stageOfControlCodes,
        )
        .toPromise();
      if (incidents?.collection && incidents?.collection?.length > 0) {
        for (const item of incidents.collection) {
          const incidentLocation = [Number(item.latitude), Number(item.longitude)];
          if (item.fireOfNoteInd) {
            L.marker(incidentLocation, { icon: fireOfNoteIcon }).addTo(this.map);
          } else {
            const colorToDisplay = setDisplayColor(item.stageOfControlCode);
            L.circleMarker(incidentLocation, {
              radius: 5,
              fillOpacity: 1,
              color: 'black',
              fillColor: colorToDisplay,
            }).addTo(this.map);
          }
        }
      }
    } catch (err) {
      console.error(
        'Could not retrieve surrounding incidents for evacuation alert',
      );
    }
    this.cdr.detectChanges();
  }

  async populateEvacByID(options: AgolOptions = null) {
    this.evacData = null;
    const response = this.name ?
    await this.agolService.getEvacOrdersByParam(`EVENT_NAME='${this.name}'`, options).toPromise() :
    await this.agolService.getEvacOrdersByParam(`EMRG_OAA_SYSID='${this.id}'`, options).toPromise();
    if (response?.features[0]?.attributes) {
      const evac = response.features[0];

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
}
