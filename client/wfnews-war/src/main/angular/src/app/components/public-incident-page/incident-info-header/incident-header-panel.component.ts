/* eslint-disable @typescript-eslint/naming-convention */
/* eslint-disable object-shorthand */
import { Location } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import {
  AfterViewInit,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  EventEmitter,
  HostListener,
  Input,
  OnInit,
  Output
} from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { ActivatedRoute, ParamMap, Router } from '@angular/router';
import { LocationData } from '@app/components/wildfires-list-header/filter-by-location/filter-by-location-dialog.component';
import { AGOLService } from '@app/services/AGOL-service';
import { CommonUtilityService } from '@app/services/common-utility.service';
import { PublishedIncidentService } from '@app/services/published-incident-service';
import { AppConfigService } from '@wf1/core-ui';
import * as esri from 'esri-leaflet';
import * as L from 'leaflet';
import * as moment from 'moment';
import { toCanvas } from 'qrcode';
import { EvacOrderOption } from '../../../conversion/models';
import { WatchlistService } from '../../../services/watchlist-service';
import {
  ResourcesRoutes,
  convertFireNumber,
  convertToDateTimeTimeZone,
  convertToFireCentreDescription,
  getStageOfControlLabel,
  isMobileView,
  setDisplayColor
} from '../../../utils';
import { ContactUsDialogComponent } from '../../admin-incident-form/contact-us-dialog/contact-us-dialog.component';

