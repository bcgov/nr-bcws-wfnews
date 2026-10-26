/* eslint-disable @typescript-eslint/naming-convention */
/* eslint-disable object-shorthand */
import {
  EVACUATION_DRAWING_INFO,
  FIRE_PERIMETER_DRAWING_INFO,
} from '@app/services/map-config.service/layers/evacuation-orders-and-alerts-wms.config';
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
import { Meta } from '@angular/platform-browser';
import { ActivatedRoute, ParamMap, Router } from '@angular/router';
import { LocationData } from '@app/components/wildfires-list-header/filter-by-location/filter-by-location-dialog.component';
import { AGOLService } from '@app/services/AGOL-service';
import { CommonUtilityService } from '@app/services/common-utility.service';
import { PublishedIncidentService } from '@app/services/published-incident-service';
import { MapConfigService } from '@app/services/map-config.service';
import { boundsToExtent, drawNearbyIncidents, extentToParam, fireOfNote, stageDot } from '@app/utils/preview-map';
import { pingMarker } from '@app/utils/map-markers';
import { AppConfigService } from '@wf1/core-ui';
import * as moment from 'moment';
import { toCanvas } from 'qrcode';
import { EvacOrderOption } from '../../../conversion/models';
import { WatchlistService } from '../../../services/watchlist-service';
import {
  convertFireNumber,
  convertToDateYear,
  convertToFireCentreDescription,
  getStageOfControlLabel,
  isMobileView,
  ResourcesRoutes,
} from '../../../utils';
import { ContactUsDialogComponent } from '../../admin-incident-form/contact-us-dialog/contact-us-dialog.component';
import * as turf from '@turf/turf';

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
  convertToDateYear = convertToDateYear;
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

  mapConfig = null;
  private map: any;
  private mapLocation: number[];
  private banExtent: number[];

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
    private metaService: Meta,
    private mapConfigService: MapConfigService,

  ) {
    /* Empty, just here for injection */
  }

  @HostListener('window:resize', ['$event'])
  onResize(event) {
    this.map?.resize();
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
    this.metaService.updateTag({ property: 'og:title', content: `${this.incident?.incidentName}` });
    this.metaService.updateTag({ property: 'og:description', content: `${this.incident?.incidentName}` });

  }

  ngAfterViewInit(): void {
    this.initializeMap();
  }

  /**
   * The map is one preview config plus markers, as the full-details panels are.
   * Each branch works out where to look and which layers say why.
   */
  async initializeMap() {
    const external = this.appConfigService.getConfig()['externalAppConfig'];
    const databcUrl = this.appConfigService
      .getConfig()['mapServices']['openmapsBaseUrl'].toString();

    let location: number[];
    let layers: any[] = [];

    if (this.incident) {
      location = [Number(this.incident.latitude), Number(this.incident.longitude)];
      layers = this.incidentLayers(external);
    } else if (this.evac) {
      location = [Number(this.evac.centroid?.y), Number(this.evac.centroid?.x)];
      layers = this.incidentLayers(external);
      const response = await this.agolService
        .getEvacOrdersById(this.params['id'], { returnGeometry: true })
        .toPromise();

      if (response?.features?.length > 0 && response?.features[0].geometry?.rings?.length > 0) {
        const matchingFeature = response.features.find(
          (feature) => feature.attributes.EVENT_NUMBER === this.params['eventNumber'],
        );
        const polygonData = this.commonUtilityService.extractPolygonData(matchingFeature.geometry.rings);
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
      layers = [
        {
          type: 'wms',
          id: 'restricted-areas',
          title: 'Area Restrictions',
          serviceUrl: databcUrl,
          layerName: 'WHSE_LAND_AND_NATURAL_RESOURCE.PROT_RESTRICTED_AREAS_SP',
          version: '1.1.1',
          opacity: 0.8,
          isVisible: true,
        },
      ];
    } else if (this.ban) {
      this.banCategories.isCat1 =
        this.ban.attributes.ACCESS_PROHIBITION_DESCRIPTION.includes('1') ||
        this.ban.attributes.ACCESS_PROHIBITION_DESCRIPTION.toLowerCase().includes('campfires');
      this.banCategories.isCat2 = this.ban.attributes.ACCESS_PROHIBITION_DESCRIPTION.includes('2');
      this.banCategories.isCat3 = this.ban.attributes.ACCESS_PROHIBITION_DESCRIPTION.includes('3');
      location = [Number(this.ban.centroid?.y), Number(this.ban.centroid?.x)];
      const polygonData = this.commonUtilityService.extractPolygonData(this.ban.geometry?.rings);
      if (polygonData?.length) {
        this.bounds = this.commonUtilityService.getPolygonBond(polygonData);
      }
      layers = await this.banLayers(databcUrl);
    } else if (this.dangerRating) {
      location = [
        Number(this.dangerRating.centroid?.y),
        Number(this.dangerRating.centroid?.x),
      ];
      const polygonData = this.commonUtilityService.extractPolygonData(this.dangerRating.geometry?.rings);
      if (polygonData?.length) {
        this.bounds = this.commonUtilityService.getPolygonBond(polygonData);
      }
      layers = [
        {
          type: 'wms',
          id: 'danger-rating',
          title: 'Danger Rating',
          serviceUrl: databcUrl,
          layerName: 'WHSE_LAND_AND_NATURAL_RESOURCE.PROT_DANGER_RATING_SP',
          styleName: '7734',
          version: '1.1.1',
          opacity: 0.8,
          isVisible: true,
        },
      ];
    }

    if (!location) {
      return;
    }
    this.mapLocation = location;

    this.mapConfig = await this.mapConfigService.getPreviewMapConfig({
      baseMap: 'navigation',
      extent: this.viewExtent(),
      center: [location[1], location[0]],
      zoom: 9,
      pan: false,
      zoomControl: !this.isMobileView(),
      layers,
    });
    this.cdr.detectChanges();
  }

  /** The extent the map opens at, and the one reset-view returns to. */
  private viewExtent(): number[] | undefined {
    if (this.banExtent) {
      return this.banExtent;
    }
    if (this.extent) {
      return [this.extent.xmin, this.extent.ymin, this.extent.xmax, this.extent.ymax];
    }
    return boundsToExtent(this.bounds);
  }

  private incidentLayers(external: any) {
    return [
      {
        type: 'esri-feature',
        id: 'agol-perimeters',
        title: 'Fire perimeters',
        serviceUrl: external['AGOLperimetres'].toString(),
        isVisible: true,
        drawingInfo: FIRE_PERIMETER_DRAWING_INFO,
      },
      {
        type: 'esri-feature',
        id: 'agol-evac-orders',
        title: 'Evacuation Orders and Alerts',
        serviceUrl: external['AGOLevacOrders'].toString(),
        isVisible: true,
        // esri-feature takes drawingInfo; it has no style option.
        drawingInfo: EVACUATION_DRAWING_INFO,
      },
    ];
  }

  /** One WMS layer for each category the ban holds, each with its own SLD. */
  private async banLayers(databcUrl: string) {
    const [cat1sld, cat2sld, cat3sld, extent] = await Promise.all([
      this.http.get('assets/js/smk/bans-cat1.sld', { responseType: 'text' }).toPromise(),
      this.http.get('assets/js/smk/bans-cat2.sld', { responseType: 'text' }).toPromise(),
      this.http.get('assets/js/smk/bans-cat3.sld', { responseType: 'text' }).toPromise(),
      this.agolService
        .getBansAndProhibitionsById(this.params['eventNumber'], {
          returnGeometry: false,
          returnCentroid: false,
          returnExtent: true,
        })
        .toPromise(),
    ]);

    if (extent?.extent) {
      this.banExtent = [
        extent.extent.xmin, extent.extent.ymin,
        extent.extent.xmax, extent.extent.ymax,
      ];
    }

    const category = (id: string, sldBody: string, where: string) => ({
      type: 'wms',
      id,
      title: id,
      serviceUrl: databcUrl,
      layerName: 'WHSE_LAND_AND_NATURAL_RESOURCE.PROT_BANS_AND_PROHIBITIONS_SP',
      version: '1.1.1',
      sld: sldBody,
      where,
      opacity: 0.5,
      isVisible: true,
    });

    const layers = [];
    if (this.banCategories.isCat3) {
      layers.push(category('bans-cat3', cat3sld, "ACCESS_PROHIBITION_DESCRIPTION LIKE '%Category 3%'"));
    }
    if (this.banCategories.isCat2) {
      layers.push(category('bans-cat2', cat2sld, "ACCESS_PROHIBITION_DESCRIPTION LIKE '%Category 2%'"));
    }
    if (this.banCategories.isCat1) {
      layers.push(category('bans-cat1', cat1sld,
        "ACCESS_PROHIBITION_DESCRIPTION LIKE '%Category 1%' OR ACCESS_PROHIBITION_DESCRIPTION LIKE '%Campfire%'"));
    }
    return layers;
  }

  initMap(smk: any) {
    this.map = smk.$viewer.map;

    if (this.incident && this.mapLocation) {
      const [lat, lon] = this.mapLocation;
      smk.showFeature('this-incident', turf.point([lon, lat]), {
        htmlMarker: () =>
          pingMarker(
            this.incident.fireOfNoteInd
              ? fireOfNote(35)
              : stageDot(this.incident.stageOfControlCode, 32),
          ),
      });
      this.addSurroundingIncidents(smk);
    }

    this.cdr.detectChanges();
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
      'dddd, MMMM D, YYYY [at] h:mm:ss a',
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

  openShareWindow(evac: string | null) {
    const incidentType = evac ? `Evacuation ${this.evac.attributes.ORDER_ALERT_STATUS}` : 'Wildfire';
    const name = evac ? `Evacuation ${this.evac.attributes.ORDER_ALERT_STATUS} for ${this.evac.attributes.EVENT_NAME}`
      : this.incident?.incidentName;
    this.commonUtilityService.openShareWindow(incidentType, name);
  }



  backToMap() {
    const zoom = this.params?.['zoom'];

    const navigateToMap = (longitude: number, latitude: number, queryParamKey: string) => {
      setTimeout(() => {
        this.router.navigate([ResourcesRoutes.ACTIVEWILDFIREMAP], {
          queryParams: {
            longitude,
            latitude,
            [queryParamKey]: true,
            zoom
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

  private get source(): string {
    const source = this.params?.['source'];
    return Array.isArray(source) ? source[0] : source;
  }

  back() {
    if (this.params && this.source) {
      if (this.source === 'map') {
        this.backToMap();
      } else if (
        this.source === 'full-details' &&
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
        this.source === 'saved-location' &&
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
        this.source === 'full-details'
      ) {
        if (this.params['sourceType'] === 'Alert' || this.params['sourceType'] === 'Order') {
          this.router.navigate([ResourcesRoutes.PUBLIC_EVENT], {
            queryParams: {
              eventType: this.params['sourceType'],
              eventNumber: this.params['eventNumber'],
              id: this.params['sourceEventId'],
              eventName: this.params['name'],
              source: [ResourcesRoutes.WILDFIRESLIST]
            },
          });
        } else if (this.params['sourceType'] === 'area-restriction') {
          this.router.navigate([ResourcesRoutes.PUBLIC_EVENT], {
            queryParams: {
              eventType: 'area-restriction',
              eventName: this.params['sourceName'],
              source: [ResourcesRoutes.WILDFIRESLIST]
            },
          });
        }
      } else if (
        this.source === 'incidents'
      ) {
        this.router.navigate([ResourcesRoutes.PUBLIC_INCIDENT], {
          queryParams: {
            fireYear: this.params['fireYear'],
            incidentNumber: this.params['incidentNumber'],
          },
        });
      } else {
        this.router.navigate([this.source]);
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

  async addSurroundingIncidents(smk: any) {
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
      // This incident has its own larger marker; a nearby dot on top made a target.
      drawNearbyIncidents(
        smk,
        (incidents?.collection || []).filter(
          (i) => i.incidentNumberLabel !== this.incident.incidentNumberLabel,
        ),
      );
    } catch (err) {
      console.error(
        'Could not retrieve surrounding incidents for area restriction',
      );
    }
  }

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
          extent: extentToParam(boundsToExtent(this.bounds)),
        },
      });
    }, 200);
  }

  shareMobile() {
    this.commonUtilityService.shareMobile(this.incident.incidentName);
  }
}
