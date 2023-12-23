import {
  Component,
  ChangeDetectionStrategy,
  Input,
  AfterViewInit,
  HostListener,
} from '@angular/core';
import { EvacOrderOption } from '../../../conversion/models';
import * as L from 'leaflet';
import { AppConfigService } from '@wf1/core-ui';
import { WatchlistService } from '../../../services/watchlist-service';
import {
  convertToFireCentreDescription,
  convertFireNumber,
  ResourcesRoutes,
  setDisplayColor
} from '../../../utils';
import * as moment from 'moment';
import { MatDialog } from '@angular/material/dialog';
import { ContactUsDialogComponent } from '../../admin-incident-form/contact-us-dialog/contact-us-dialog.component';
import { ActivatedRoute, ParamMap, Router } from '@angular/router';
import { Location } from '@angular/common';
import { LocationData } from '@app/components/wildfires-list-header/filter-by-location/filter-by-location-dialog.component';
import { PublishedIncidentService } from '@app/services/published-incident-service';

@Component({
  selector: 'incident-header-panel',
  templateUrl: './incident-header-panel.component.html',
  styleUrls: ['./incident-header-panel.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class IncidentHeaderPanel implements AfterViewInit {
  @Input() public incident: any;
  @Input() public evacOrders: EvacOrderOption[] = [];
  @Input() public extent: any;

  public params: ParamMap;
  public defaultEvacURL: string;

  convertToFireCentreDescription = convertToFireCentreDescription;
  convertFireNumber = convertFireNumber;

  private map: any;

  constructor(
    private appConfigService: AppConfigService,
    private watchlistService: WatchlistService,
    private dialog: MatDialog,
    private router: Router,
    private location: Location,
    private publishedIncidentService: PublishedIncidentService,
    private route: ActivatedRoute,
  ) {
    /* Empty, just here for injection */
  }

  @HostListener('window:resize', ['$event'])
  onResize(event) {
    this.map.invalidateSize();
  }

  ngOnInit(): void {
    this.defaultEvacURL = this.appConfigService
      .getConfig()
      .externalAppConfig['evacDefaultUrl'].toString();
    this.route.queryParams.subscribe((params: ParamMap) => {
      this.params = params;
    });
  }

  ngAfterViewInit(): void {
    // Configure the map
    const location = [
      Number(this.incident.latitude),
      Number(this.incident.longitude),
    ];
    this.map = L.map('map', {
      attributionControl: false,
      zoomControl: false,
      dragging: false,
      doubleClickZoom: false,
      boxZoom: false,
      trackResize: false,
      scrollWheelZoom: false,
    }).setView(location, 9);
    // configure map data
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

    const icon = L.icon({
      iconUrl: '/assets/images/local_fire_department.png',
      iconSize: [35, 35],
      shadowAnchor: [4, 62],
      popupAnchor: [1, -34],
      shadowSize: [41, 41],
    });

    if (this.incident.fireOfNoteInd) {
      L.marker(location, { icon }).addTo(this.map);
    } else {
      let colorToDisplay;
      switch (this.incident.stageOfControlCode) {
        case 'OUT_CNTRL':
          colorToDisplay = '#FF0000';
          break;
        case 'HOLDING':
          colorToDisplay = '#ffff00';
          break;
        case 'UNDR_CNTRL':
          colorToDisplay = '#98E600';
          break;
        case 'OUT':
          colorToDisplay = '#999999';
          break;
        default:
          colorToDisplay = 'white';
      }
      L.circleMarker(location, {
        radius: 15,
        fillOpacity: 1,
        color: 'black',
        fillColor: colorToDisplay,
      }).addTo(this.map);
    }

    // fetch incidents in surrounding area and add to map
    this.addSurroundingIncidents();

    if (this.extent) {
      this.map.fitBounds(
        new L.LatLngBounds(
          [this.extent.ymin, this.extent.xmin],
          [this.extent.ymax, this.extent.xmax],
        ),
      );
    }
  }

  onWatchlist(): boolean {
    return this.watchlistService
      .getWatchlist()
      .includes(
        this.incident.fireYear + ':' + this.incident.incidentNumberLabel,
      );
  }

  addToWatchlist() {
    if (this.onWatchlist()) {
      this.removeFromWatchlist();
    } else {
      this.watchlistService.saveToWatchlist(
        this.incident.fireYear,
        this.incident.incidentNumberLabel,
      );
    }
  }

  removeFromWatchlist() {
    this.watchlistService.removeFromWatchlist(
      this.incident.fireYear,
      this.incident.incidentNumberLabel,
    );
  }

  displaySizeType(incidentSizeDetail: string) {
    if (incidentSizeDetail?.includes('estimated')) {
      return '(Estimated)';
    } else if (incidentSizeDetail?.includes('mapped')) {
      return '(Mapped)';
    } else {
      return null;
    }
  }

  isMobileView() {
    return (
      (window.innerWidth < 768 && window.innerHeight < 1024) ||
      (window.innerWidth < 1024 && window.innerHeight < 768)
    );
  }

  convertToMobileFormat(dateString) {
    // Should probably be MMM for month formats to prevent long strings
    const formattedDate = moment(
      dateString,
      'dddd, MMMM D, YYYY [at] h:mm:ss A',
    ).format('MMMM D, YYYY');
    return formattedDate;
  }

  openContactUsWindow() {
    this.dialog.open(ContactUsDialogComponent, {
      panelClass: 'contact-us-dialog',
      data: {
        fireCentre: convertToFireCentreDescription(
          this.incident.contactOrgUnitIdentifer ||
            this.incident.fireCentreName ||
            this.incident.fireCentreCode ||
            this.incident.fireCentre,
        ),
        email: this.incident.contactEmailAddress,
        phoneNumber: this.incident.contactPhoneNumber,
      },
    });
  }

  backToMap() {
    if (this.incident?.longitude && this.incident?.latitude) {
      setTimeout(() => {
        this.router.navigate([ResourcesRoutes.ACTIVEWILDFIREMAP], {
          queryParams: {
            longitude: this.incident.longitude,
            latitude: this.incident.latitude,
          },
        });
      }, 100);
    }
  }

  back() {
    if (this.params && this.params['source'] && this.params['source'][0]) {
      if (this.params['source'][0] === 'map') {
this.backToMap();
} else if (
        this.params['source'][0] === 'full-details' &&
        this.params['sourceId'] &&
        this.params['sourceType']
      ) {
this.router.navigate([ResourcesRoutes.FULL_DETAILS], {
          queryParams: {
            type: this.params['sourceType'],
            id: this.params['sourceId'],
          },
        });
} else if (
        this.params['source'] === 'saved-location' &&
        this.params['sourceName'] &&
        this.params['sourceLongitude'] &&
        this.params['sourceLatitude']
      ) {
        this.router.navigate([ResourcesRoutes.SAVED_LOCATION], {
          queryParams: {
            type: 'saved-location',
            name: this.params['sourceName'],
            longitude: this.params['sourceLongitude'],
            latitude: this.params['sourceLatitude'],
          },
        });
      } else {
this.router.navigate(this.params['source']);
}
    } else {
this.router.navigate([ResourcesRoutes.DASHBOARD]);
}
  }

  shareContent() {
    const currentUrl = this.location.path();
    if (navigator.share) {
      navigator
        .share({
          url: currentUrl, // The URL user wants to share
        })
        .then(() => console.log('Sharing succeeded.'))
        .catch((error) => console.error('Error sharing:', error));
    }
  }

  async addSurroundingIncidents() {
    // now fetch the rest of the incidents in the area and display on map
    try {
      const locationData = new LocationData();
      locationData.latitude = Number(this.incident.latitude);
      locationData.longitude = Number(this.incident.longitude);
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
          const location = [Number(item.latitude), Number(item.longitude)];
          const colorToDisplay = setDisplayColor(item.stageOfControlCode);
          L.circleMarker(location, {
            radius: 5,
            fillOpacity: 1,
            color: 'black',
            fillColor: colorToDisplay,
          }).addTo(this.map);
        }
      }
    } catch (err) {
      console.error(
        'Could not retrieve surrounding incidents for area restriction',
      );
    }
  }
}
