import { ChangeDetectorRef, Component, Input, OnInit } from '@angular/core';
import { Router as Route } from '@angular/router';
import { LocationData } from '@app/components/wildfires-list-header/filter-by-location/filter-by-location-dialog.component';
import { AGOLService } from '@app/services/AGOL-service';
import { PublishedIncidentService } from '@app/services/published-incident-service';
import { AppConfigService } from '@wf1/core-ui';
import * as L from 'leaflet';
import { ResourcesRoutes, setDisplayColor } from '@app/utils';

@Component({
  selector: 'wfnews-danger-rating-full-details',
  templateUrl: './danger-rating-full-details.component.html',
  styleUrls: ['./danger-rating-full-details.component.scss'],
})
export class DangerRatingFullDetailsComponent implements OnInit {
  @Input() rating: string;
  @Input() location: string;

  public map: any;

  constructor(
    private cdr: ChangeDetectorRef,
    private appConfigService: AppConfigService,
    private agolService: AGOLService,
    private publishedIncidentService: PublishedIncidentService,
    private route: Route,
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
    const location = [locationData.latitude, locationData.longitude];

    // this code is duplicated in a few places now. Might make sense to move into
    // a specific component or util factory class
    this.map = L.map('restrictions-map', {
      attributionControl: false,
      zoomControl: false,
      dragging: false,
      doubleClickZoom: false,
      boxZoom: false,
      trackResize: false,
      scrollWheelZoom: false,
    }).setView(location, 9);
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