@Component({
  selector: 'incident-header-panel',
  templateUrl: './incident-header-panel.component.html',
  styleUrls: ['./incident-header-panel.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class IncidentHeaderPanelComponent implements AfterViewInit, OnInit {
  @Input() public incident: any;
  @Input() public evacOrders: EvacOrderOption[] = [];
  @Input() public extent: any;
  @Input() public evac: any;
  @Input() public areaRestriction: any;
  @Input() public ban: any;
  @Input() public dangerRating: any;
  @Output() requestPrint = new EventEmitter<void>();

  public params: ParamMap;
  public defaultEvacURL: string;

  convertToFireCentreDescription = convertToFireCentreDescription;
  convertFireNumber = convertFireNumber;
  convertToDateTimeTimeZone = convertToDateTimeTimeZone;
  getStageOfControlLabel = getStageOfControlLabel;
  isMobileView = isMobileView;

  incidentEvacOrders = [];
  incidentEvacAlerts = [];
  bounds = null;
  banCategories = {
    isCat1: false,
    isCat2: false,
    isCat3: false,
  };

  private map: any;


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
    private http: HttpClient,
    private cdr: ChangeDetectorRef,

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
    } else if (this.areaRestriction) {
      location = [
        Number(this.areaRestriction.centroid?.y),
        Number(this.areaRestriction.centroid?.x),
      ];
      const polygonData = this.commonUtilityService.extractPolygonData(this.areaRestriction.geometry?.rings);
      if (polygonData?.length) {
        this.bounds = this.commonUtilityService.getPolygonBond(polygonData);
      }
    } else if (this.ban) {
      this.banCategories.isCat1 =
        this.ban.attributes.ACCESS_PROHIBITION_DESCRIPTION.includes('1') ||
        this.ban.attributes.ACCESS_PROHIBITION_DESCRIPTION.toLowerCase().includes('campfires');
      this.banCategories.isCat2 = this.ban.attributes.ACCESS_PROHIBITION_DESCRIPTION.includes('2');
      this.banCategories.isCat3 = this.ban.attributes.ACCESS_PROHIBITION_DESCRIPTION.includes('3');
      location = [
        Number(this.ban.centroid?.y),
        Number(this.ban.centroid?.x),
      ];
      const polygonData = this.commonUtilityService.extractPolygonData(this.ban.geometry?.rings);
      if (polygonData?.length) {
        this.bounds = this.commonUtilityService.getPolygonBond(polygonData);
      }
    } else if (this.dangerRating) {
      location = [
        Number(this.dangerRating.centroid?.y),
        Number(this.dangerRating.centroid?.x),
      ];
      const polygonData = this.commonUtilityService.extractPolygonData(this.dangerRating.geometry?.rings);
      if (polygonData?.length) {
        this.bounds = this.commonUtilityService.getPolygonBond(polygonData);
      }
    }

    if (location) {
      this.map = L.map('map', {
        attributionControl: false,
        zoomControl: false,
        dragging: false,
        doubleClickZoom: false,
        boxZoom: false,
        trackResize: false,
        scrollWheelZoom: false,
      }).setView(location, 9);
    }

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
          this.createZoomIcon(btn);
          btn.style.backgroundColor = 'white';
          btn.style.backgroundClip = 'padding-box';
          btn.style.boxSizing = 'content-box';
          btn.style.width = '30px';
          btn.style.height = '30px';
          btn.style.padding = '0px';
          btn.style.cursor = 'pointer';
          btn.style.border = '2px solid rgba(0, 0, 0, 0.2)';
          btn.style.borderBottomLeftRadius = '4px';
          btn.style.borderBottomRightRadius = '4px';
          btn.style.display = 'flex';
          btn.style.alignItems = 'center';
          btn.style.justifyContent = 'center';
          btn.style.marginTop = '-3px';
          btn.style.borderTop = '1px solid #CCC';
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

      L.control.zoomToExtent = (opts) => new L.Control.ZoomToExtent(opts);
      L.control.zoomToExtent({ position: 'topright' }).addTo(this.map);
    }

    let bounds;
    if (this.extent) {
      bounds = new L.LatLngBounds(
        [this.extent.ymin, this.extent.xmin],
        [this.extent.ymax, this.extent.xmax],
      );
      this.map.fitBounds(bounds);
    }

    // configure map data
    L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution:
        '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    }).addTo(this.map);

    const databcUrl = this.appConfigService
      .getConfig()
    ['mapServices']['openmapsBaseUrl'].toString();

    if (this.evac) {
      esri.featureLayer({
        url: this.appConfigService.getConfig()['externalAppConfig']['AGOLperimetres'].toString(),
        ignoreRenderer: true,
        precision: 3,
        style: (feature) => ({
          fillColor: '#e60000',
          color: '#e60000',
          weight: 2,
          fillOpacity: 0.5
        })
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
              fillOpacity: 0.5
            };
          } else if (feature.properties.ORDER_ALERT_STATUS === 'Alert') {
            return {
              fillColor: '#fa9600',
              color: '#fa9600',
              weight: 2.25,
              fillOpacity: 0.5
            };
          }
        }
      })
        .addTo(this.map);
    }

    if (this.areaRestriction) {
      L.tileLayer
        .wms(databcUrl, {
          layers: 'WHSE_LAND_AND_NATURAL_RESOURCE.PROT_RESTRICTED_AREAS_SP ',
          format: 'image/png',
          transparent: true,
          version: '1.1.1',
          opacity: 0.8,
          tileSize: 1000,
          bounds: bounds,
        })
        .addTo(this.map);
    }

    if (this.ban) {
      console.log('this.ban', this.ban);

      Promise.all([
        this.http
          .get('assets/js/smk/bans-cat1.sld', { responseType: 'text' })
          .toPromise(),
        this.http
          .get('assets/js/smk/bans-cat2.sld', { responseType: 'text' })
          .toPromise(),
        this.http
          .get('assets/js/smk/bans-cat3.sld', { responseType: 'text' })
          .toPromise(),
        this.agolService
          .getBansAndProhibitionsById(this.params['eventNumber'], {
            returnGeometry: false,
            returnCentroid: false,
            returnExtent: true,
          })
          .toPromise(),
      ]).then(async ([cat1sld, cat2sld, cat3sld, extent]) => {
        let banBounds: L.LatLngBounds;

        if (extent?.extent) {
          bounds = new L.LatLngBounds(
            [extent.extent.ymin, extent.extent.xmin],
            [extent.extent.ymax, extent.extent.xmax],
          );
          this.map.fitBounds(bounds);
        }

        if (this.banCategories.isCat3) {
          L.tileLayer
            .wms(databcUrl, {
              layers:
                'WHSE_LAND_AND_NATURAL_RESOURCE.PROT_BANS_AND_PROHIBITIONS_SP',
              format: 'image/png',
              transparent: true,
              version: '1.1.1',
              sld_body: cat3sld,
              cql_filter: 'ACCESS_PROHIBITION_DESCRIPTION LIKE \'%Category 3%\'',
              tileSize: 1000,
              bounds: banBounds,
              opacity: 0.5,
            })
            .addTo(this.map);
        }

        if (this.banCategories.isCat2) {
          L.tileLayer
            .wms(databcUrl, {
              layers:
                'WHSE_LAND_AND_NATURAL_RESOURCE.PROT_BANS_AND_PROHIBITIONS_SP',
              format: 'image/png',
              transparent: true,
              version: '1.1.1',
              sld_body: cat2sld,
              cql_filter: 'ACCESS_PROHIBITION_DESCRIPTION LIKE \'%Category 2%\'',
              tileSize: 1000,
              bounds: banBounds,
              opacity: 0.5,
            })
            .addTo(this.map);
        }

        if (this.banCategories.isCat1) {
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
              tileSize: 1000,
              bounds: banBounds,
              opacity: 0.5,
            })
            .addTo(this.map);
        }
      });
    }

    if (this.dangerRating) {
      const rating = this.convertDangerRating(this.dangerRating.attributes?.DANGER_RATING_DESC);

      this.http
        .get('assets/js/smk/' + rating + '-danger-rating.sld', { responseType: 'text' })
        .toPromise()
        .then((dangerRating) => {
          L.tileLayer
            .wms(databcUrl, {
              layers: 'WHSE_LAND_AND_NATURAL_RESOURCE.PROT_DANGER_RATING_SP',
              format: 'image/png',
              transparent: true,
              version: '1.1.1',
              opacity: 0.8,
              tileSize: 1000,
              bounds: bounds,
              style: '7734',
              sld_body: dangerRating,
            })
            .addTo(this.map);
        })
    }
    const icon = L.icon({
      iconUrl: '/assets/images/local_fire_department.png',
      iconSize: [35, 35],
      shadowAnchor: [4, 62],
      popupAnchor: [1, -34],
      shadowSize: [41, 41],
    });

    if (this.incident) {
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
      this.cdr.detectChanges();
    }

    // fetch incidents in surrounding area and add to map
    this.addSurroundingIncidents();
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

  convertDangerRating(rating) {
    switch (rating) {
      case 'Very Low':
        return 'very-low';
      case 'Low':
        return 'low';
      case 'Moderate':
        return 'moderate';
      case 'High':
        return 'high';
      case 'Extreme':
        return 'extreme';
      default:
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

  openContactUsWindow(mode: string | null) {
    this.dialog.open(ContactUsDialogComponent, {
      panelClass: 'contact-us-dialog',
      width: mode === 'desktop' ? '500px' : undefined,  // Set width based on mode
      data: {
        incident: this.incident,
      },
    });
  }

  backToMap() {
    const navigateToMap = (longitude: number, latitude: number, queryParamKey: string) => {
      setTimeout(() => {
        this.router.navigate([ResourcesRoutes.ACTIVEWILDFIREMAP], {
          queryParams: {
            longitude,
            latitude,
            [queryParamKey]: true
          },
        });
      }, 100);
    };

    if (this.incident?.longitude && this.incident?.latitude) {
      navigateToMap(this.incident.longitude, this.incident.latitude, 'activeWildfires');
    }

    if (this.ban?.centroid?.y && this.ban?.centroid?.x) {
      navigateToMap(this.ban.centroid.x, this.ban.centroid.y, 'bansProhibitions');
    }

    if (this.areaRestriction?.centroid?.y && this.areaRestriction?.centroid?.x) {
      navigateToMap(this.areaRestriction.centroid.x, this.areaRestriction.centroid.y, 'areaRestriction');
    }

    if (this.evac?.centroid?.y && this.evac?.centroid?.x) {
      navigateToMap(this.evac.centroid.x, this.evac.centroid.y, 'evacuationAlert');
    }

    if (this.dangerRating?.centroid?.y && this.dangerRating?.centroid?.x) {
      navigateToMap(this.dangerRating.centroid.x, this.dangerRating.centroid.y, 'dangerRating');
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
      } else if (
        this.params['source'] === 'full-details'
      ) {
        if (this.params['sourceType'] === 'Alert' || this.params['sourceType'] === 'Order') {
          this.router.navigate([ResourcesRoutes.PUBLIC_EVENT], {
            queryParams: {
              eventType: this.params['sourceType'],
              eventNumber: this.params['eventNumber'],
              eventName: this.params['name'],
              source: [ResourcesRoutes.WILDFIRESLIST]
            },
          });
        }
      } else if (
        this.params['source'] === 'incidents'
      ) {
        this.router.navigate([ResourcesRoutes.PUBLIC_INCIDENT], {
          queryParams: {
            fireYear: this.params['fireYear'],
            incidentNumber: this.params['incidentNumber'],
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
    const twoColumnContent = document.getElementsByClassName('two-column-content-cards-container')[0];
    twoColumnContent.classList.add('print');

    const printContents =
      document.getElementsByClassName('page-container')[0].innerHTML;

    const appRoot = document.body.removeChild(
      document.getElementById('app-root'),
    );

    document.body.innerHTML = printContents;

    const canvas = document.getElementById('qr-code');
    toCanvas(canvas, window.location.href, (error) => {
      if (error) {
        console.error(error);
      }
      window.print();
      document.body.innerHTML = '';
      document.body.appendChild(appRoot);
      twoColumnContent.classList.remove('print');
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

  private createZoomIcon(btn: HTMLElement): void {
    const icon = L.DomUtil.create('div', '', btn);
    icon.style.width = '20px';
    icon.style.height = '20px';
    icon.style.maskImage = 'url("/assets/images/svg-icons/zoom-to-extent.svg")';
    icon.style.maskSize = 'contain';
    icon.style.maskRepeat = 'no-repeat';
    icon.style.maskPosition = 'center';
    icon.style.backgroundColor = 'black';
  }
}
