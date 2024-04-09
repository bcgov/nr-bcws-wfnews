import { ChangeDetectorRef, Component, Input, OnInit } from '@angular/core';
import { Router as Route } from '@angular/router';
import { LocationData } from '@app/components/wildfires-list-header/filter-by-location/filter-by-location-dialog.component';
import { AGOLService, AgolOptions } from '@app/services/AGOL-service';
import { PublishedIncidentService } from '@app/services/published-incident-service';
import { ResourcesRoutes, convertToDateYear, setDisplayColor } from '@app/utils';
import { AppConfigService } from '@wf1/core-ui';
import * as L from 'leaflet';
import { HttpClient } from '@angular/common/http';

export class BanProhibition {
  public id: string;
  public type: string;
  public description: string;
  public issuedDate: string;
  public bulletinUrl: string;
  public centroidLongitude: string;
  public centroidLatitude: string;
  public fireCentre: string;
  public isCat1 = false;
  public isCat2 = false;
  public isCat3 = false;
}

@Component({
  selector: 'wfnews-bans-full-details',
  templateUrl: './bans-full-details.component.html',
  styleUrls: ['./bans-full-details.component.scss'],
})
export class BansFullDetailsComponent implements OnInit {
  @Input() id: string;

  public banData: BanProhibition | null;
  public map: any;

  constructor(
    private cdr: ChangeDetectorRef,
    private appConfigService: AppConfigService,
    private agolService: AGOLService,
    private publishedIncidentService: PublishedIncidentService,
    private httpClient: HttpClient,
    private route: Route,
  ) {}

  async ngOnInit(): Promise<void> {
    await this.populateBansByID({
      returnGeometry: true,
      returnCentroid: true,
      returnExtent: false,
    });
    this.initMap();
  }

  async initMap() {
    // Create map and append data to the map component
    const location = [
      Number(this.banData.centroidLatitude),
      Number(this.banData.centroidLongitude),
    ];

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
    }).setView(location, 5);
    // configure map  - change from osm to ESRI eventually. Needs to be done elsewhere too
    L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution:
        '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    }).addTo(this.map);

    Promise.all([
      this.httpClient
        .get('assets/js/smk/bans-cat1.sld', { responseType: 'text' })
        .toPromise(),
      this.httpClient
        .get('assets/js/smk/bans-cat2.sld', { responseType: 'text' })
        .toPromise(),
      this.httpClient
        .get('assets/js/smk/bans-cat3.sld', { responseType: 'text' })
        .toPromise(),
      this.agolService
        .getBansAndProhibitionsById(this.id, {
          returnGeometry: false,
          returnCentroid: false,
          returnExtent: true,
        })
        .toPromise(),
    ]).then(async ([cat1sld, cat2sld, cat3sld, extent]) => {
      // zoom to the polygon extent
      if (extent?.extent) {
        this.map.fitBounds(
          new L.LatLngBounds(
            [extent.extent.ymin, extent.extent.xmin],
            [extent.extent.ymax, extent.extent.xmax],
          ),
        );
      }

      const databcUrl = this.appConfigService
        .getConfig()
        ['mapServices']['openmapsBaseUrl'].toString();
      L.tileLayer
        .wms(databcUrl, {
          layers:
            'WHSE_LAND_AND_NATURAL_RESOURCE.PROT_BANS_AND_PROHIBITIONS_SP',
          format: 'image/png',
          transparent: true,
          version: '1.1.1',
          sld_body: cat3sld,
          cql_filter: 'ACCESS_PROHIBITION_DESCRIPTION LIKE \'%Category 3%\'',
          opacity: 0.5,
        })
        .addTo(this.map);

      L.tileLayer
        .wms(databcUrl, {
          layers:
            'WHSE_LAND_AND_NATURAL_RESOURCE.PROT_BANS_AND_PROHIBITIONS_SP',
          format: 'image/png',
          transparent: true,
          version: '1.1.1',
          sld_body: cat2sld,
          cql_filter: 'ACCESS_PROHIBITION_DESCRIPTION LIKE \'%Category 2%\'',
          opacity: 0.5,
        })
        .addTo(this.map);

      L.tileLayer
        .wms(databcUrl, {
          layers:
            'WHSE_LAND_AND_NATURAL_RESOURCE.PROT_BANS_AND_PROHIBITIONS_SP',
          format: 'image/png',
          transparent: true,
          version: '1.1.1',
          sld_body: cat1sld,
          cql_filter:
            'ACCESS_PROHIBITION_DESCRIPTION LIKE \'%Category 1%\' OR ACCESS_PROHIBITION_DESCRIPTION LIKE \'%Campfire%\'',
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

      // now fetch the rest of the incidents in the area and display on map
      try {
        const locationData = new LocationData();
        locationData.latitude = Number(this.banData.centroidLatitude);
        locationData.longitude = Number(this.banData.centroidLongitude);
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
    });
    this.cdr.detectChanges();
  }

  async populateBansByID(options: AgolOptions = null) {
    this.banData = null;
    const response = await this.agolService
      .getBansAndProhibitionsById(this.id, options)
      .toPromise();
    // could also do response length === 1
    if (response?.features[0]?.attributes) {
      const ban = response.features[0];

      this.banData = new BanProhibition();

      this.banData.id = ban.attributes.PROT_BAP_SYSID;
      this.banData.type = ban.attributes.TYPE;
      this.banData.description = ban.attributes.ACCESS_PROHIBITION_DESCRIPTION;
      this.banData.fireCentre =
        ban.attributes.FIRE_CENTRE_NAME + ' Fire Centre';
      this.banData.issuedDate = convertToDateYear(
        ban.attributes.ACCESS_STATUS_EFFECTIVE_DATE,
      );
      this.banData.bulletinUrl = ban.attributes.BULLETIN_URL;
      this.banData.centroidLatitude = ban.centroid.y;
      this.banData.centroidLongitude = ban.centroid.x;
      this.banData.isCat1 =
        this.banData.description.includes('1') ||
        this.banData.description.toLowerCase().includes('campfires');
      this.banData.isCat2 = this.banData.description.includes('2');
      this.banData.isCat3 = this.banData.description.includes('3');
    } else {
      // What happens when this fails?
    }
  }

  navToMap() {
    setTimeout(() => {
      this.route.navigate([ResourcesRoutes.ACTIVEWILDFIREMAP], {
        queryParams: {
          longitude: this.banData.centroidLongitude,
          latitude: this.banData.centroidLatitude,
          bansProhibitions: true,
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

  navToForestUseRestrictions() {
    window.open(
      'https://www2.gov.bc.ca/gov/content/safety/wildfire-status/prevention/fire-bans-and-restrictions/forest-use-restrictions',
      '_blank',
    );
  }

  navToOpenBurning() {
    window.open(
      'https://www2.gov.bc.ca/gov/content/safety/wildfire-status/prevention/fire-bans-and-restrictions/open-burning',
      '_blank',
    );
  }

  navToBulletinUrl() {
    window.open(this.banData.bulletinUrl ? this.banData.bulletinUrl : this.appConfigService.getConfig().externalAppConfig['currentRestrictions'] as unknown as string, '_blank');
  }
}
