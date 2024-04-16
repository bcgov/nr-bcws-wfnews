import { ChangeDetectorRef, Component, Input, OnInit } from '@angular/core';
import { AGOLService, AgolOptions } from '@app/services/AGOL-service';
import {
  PublishedIncidentService,
  SimpleIncident,
} from '@app/services/published-incident-service';
import { ResourcesRoutes, convertToDateTime, getActiveMap, openLink } from '@app/utils';
import L from 'leaflet';
import { setDisplayColor } from '../../../utils';
import { LocationData } from '@app/components/wildfires-list-header/filter-by-location/filter-by-location-dialog.component';
import { AppConfigService } from '@wf1/core-ui';
import { Router } from '@angular/router';
import { WatchlistService } from '@app/services/watchlist-service';
import { CommonUtilityService } from '@app/services/common-utility.service';

export class EvacData {
  public name: string;
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
  openLink = openLink;

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

    const databcUrl = this.appConfigService
      .getConfig()
      ['mapServices']['openmapsBaseUrl'].toString();
    L.tileLayer
      .wms(databcUrl, {
        layers: 'WHSE_HUMAN_CULTURAL_ECONOMIC.EMRG_ORDER_AND_ALERT_AREAS_SP',
        styles: '6885',
        format: 'image/png',
        transparent: true,
        version: '1.1.1',
      })
      .addTo(this.map);
    L.tileLayer
      .wms(databcUrl, {
        layers: 'WHSE_LAND_AND_NATURAL_RESOURCE.PROT_CURRENT_FIRE_POLYS_SP',
        styles: '1751_1752',
        format: 'image/png',
        transparent: true,
        version: '1.1.1',
      })
      .addTo(this.map);

    const fireOfNoteIcon = L.icon({
      iconUrl: '/assets/images/local_fire_department.png',
      iconSize: [35, 35],
      shadowAnchor: [4, 62],
      popupAnchor: [1, -34],
      shadowSize: [41, 41],
    });
    if (this.incident) {
      if (this.incident.fireOfNoteInd) {
        L.marker(location, { icon: fireOfNoteIcon }).addTo(this.map);
      } else {
        const colorToDisplay = setDisplayColor(
          this.incident.stageOfControlCode,
        );
        L.circleMarker(location, {
          radius: 5,
          fillOpacity: 1,
          color: 'black',
          fillColor: colorToDisplay,
        }).addTo(this.map);
      }
    }

    // now fetch the rest of the incidents in the area and display on map
    try {
      const locationData = new LocationData();
      locationData.latitude = Number(this.evacData.centroidLatitude);
      locationData.longitude = Number(this.evacData.centroidLongitude);
      locationData.radius = 10;
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
      this.evacData.issuingAgency = evac.attributes.ISSUING_AGENCY;
      this.evacData.issuedDate = evac.attributes.DATE_MODIFIED;
      this.evacData.bulletinUrl = evac.attributes.BULLETIN_URL;
      this.evacData.centroidLatitude = evac.centroid.y;
      this.evacData.centroidLongitude = evac.centroid.x;

      await this.populateIncident(evac.geometry.rings);
    } else {
      console.error('Could not populate evacuation order by ID: ' + this.id);
    }
  }

  async populateIncident(polygon: [][]) {
    try {
      this.incident =
        await this.publishedIncidentService.populateIncidentByPoint(polygon);
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
