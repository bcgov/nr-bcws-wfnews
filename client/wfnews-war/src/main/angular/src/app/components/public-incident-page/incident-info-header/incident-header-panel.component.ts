import {
  Component,
  ChangeDetectionStrategy,
  Input,
  AfterViewInit,
  HostListener,
  Output,
  EventEmitter
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
  getStageOfControlLabel,
  convertToDateTimeTimeZone,
  isMobileView
} from '../../../utils';
import * as moment from 'moment';
import { MatDialog } from '@angular/material/dialog';
import { ContactUsDialogComponent } from '../../admin-incident-form/contact-us-dialog/contact-us-dialog.component';
import { ActivatedRoute, ParamMap, Router } from '@angular/router';
import { Location } from '@angular/common';
import { LocationData } from '@app/components/wildfires-list-header/filter-by-location/filter-by-location-dialog.component';
import { PublishedIncidentService } from '@app/services/published-incident-service';
import { toCanvas } from 'qrcode';
import { AGOLService } from '@app/services/AGOL-service';
import { CommonUtilityService } from '@app/services/common-utility.service';
import { HttpClient } from '@angular/common/http';


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
  @Input() public evac: any;
  @Output() requestPrint = new EventEmitter<void>();

  public params: ParamMap;
  public defaultEvacURL: string;

  convertToFireCentreDescription = convertToFireCentreDescription;
  convertFireNumber = convertFireNumber;
  convertToDateTimeTimeZone = convertToDateTimeTimeZone;
  getStageOfControlLabel = getStageOfControlLabel;
  isMobileView = isMobileView;

  private map: any;
  incidentEvacOrders = [];
  incidentEvacAlerts = [];
  bounds = null;

  constructor(
    private appConfigService: AppConfigService,
    private watchlistService: WatchlistService,
    private dialog: MatDialog,
    private router: Router,
    private location: Location,
    private publishedIncidentService: PublishedIncidentService,
    private route: ActivatedRoute,
    private agolService: AGOLService,
    private commonUtilityService: CommonUtilityService,
    private http: HttpClient

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
    this.initializeMap();
  }

  async initializeMap() {
    let location;

    if (this.incident) {
      location = [
        Number(this.incident.latitude),
        Number(this.incident.longitude),
      ];
    } else if (this.evac) {
      location = [
        Number(this.evac.centroid?.y),
        Number(this.evac.centroid?.x),
      ];

      const response = await this.agolService
        .getEvacOrdersByEventNumber(this.params['eventNumber'], {
          returnGeometry: true,
        }).toPromise();

      if (response?.features?.length > 0 && response?.features[0].geometry?.rings?.length > 0) {
        const polygonData = this.commonUtilityService.extractPolygonData(response.features[0].geometry.rings);
        if (polygonData?.length) {
          this.bounds = this.commonUtilityService.getPolygonBond(polygonData);
        }
      }
    }

    this.map = L.map('map', {
      attributionControl: false,
      zoomControl: false,
      dragging: false,
      doubleClickZoom: false,
      boxZoom: false,
      trackResize: false,
      scrollWheelZoom: false,
    }).setView(location, 9);

    if (this.bounds) {
      this.map.fitBounds(this.bounds);
    }
    if (!this.isMobileView()) {
      // only apply these in desktop
      L.control.zoom({
        position: 'topright'
      }).addTo(this.map);
    }

    if (!this.isMobileView()) {
      L.Control.ZoomToExtent = L.Control.extend({
        onAdd: (map) => {
          const container = L.DomUtil.create('div', 'leaflet-bar leaflet-control leaflet-control-custom');
          const btn = L.DomUtil.create('button', '', container);
          this.loadSVGContent(btn)
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
          btn.onclick = () => {
            if (this.bounds) {
              this.map.fitBounds(this.bounds);
            } else {
              this.map.setZoom(9);
            }
          };

          return btn;
        }
      });

      L.control.zoomToExtent = function (opts) {
        return new L.Control.ZoomToExtent(opts);
      }
      L.control.zoomToExtent({ position: 'topright' }).addTo(this.map);
    }

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
    toCanvas(canvas, window.location.href, function (error) {
      if (error) {
        console.error(error);
      }
      window.print();
      document.body.innerHTML = '';
      document.body.appendChild(appRoot);
    });
  }

  navToMap() {
    setTimeout(() => {
      this.router.navigate([ResourcesRoutes.ACTIVEWILDFIREMAP], {
        queryParams: {
          longitude: this.evac.centroid.x,
          latitude: this.evac.centroid.y,
          evacuationAlert: true,
        },
      });
    }, 200);
  }

  private loadSVGContent(btn: HTMLElement): void {
    const svgPath = 'assets/images/svg-icons/zoom-to-extent.svg';
    this.http.get(svgPath, { responseType: 'text' }).subscribe(
      (data) => {
        btn.innerHTML = data;
      },
      (error) => {
        console.error('Error loading SVG', error);
      }
    );
  }
}
