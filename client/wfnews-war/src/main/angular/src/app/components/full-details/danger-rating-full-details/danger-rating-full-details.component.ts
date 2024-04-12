import { ChangeDetectorRef, Component, Input, OnInit } from '@angular/core';
import { Router as Route } from '@angular/router';
import { LocationData } from '@app/components/wildfires-list-header/filter-by-location/filter-by-location-dialog.component';
import { PublishedIncidentService } from '@app/services/published-incident-service';
import { AppConfigService } from '@wf1/core-ui';
import * as L from 'leaflet';
import { ResourcesRoutes, setDisplayColor } from '@app/utils';
import { AGOLService } from '@app/services/AGOL-service';
import { CommonUtilityService } from '@app/services/common-utility.service';

@Component({
  selector: 'wfnews-danger-rating-full-details',
  templateUrl: './danger-rating-full-details.component.html',
  styleUrls: ['./danger-rating-full-details.component.scss'],
})
export class DangerRatingFullDetailsComponent implements OnInit {
  @Input() rating: string;
  @Input() location: string;
  @Input() sysid: string;

  public map: any;

  constructor(
    private cdr: ChangeDetectorRef,
    private appConfigService: AppConfigService,
    private publishedIncidentService: PublishedIncidentService,
    private route: Route,
    private agolService: AGOLService,
    private commonUtilityService: CommonUtilityService
  ) {}

  async ngOnInit(): Promise<void> {
    this.initMap();
  }

  dangerDescription() {
    switch (this.rating) {
      case 'Very Low':
        return 'Dry forest fuels are at a very low risk of catching fire.';
      case 'Low':
        return 'Fires may start easily and spread quickly but there will be minimal involvement of deeper fuel layers or larger fuels.';
      case 'Moderate':
        return 'Forest fuels are drying and there is an increased risk of surface fires starting. Carry out any forest activities with caution.';
      case 'High':
        return 'Forest fuels are very dry and the fire risk is serious.  Extreme caution must be used in any forest activities.';
      case 'Extreme':
        return 'Extremely dry forest fuels and the fire risk is very serious. New fires will start easily, spread rapidly, and challenge fire suppression efforts.';
    }
  }

  async initMap() {
    // Create map and append data to the map component
    const locationData = JSON.parse(this.location) as LocationData;
    let bounds = null;
    this.agolService
    .getDangerRatings(
      `PROT_DR_SYSID ='${this.sysid}'`,
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
          this.createMap(locationData, bounds);
        }                
      }
    });
  }

  async createMap(locationData: LocationData, bounds?: any) {
    const location = [locationData.latitude, locationData.longitude];

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
        layers: 'WHSE_LAND_AND_NATURAL_RESOURCE.PROT_DANGER_RATING_SP',
        format: 'image/png',
        transparent: true,
        version: '1.1.1',
        opacity: 0.5,
        style: '7734',
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
      console.error('Could not retrieve surrounding incidents');
    }
    this.cdr.detectChanges();
  }

  navToMap() {
    setTimeout(() => {
      const locationData = JSON.parse(this.location) as LocationData;
      this.route.navigate([ResourcesRoutes.ACTIVEWILDFIREMAP], {
        queryParams: {
          longitude: locationData.longitude,
          latitude: locationData.latitude,
          dangerRating: true,
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

  navToDangerSummary() {
    window.open(
      'https://www2.gov.bc.ca/gov/content/safety/wildfire-status/wildfire-situation/fire-danger',
      '_blank',
    );
  }
}
