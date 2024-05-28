import {
  Component,
  ChangeDetectionStrategy,
  Input,
  AfterViewInit,
  HostListener,
  Output,
  EventEmitter,
} from '@angular/core';
import { EvacOrderOption } from '../../../conversion/models';
import * as L from 'leaflet';
import { AppConfigService } from '@wf1/core-ui';
import { WatchlistService } from '../../../services/watchlist-service';
import {
  convertToFireCentreDescription,
  convertFireNumber,
  ResourcesRoutes,
  setDisplayColor,
  getStageOfControlLabel
} from '../../../utils';
import * as moment from 'moment';
import { MatDialog } from '@angular/material/dialog';
import { ContactUsDialogComponent } from '../../admin-incident-form/contact-us-dialog/contact-us-dialog.component';
import { ActivatedRoute, ParamMap, Router } from '@angular/router';
import { Location } from '@angular/common';
import { LocationData } from '@app/components/wildfires-list-header/filter-by-location/filter-by-location-dialog.component';
import { PublishedIncidentService } from '@app/services/published-incident-service';
import { toCanvas } from 'qrcode';


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
  @Output() requestPrint = new EventEmitter<void>();

  public params: ParamMap;
  public defaultEvacURL: string;

  convertToFireCentreDescription = convertToFireCentreDescription;
  convertFireNumber = convertFireNumber;
  getStageOfControlLabel = getStageOfControlLabel;

  private map: any;
  incidentEvacOrders = [];
  incidentEvacAlerts = [];

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
    if (this.evacOrders?.length) {
      for (const evac of this.evacOrders) {
        if (evac.orderAlertStatus === 'Order') {
          this.incidentEvacOrders.push(evac);
        } else if (evac.orderAlertStatus === 'Alert') {
          this.incidentEvacAlerts.push(evac);
        }
      }
    }
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
    if (!this.isMobileView()){
      // only apply these in desktop
      L.control.zoom({
        position: 'topright'
      }).addTo(this.map);
    }

    L.Control.ZoomToExtent = L.Control.extend({
      onAdd: function(map) {
        const container = L.DomUtil.create('div', 'leaflet-bar leaflet-control leaflet-control-custom');
        const btn = L.DomUtil.create('button', '', container);
        btn.innerHTML = `
          <svg xmlns="http://www.w3.org/2000/svg" width="25" height="25" viewBox="0 0 25 25" fill="none">
            <path d="M16.586 15.6968C17.8234 14.2274 18.5013 12.3678 18.5 10.4468C18.5 8.81508 18.0161 7.22003 17.1096 5.86333C16.2031 4.50662 14.9146 3.4492 13.4071 2.82477C11.8997 2.20035 10.2409 2.03697 8.64051 2.3553C7.04017 2.67363 5.57016 3.45937 4.41637 4.61315C3.26259 5.76693 2.47685 7.23694 2.15853 8.83729C1.8402 10.4376 2.00357 12.0964 2.628 13.6039C3.25242 15.1114 4.30984 16.3999 5.66655 17.3064C7.02325 18.2129 8.61831 18.6968 10.25 18.6968C12.171 18.6981 14.0306 18.0201 15.5 16.7828L21.1895 22.4468L22.25 21.3863L16.586 15.6968ZM10.25 17.1968C8.91498 17.1968 7.60994 16.8009 6.4999 16.0592C5.38987 15.3175 4.52471 14.2633 4.01382 13.0299C3.50293 11.7965 3.36925 10.4393 3.6297 9.12992C3.89015 7.82055 4.53303 6.61781 5.47703 5.67381C6.42104 4.72981 7.62377 4.08693 8.93314 3.82648C10.2425 3.56603 11.5997 3.6997 12.8331 4.21059C14.0665 4.72149 15.1207 5.58665 15.8624 6.69668C16.6041 7.80671 17 9.11176 17 10.4468C16.998 12.2364 16.2862 13.9521 15.0208 15.2176C13.7553 16.483 12.0396 17.1948 10.25 17.1968Z" fill="#242424"/>
            <path d="M8 9.69678H6.5V8.19678C6.5004 7.79907 6.65856 7.41777 6.93978 7.13656C7.221 6.85534 7.6023 6.69717 8 6.69678H9.5V8.19678H8V9.69678ZM14 9.69678H12.5V8.19678H11V6.69678H12.5C12.8977 6.69717 13.279 6.85534 13.5602 7.13656C13.8414 7.41777 13.9996 7.79907 14 8.19678V9.69678ZM9.5 14.1968H8C7.6023 14.1964 7.221 14.0382 6.93978 13.757C6.65856 13.4758 6.5004 13.0945 6.5 12.6968V11.1968H8V12.6968H9.5V14.1968ZM12.5 14.1968H11V12.6968H12.5V11.1968H14V12.6968C13.9996 13.0945 13.8414 13.4758 13.5602 13.757C13.279 14.0382 12.8977 14.1964 12.5 14.1968Z" fill="#242424"/>
          </svg>
        `;
        btn.style.backgroundColor = 'white';
        btn.style.width = '34px';
        btn.style.height = '34px';
        btn.style.cursor = 'pointer';
        btn.style.border = '2px solid darkgrey';
        btn.style.borderRadius = '4px';
        btn.style.display = 'flex';
        btn.style.alignItems = 'center';
        btn.style.justifyContent = 'center';
        btn.style.marginTop = '-3px';
        btn.style.borderTopWidth = '1px';
        btn.onclick = function() {
          map.setZoom(9);
        };
  
        return btn;
      }
    });

    L.control.zoomToExtent = function(opts) {
      return new L.Control.ZoomToExtent(opts);
    }
    L.control.zoomToExtent({ position: 'topright' }).addTo(this.map);

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

  openContactUsWindow(mode:string | null) {
    this.dialog.open(ContactUsDialogComponent, {
      panelClass: 'contact-us-dialog',
      width: mode === 'desktop' ? '500px' : undefined,  // Set width based on mode
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
            activeWildfires: true
          },
        });
      }, 100);
    }
  }

  back() {
    if (this.params && this.params['source'] && this.params['source'][0]) {
      if (this.params['source'] === 'map' || this.params['source'][0] === 'map') {
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
            name: this.params['name']
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
this.router.navigate([this.params['source']]);
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

  // printPage(){
  //   this.requestPrint.emit();
  // }

  public printPage() {
    const printContents =
      document.getElementsByClassName('page-container')[0].innerHTML;

    const appRoot = document.body.removeChild(
      document.getElementById('app-root'),
    );

    document.body.innerHTML = printContents;

    const canvas = document.getElementById('qr-code');
    toCanvas(canvas, window.location.href, function(error) {
      if (error) {
console.error(error);
}
      window.print();
      document.body.innerHTML = '';
      document.body.appendChild(appRoot);
    });
  }

}
