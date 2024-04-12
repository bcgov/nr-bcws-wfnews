import { ChangeDetectorRef, Component, Input, OnInit } from '@angular/core';
import { Router as Route } from '@angular/router';
import { LocationData } from '@app/components/wildfires-list-header/filter-by-location/filter-by-location-dialog.component';
import { AGOLService, AgolOptions } from '@app/services/AGOL-service';
import { PublishedIncidentService } from '@app/services/published-incident-service';
import {
  ResourcesRoutes,
  convertToDateYear,
  getStageOfControlIcon,
  getStageOfControlLabel,
} from '@app/utils';
import { AppConfigService } from '@wf1/core-ui';
import * as L from 'leaflet';
import { setDisplayColor } from '@app/utils';
import { WatchlistService } from '@app/services/watchlist-service';
import { CommonUtilityService } from '@app/services/common-utility.service';

export class AreaRestriction {
  public name: string;
  public issuedDate: string;
  public bulletinUrl: string;
  public wildfireYear: string;
  public centroidLongitude: string;
  public centroidLatitude: string;
  public fireCentre: string;
}

export class SimpleIncident {
  public incidentName: string;
  public incidentNumber: string;
  public discoveryDate: string;
  public stageOfControlCode: string;
  public stageOfControlLabel: string;
  public stageOfControlIcon: string;
  public fireOfNoteInd: boolean;
}

@Component({
  selector: 'wfnews-area-restrictions-full-details',
  templateUrl: './area-restrictions-full-details.component.html',
  styleUrls: ['./area-restrictions-full-details.component.scss'],
})
export class AreaRestrictionsFullDetailsComponent implements OnInit {
  @Input() id: string;
  @Input() name: string;

  public restrictionData: AreaRestriction | null;
  public incident: SimpleIncident | null;
  public map: any;

  public getStageOfControlLabel = getStageOfControlLabel;
  public getStageOfControlIcon = getStageOfControlIcon;

  constructor(
    private cdr: ChangeDetectorRef,
    private appConfigService: AppConfigService,
    private agolService: AGOLService,
    private publishedIncidentService: PublishedIncidentService,
    private route: Route,
    private watchlistService: WatchlistService,
    private commonUtilityService: CommonUtilityService
  ) {}

  async ngOnInit(): Promise<void> {
    await this.populateAreaRestrictionByID({
      returnGeometry: true,
      returnCentroid: true,
      returnExtent: false,
    });
    this.initMap();
  }

  async initMap() {
    // Create map and append data to the map component
    const location = [
      Number(this.restrictionData.centroidLatitude),
      Number(this.restrictionData.centroidLongitude),
    ];

    let bounds = null;
    this.agolService
    .getAreaRestrictions(
      `NAME='${this.name}'`,
      null,
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
      } else {
        this.createMap(location);
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
    // configure map  - change from osm to ESRI eventually. Needs to be done elsewhere too
    L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution:
        '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    }).addTo(this.map);

    const databcUrl = this.appConfigService
      .getConfig()
      ['mapServices']['openmapsBaseUrl'].toString();
    L.tileLayer
      .wms(databcUrl, {
        layers: 'WHSE_LAND_AND_NATURAL_RESOURCE.PROT_RESTRICTED_AREAS_SP ',
        format: 'image/png',
        transparent: true,
        version: '1.1.1',
        opacity: 0.5,
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
          radius: 15,
          fillOpacity: 1,
          color: 'black',
          fillColor: colorToDisplay,
        }).addTo(this.map);
      }
    }

    // now fetch the rest of the incidents in the area and display on map
    try {
      const locationData = new LocationData();
      locationData.latitude = Number(this.restrictionData.centroidLatitude);
      locationData.longitude = Number(this.restrictionData.centroidLongitude);
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
        'Could not retrieve surrounding incidents for area restriction',
      );
    }
    this.cdr.detectChanges();
  }

  async populateAreaRestrictionByID(options: AgolOptions = null) {
    this.restrictionData = null;

  const response = this.name ?
    await this.agolService.getAreaRestrictions(`NAME='${this.name}'`, null, options).toPromise() :
    await this.agolService.getAreaRestrictions(`PROT_RA_SYSID='${this.id}'`, null, options).toPromise();
    // could also do response length === 1
    if (response?.features[0]?.attributes) {
      const areaRestriction = response.features[0];

      this.restrictionData = new AreaRestriction();

      this.restrictionData.name =
        areaRestriction.attributes.NAME.replace('Area Restriction', '').trim() +
        ' Area Restriction';
      this.restrictionData.fireCentre =
        areaRestriction.attributes.FIRE_CENTRE_NAME;
      this.restrictionData.issuedDate = convertToDateYear(
        areaRestriction.attributes.ACCESS_STATUS_EFFECTIVE_DATE,
      );
      this.restrictionData.bulletinUrl =
        areaRestriction.attributes.BULLETIN_URL;
      this.restrictionData.centroidLatitude = areaRestriction.centroid.y;
      this.restrictionData.centroidLongitude = areaRestriction.centroid.x;

      await this.populateIncident(areaRestriction.geometry.rings);
    } else {
      console.error('Could not populate area restriction by ID: ' + this.id);
    }
  }

  async populateIncident(restrictionPolygon: [][]) {
    try {
      this.incident =
        await this.publishedIncidentService.populateIncidentByPoint(
          restrictionPolygon,
        );
    } catch (error) {
      console.error(
        'Error while populaiting associated incident for area restriction: ' +
          error,
      );
    }
  }

  navToMap() {
    setTimeout(() => {
      this.route.navigate([ResourcesRoutes.ACTIVEWILDFIREMAP], {
        queryParams: {
          longitude: this.restrictionData.centroidLongitude,
          latitude: this.restrictionData.centroidLatitude,
          areaRestriction: true,
        },
      });
    }, 200);
  }

  navToCurrentRestrictions() {
    window.open(
      this.appConfigService.getConfig().externalAppConfig[
        'currentRestrictions'
      ] as unknown as string,
      '_blank',
    );
  }

  navToRecClosures() {
    window.open(
      this.appConfigService.getConfig().externalAppConfig[
        'recSiteTrailsClosures'
      ] as unknown as string,
      '_blank',
    );
  }

  navToParksClosures() {
    window.open(
      this.appConfigService.getConfig().externalAppConfig[
        'parksClosures'
      ] as unknown as string,
      '_blank',
    );
  }

  navToBulletinUrl() {
    window.open(this.restrictionData.bulletinUrl ? this.restrictionData.bulletinUrl : this.appConfigService.getConfig().externalAppConfig['currentRestrictions'] as unknown as string, '_blank');
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
