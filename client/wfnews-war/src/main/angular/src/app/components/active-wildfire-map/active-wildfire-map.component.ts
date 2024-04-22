import {
  AfterViewInit,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  ElementRef,
  Input,
  NgZone,
  OnInit,
  QueryList,
  ViewChild,
  ViewChildren,
} from '@angular/core';
import { UntypedFormControl } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { MatExpansionPanel } from '@angular/material/expansion';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ActivatedRoute, ParamMap, Router } from '@angular/router';
import { DialogLocationComponent } from '@app/components/report-of-fire/dialog-location/dialog-location.component';
import { App } from '@capacitor/app';
import { Preferences } from '@capacitor/preferences';
import { AppConfigService } from '@wf1/core-ui';
import * as L from 'leaflet';
import { debounceTime } from 'rxjs/operators';
import { CommonUtilityService } from '../../services/common-utility.service';
import { MapConfigService } from '../../services/map-config.service';
import { PublishedIncidentService } from '../../services/published-incident-service';
import { PlaceData } from '../../services/wfnews-map.service/place-data';
import {
  ResourcesRoutes,
  getActiveMap,
  isMobileView,
  isMobileView as mobileView,
  snowPlowHelper,
} from '../../utils';
import { SmkApi } from '../../utils/smk';
import {
  SearchResult,
  SearchPageComponent,
} from '../search/search-page.component';
import { Observable } from 'rxjs';
import {
  BreakpointObserver,
  BreakpointState,
  Breakpoints,
} from '@angular/cdk/layout';
import { AGOLService } from '@app/services/AGOL-service';
import { MatAutocompleteTrigger } from '@angular/material/autocomplete';
import { NotificationService } from '@app/services/notification.service';
import { CapacitorService } from '@app/services/capacitor-service';
import { PushNotification } from '@capacitor/push-notifications';
import { WildfireNotificationDialogComponent } from '@app/components/wildfire-notification-dialog/wildfire-notification-dialog.component';
import { PointIdService } from '@app/services/point-id.service';

export type SelectedLayer =
  | 'evacuation-orders-and-alerts'
  | 'area-restrictions'
  | 'bans-and-prohibitions'
  | 'smoke-forecast'
  | 'fire-danger'
  | 'local-authorities'
  | 'routes-impacted'
  | 'wildfire-stage-of-control'
  | 'out-fires'
  | 'all-layers';

declare const window: any;
@Component({
  selector: 'active-wildfire-map',
  templateUrl: './active-wildfire-map.component.html',
  styleUrls: ['./active-wildfire-map.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ActiveWildfireMapComponent implements OnInit, AfterViewInit {
  @Input() incidents: any;

  @ViewChild('WildfireStageOfControl')
  wildfireStageOfControlPanel: MatExpansionPanel;
  @ViewChild('EvacuationOrdersAndAlerts')
  evacuationOrdersAndAlertsPanel: MatExpansionPanel;
  @ViewChild('AreaRestrictions') areaRestrictionsPanel: MatExpansionPanel;
  @ViewChild('BansAndProhibitions') bansAndProhibitionsPanel: MatExpansionPanel;
  @ViewChild('SmokeForecast') smokeForecastPanel: MatExpansionPanel;
  @ViewChild('FireDanger') fireDangerPanel: MatExpansionPanel;
  @ViewChild('LocalAuthorities') localAuthoritiesPanel: MatExpansionPanel;
  @ViewChild('RoutesImpacted') routesImpactedPanel: MatExpansionPanel;

  @ViewChildren('locationOptions') locationOptions: QueryList<ElementRef>;
  @ViewChild(MatAutocompleteTrigger, { read: MatAutocompleteTrigger })
  inputAutoComplete: MatAutocompleteTrigger;

  incidentsServiceUrl: string;
  mapConfig = null;
  smkApi: SmkApi;
  activeFireCountPromise;
  selectedLayer: SelectedLayer;
  selectedPanel = 'wildfire-stage-of-control';
  showAccordion: boolean;
  searchText = undefined;
  zone: NgZone;
  resizeObserver: ResizeObserver;

  placeData: PlaceData;
  searchByLocationControl = new UntypedFormControl();
  public filteredOptions: SearchResult[] = [];
  SMK: any;
  leafletInstance: any;
  searchLocationsLayerGroup: any;
  markers: any[];
  url;
  sortedAddressList: string[];
  incidentRefs: any[];
  filteredWildfires: any[];
  filteredFirePerimeters: any[];
  filteredEvacs: any[];
  filteredAreaRestrictions: any[];
  filteredBansAndProhibitions: any[];
  filteredDangerRatings: any[];
  filteredRoadEvents: any[];
  filteredClosedRecreationSites: any[];
  filteredForestServiceRoads: any[];
  filteredProtectedLandsAccessRestrictions: any[];
  filteredRegionalDistricts: any[];
  filteredMunicipalities: any[];
  filteredFirstNationsTreatyLand: any[];
  filteredIndianReserve: any[];
  savedLocationlabelsToShow: any[] = [];
  savedLocationlabels: any[] = [];

  isLocationEnabled: boolean;
  public userLocation;
  isMapLoaded = false;
  isAllLayersOpen = false;
  isLegendOpen = false;
  refreshAllLayers = false;
  isDataSourcesOpen = false;
  notificationState = 0;
  wildfireYear: string;

  safeAreaInsetTopValue;
  safeAreaInsetBottomValue: string;

  public searchData: SearchResult;

  showPanel: boolean;
  useNearMe: boolean;

  wildfireLayerIds: string[] = [
    'active-wildfires-fire-of-note',
    'active-wildfires-out-of-control',
    'active-wildfires-holding',
    'active-wildfires-under-control',
    'active-wildfires-out',
  ];
  public isMobileView = mobileView;
  public snowPlowHelper = snowPlowHelper;

  public sliderButtonHold = false;
  public clickedMyLocation = false;

  private isExtraSmall: Observable<BreakpointState> =
    this.breakpointObserver.observe(Breakpoints.XSmall);

  constructor(
    protected appConfigService: AppConfigService,
    protected router: Router,
    protected activedRouter: ActivatedRoute,
    private appConfig: AppConfigService,
    private mapConfigService: MapConfigService,
    private publishedIncidentService: PublishedIncidentService,
    private commonUtilityService: CommonUtilityService,
    protected dialog: MatDialog,
    protected cdr: ChangeDetectorRef,
    protected snackbarService: MatSnackBar,
    private breakpointObserver: BreakpointObserver,
    private agolService: AGOLService,
    private notificationService: NotificationService,
    protected capacitorService: CapacitorService,
    protected pointIdService: PointIdService
  ) {
    this.incidentsServiceUrl = this.appConfig.getConfig().rest['newsLocal'];
    this.placeData = new PlaceData();
    this.markers = new Array();
    const self = this;

    this.searchByLocationControl.valueChanges
      .pipe(debounceTime(200))
      .subscribe((val: string) => {
        if (!val) {
          this.filteredOptions = [];
          self.searchLayerGroup.clearLayers();
          return;
        }

        if (val.length > 2 || this.clickedMyLocation) {
          this.filteredOptions = [];
          this.searchLayerGroup.clearLayers();
          if (!this.isMobileView()) {
            this.inputAutoComplete.openPanel();
          }
          // search addresses
          if (val.length > 2) {
            this.placeData.searchAddresses(val).then((results) => {
              if (results) {
                const sortedResults = this.commonUtilityService.sortAddressList(
                  results,
                  val,
                );
                for (const result of sortedResults) {
                  this.filteredOptions.push({
                    id: result.loc,
                    type: 'address',
                    title:
                      `${result.streetQualifier} ${result.civicNumber} ${result.streetName} ${result.streetType}`.trim() ||
                      result.localityName,
                    subtitle: result.localityName,
                    distance: '0',
                    relevance: /^\d/.test(val.trim()) ? 1 : 4,
                    location: result.loc,
                  });
                }
                this.filteredOptions.sort((a, b) =>
                  a.relevance > b.relevance
                    ? 1
                    : a.relevance < b.relevance
                      ? -1
                      : a.title.localeCompare(b.title),
                );
                this.pushTextMatchToFront(val);

                this.cdr.markForCheck();
              }
            });
          }
          // search incidents
          let searchFon = 0;
          while (searchFon < 2) {
            this.publishedIncidentService
              .fetchPublishedIncidentsList(
                1,
                50,
                this.clickedMyLocation && this?.userLocation?.coords
                  ? {
                      longitude: this.userLocation.coords.longitude,
                      latitude: this.userLocation.coords.latitude,
                      radius: 50,
                      searchText: null,
                      useUserLocation: false,
                    }
                  : null,
                this.clickedMyLocation ? null : val,
                Boolean(searchFon).valueOf(),
                ['OUT_CNTRL', 'HOLDING', 'UNDR_CNTRL'],
              )
              .toPromise()
              .then((incidents) => {
                if (incidents?.collection) {
                  for (const element of incidents.collection.filter(
                    (e) => e.stageOfControlCode !== 'OUT',
                  )) {
                    this.filteredOptions.push({
                      id: element.incidentNumberLabel,
                      type: 'incident',
                      title:
                        element.incidentName === element.incidentNumberLabel
                          ? element.incidentName
                          : `${element.incidentName} (${element.incidentNumberLabel})`,
                      subtitle: element.fireCentreName,
                      distance: '0',
                      relevance: /^\d/.test(val.trim()) ? 2 : 1,
                      location: [
                        Number(element.longitude),
                        Number(element.latitude),
                      ],
                    });
                  }
                  this.filteredOptions.sort((a, b) =>
                    a.relevance > b.relevance
                      ? 1
                      : a.relevance < b.relevance
                        ? -1
                        : a.title.localeCompare(b.title),
                  );
                  this.pushTextMatchToFront(val);
                  // what happens on mobile? Identify?
                  if (isMobileView()) {
                    this.identify(
                      [
                        this.userLocation.coords.longitude,
                        this.userLocation.coords.latitude,
                      ],
                      50000,
                    );
                  }
                  this.cdr.markForCheck();
                }
              });
            searchFon++;
          }

          // search evac orders
          let whereString = null;
          if (val?.length > 0) {
            whereString = `EVENT_NAME LIKE '%${val}%' OR ORDER_ALERT_STATUS LIKE '%${val}%' OR ISSUING_AGENCY LIKE '%${val}%'`;
          }
          this.agolService
            .getEvacOrders(
              this.clickedMyLocation ? null : whereString,
              this.clickedMyLocation && this?.userLocation?.coords
                ? {
                    x: this.userLocation?.coords?.longitude,
                    y: this.userLocation?.coords?.latitude,
                    radius: 50,
                  }
                : null,
              { returnCentroid: true, returnGeometry: false }
            )
            .toPromise()
            .then((evacs) => {
              if (evacs?.features) {
                for (const element of evacs.features) {
                  this.filteredOptions.push({
                    id: element.attributes.EMRG_OAA_SYSID,
                    type: (
                      element.attributes.ORDER_ALERT_STATUS as string
                    ).toLowerCase(),
                    title: element.attributes.EVENT_NAME,
                    subtitle: '', // Fire Centre would mean loading incident as well... evacs can cross centres
                    distance: '0',
                    relevance:
                      /^\d/.test(val.trim()) &&
                      (
                        element.attributes.ORDER_ALERT_STATUS as string
                      ).toLowerCase() === 'order'
                        ? 2
                        : /^\d/.test(val.trim()) &&
                            (
                              element.attributes.ORDER_ALERT_STATUS as string
                            ).toLowerCase() === 'alert'
                          ? 3
                          : /^\d/.test(val.trim()) === false &&
                              (
                                element.attributes.ORDER_ALERT_STATUS as string
                              ).toLowerCase() === 'order'
                            ? 2
                            : 3,
                    location: [element.centroid.x, element.centroid.y],
                  });
                }
                this.filteredOptions.sort((a, b) =>
                  a.relevance > b.relevance
                    ? 1
                    : a.relevance < b.relevance
                      ? -1
                      : a.title.localeCompare(b.title),
                );
                this.pushTextMatchToFront(val);
                this.cdr.markForCheck();
              }
            });
        }
      });

    App.addListener('resume', () => {
      this.updateLocationEnabledVariable();
    });
  }

  pushTextMatchToFront(val: string) {
    const matches: SearchResult[] = [];
    for (const result of this.filteredOptions) {
      if (
        result.type === 'address' &&
        result.title.toLowerCase().includes(val.toLowerCase())
      ) {
        matches.push(result);
        const index = this.filteredOptions.indexOf(result);
        if (index) {
          this.filteredOptions.splice(index, 1);
        }
      }
    }

    if (matches.length > 0) {
      this.filteredOptions = matches.concat(this.filteredOptions);
    }
  }

  async ngAfterViewInit() {
    this.locationOptions.changes.subscribe(() => {
      this.locationOptions.forEach((option: ElementRef) => {
        option.nativeElement.addEventListener(
          'mouseover',
          this.onLocationOptionOver.bind(this),
        );
        option.nativeElement.addEventListener(
          'mouseout',
          this.onLocationOptionOut.bind(this),
        );
      });
    });

    this.appConfig.configEmitter.subscribe((config) => {
      const mapConfig = [];

      this.mapConfigService
        .getMapConfig()
        .then((mapState) => {
          this.SMK = window['SMK'];
          mapConfig.push(mapState);
        })
        .then(() => {
          const deviceConfig = { viewer: { device: 'desktop' } };
          this.mapConfig = [...mapConfig, deviceConfig, 'theme=wf', '?'];
        });
    });
    this.activedRouter.queryParams.subscribe((params: ParamMap) => {
      if ((params && params['longitude'] && params['latitude']) || (params && params['featureType'])) {
        const long = Number(params['longitude']);
        const lat = Number(params['latitude']);

        // set timeout to load smk features to load
        setTimeout(async () => {
          let result = null;
          let fireIsOutOrNotFound = false;
          if (params['featureType'] === 'BCWS_ActiveFires_PublicView') {
            //wildfire notification
            try {
              const today = new Date();
              const fiscalYearStart = new Date(today.getFullYear(), 3, 1); // April 1st

              if (today < fiscalYearStart) {
                this.wildfireYear = (today.getFullYear() - 1).toString();
              } else {
                this.wildfireYear = today.getFullYear().toString();
              }

              result = await this.publishedIncidentService
                .fetchPublishedIncident(params['featureId'], this.wildfireYear)
                .toPromise();
              if (result?.stageOfControlCode === 'OUT') {
                fireIsOutOrNotFound = true;
                const dialogRef = this.dialog.open(
                  WildfireNotificationDialogComponent,
                  {
                    autoFocus: false,
                    width: '80vw',
                    data: {
                      title: 'This wildfire is Out',
                      text: 'The wildfire is extinguished. To find this wildfire on the map, turn on the \'Out Wildfires\' map layer.',
                    },
                  },
                );
                dialogRef.afterClosed().subscribe((action) => {
                  if (action['fullDetail']) {
                    this.router.navigate([ResourcesRoutes.PUBLIC_INCIDENT], {
                      queryParams: {
                        fireYear: result.fireYear,
                        incidentNumber: result.incidentNumberLabel,
                        source: [ResourcesRoutes.ACTIVEWILDFIREMAP],
                      },
                    });
                  }
                });
              } else {
                this.panToLocation(long, lat);
              }
            } catch (error) {
              fireIsOutOrNotFound = true;
              console.error('Error fetching published incident:', error);
              this.dialog.open(
                WildfireNotificationDialogComponent,
                {
                  autoFocus: false,
                  width: '80vw',
                  data: {
                    title: 'Wildfire not found',
                    text: 'The wildfire you\'re looking for may have been a duplicate or entered in error, and has now been removed.',
                    text2:
                      'For more information, contact fireinfo@gov.bc.ca or call 1 888 336-7378 (3FOREST)',
                  },
                },
              );
            }
          } else if ((params['areaRestriction'] && params['areaRestriction'] === "true") || 
              (params['evacuationAlert'] && params['evacuationAlert'] === "true") || 
              (params['activeWildfires'] && params['activeWildfires'] === "true")){
            this.panToLocation(long, lat, 12);
          } else if (params['bansProhibitions'] && params['bansProhibitions'] === "true"){
            this.panToLocation(long, lat, 6);
          } else {
            this.panToLocation(long, lat);
          } 

          // turn on layers
          if (params['featureType'] === 'British_Columbia_Area_Restrictions' || 
              (params['areaRestriction'] && params['areaRestriction'] === "true")) {
            this.onSelectLayer('area-restrictions');
          }

          if (
            params['featureType'] ===
            'British_Columbia_Bans_and_Prohibition_Areas' || 
              (params['bansProhibitions'] && params['bansProhibitions'] === "true")
          ) {
            this.onSelectLayer('bans-and-prohibitions');
          }

          if (params['featureType'] === 'Evacuation_Orders_and_Alerts' || 
              (params['evacuationAlert'] && params['evacuationAlert'] === "true")) {
            this.onSelectLayer('evacuation-orders-and-alerts');
          }

          if (params['featureType'] === 'BCWS_ActiveFires_PublicView' || 
              (params['activeWildfires'] && params['activeWildfires'] === "true")) {
            this.onSelectLayer('wildfire-stage-of-control');
          }

          // identify
          setTimeout(() => {
            if (long && lat) {
              if (!fireIsOutOrNotFound) {
                this.showPanel = true;
                if (result) {
                  let id = null;
                  if (result.fireOfNoteInd) {
                    id = 'active-wildfires-fire-of-note';
                  } else {
                    if (result.stageOfControlCode === 'OUT_CNTRL') {
                      id = 'active-wildfires-out-of-control';
                    } else if (result.stageOfControlCode === 'HOLDING') {
                      id = 'active-wildfires-holding';
                    } else if (result.stageOfControlCode === 'UNDR_CNTRL') {
                      id = 'active-wildfires-under-control';
                    }
                  }
                  this.incidentRefs = [
                    {
                      notification: true,
                      geometry: {
                        coordinates: [long, lat],
                      },
                      layerId: id,
                      properties: {
                        fire_year: result.fireYear,
                        incident_name: result.incidentName,
                        incident_number_label: result.incidentNumberLabel,
                      },
                      title: result.incidentName,
                      type: 'Feature',
                      _identifyPoint: {
                        latitude: Number(result.latitude),
                        longitude: Number(result.longitude),
                      },
                    },
                  ];
                  this.cdr.detectChanges();
                }
                // this.mapConfigService.getMapConfig().then(() => {
                //   this.identify([long, lat])
                // })
              }
            }
          }, 2000);
        }, 1000);
      }
    });
  }

  panToLocation(long, lat, zoom?) {
    this.mapConfigService.getMapConfig().then(() => {
      getActiveMap().$viewer.panToFeature(
        window['turf'].point([long, lat]), 
          zoom ? zoom : null);
    });
  }

  ngOnInit() {
    this.url =
      this.appConfigService.getConfig().application.baseUrl.toString() +
      this.router.url.slice(1);
    this.snowPlowHelper(this.url);
    this.showAccordion = true;
    this.updateLocationEnabledVariable();
  }

  getFullAddress(location) {
    let result = '';

    if (location.civicNumber) {
      result += location.civicNumber;
    }

    if (location.streetName) {
      result += ' ' + location.streetName;
    }

    if (location.streetQualifier) {
      result += ' ' + location.streetQualifier;
    }

    if (location.streetType) {
      result += ' ' + location.streetType;
    }

    return result;
  }

  get leaflet() {
    if (!this.leafletInstance) {
this.leafletInstance = window['L'];
}
    return this.leafletInstance;
  }

  get searchLayerGroup() {
    if (!this.searchLocationsLayerGroup) {
this.searchLocationsLayerGroup = this.leaflet
        .layerGroup()
        .addTo(getActiveMap(this.SMK).$viewer.map);
}
    return this.searchLocationsLayerGroup;
  }

  onLocationOptionOver(event) {
    const long = window.jQuery(event.currentTarget).data('loc-long');
    const lat = window.jQuery(event.currentTarget).data('loc-lat');

    this.removeMarker([lat, long]);

    if (!long || !lat) {
return;
}

    const largerIcon = {
      iconSize: [40, 38],
      shadowAnchor: [4, 62],
      popupAnchor: [1, -34],
      shadowSize: [41, 41],
    };

    this.highlight({ location: [long, lat] }, largerIcon);
  }

  addMarker(long: number, lat: number) {
    this.removeMarker([lat, long]);

    if (!long || !lat) {
return;
}

    const largerIcon = {
      iconSize: [40, 38],
      shadowAnchor: [4, 62],
      popupAnchor: [1, -34],
      shadowSize: [41, 41],
    };

    this.highlight({ location: [long, lat] }, largerIcon);
  }

  onLocationOptionOut(event) {
    const long = window.jQuery(event.currentTarget).data('loc-long');
    const lat = window.jQuery(event.currentTarget).data('loc-lat');

    this.removeMarker([lat, long]);

    if (!long || !lat) {
return;
}

    this.highlight({ location: [long, lat] });
  }

  highlight(place, iconSettings?) {
    if (!iconSettings) {
      iconSettings = {
        iconSize: [20, 19],
        iconAnchor: [10, 9],
        shadowAnchor: [4, 62],
        popupAnchor: [-3, -76],
        shadowSize: [21, 21],
      };
    }

    const self = this;
    const geojsonFeature = {
      type: 'Feature',
      geometry: {
        type: 'Point',
        coordinates: place.location,
      },
    };

    const starIcon = this.leaflet.icon({
      iconUrl:
        'data:image/svg+xml,%3Csvg version=\'1.1\' id=\'Capa_1\' xmlns=\'http://www.w3.org/2000/svg\' xmlns:xlink=\'http://www.w3.org/1999/xlink\' x=\'0px\' y=\'0px\' viewBox=\'0 0 55.867 55.867\' xml:space=\'preserve\'%3E%3Cpath d=\'M55.818,21.578c-0.118-0.362-0.431-0.626-0.808-0.681L36.92,18.268L28.83,1.876c-0.168-0.342-0.516-0.558-0.896-0.558 s-0.729,0.216-0.896,0.558l-8.091,16.393l-18.09,2.629c-0.377,0.055-0.689,0.318-0.808,0.681c-0.117,0.361-0.02,0.759,0.253,1.024 l13.091,12.76l-3.091,18.018c-0.064,0.375,0.09,0.754,0.397,0.978c0.309,0.226,0.718,0.255,1.053,0.076l16.182-8.506l16.18,8.506 c0.146,0.077,0.307,0.115,0.466,0.115c0.207,0,0.413-0.064,0.588-0.191c0.308-0.224,0.462-0.603,0.397-0.978l-3.09-18.017 l13.091-12.761C55.838,22.336,55.936,21.939,55.818,21.578z\' fill=\'%23FCBA19\'/%3E%3C/svg%3E%0A',
      iconSize: iconSettings.iconSize,
      iconAnchor: iconSettings.iconAnchor,
      shadowAnchor: iconSettings.shadowAnchor,
      popupAnchor: iconSettings.popupAnchor,
      shadowSize: iconSettings.shadowSize,
    });

    this.leaflet
      .geoJson(geojsonFeature, {
        pointToLayer(feature, latlng) {
          const marker = self.leaflet.marker(latlng, { icon: starIcon });
          self.markers[self.serializeLatLng(latlng)] = marker;
          return marker;
        },
      })
      .addTo(self.searchLayerGroup);
  }

  serializeLatLng(latLng) {
    const latRounded = Math.round((latLng['lat'] + Number.EPSILON) * 100) / 100;
    const longRounded = Math.round((latLng['lng'] + Number.EPSILON) * 100) / 100;

    const latLongRounded = {
      latRounded,
      longRounded,
    };

    return JSON.stringify(latLongRounded);
  }

  removeMarker(latLng) {
    const self = this;
    this.searchLayerGroup.clearLayers();

    this.filteredOptions.forEach((result) => {
      const first = this.serializeLatLng({ lat: latLng[0], lng: latLng[1] });
      const second = this.serializeLatLng({
        lat: result.location[0],
        lng: result.location[1],
      });
      if (first !== second) {
        self.highlight(result);
      }
    });
  }

  onLocationSelected(selectedOption) {
    this.snowPlowHelper(this.url, {
      action: 'location_search',
      text: selectedOption.address,
    });
    const self = this;
    self.searchLayerGroup.clearLayers();
    const locationControlValue = selectedOption.title;
    this.searchByLocationControl.setValue(locationControlValue.trim(), {
      onlySelf: true,
      emitEvent: false,
    });
    this.highlight(selectedOption);
    getActiveMap(this.SMK).$viewer.panToFeature(
      window['turf'].point(selectedOption.location),
      12,
    );
    if (selectedOption.type !== 'address') {
      setTimeout(() => {
        this.identify(selectedOption.location);
      }, 1000);
    }
  }

  clearSearchLocationControl() {
    this.searchByLocationControl.reset();
    this.isLocationEnabled = false;
    this.clearMyLocation();
  }

  initMap(smk: any) {
    this.smkApi = new SmkApi(smk);
    this.initializeLayers();
  }

  onToggleAccordion() {
    this.showAccordion = !this.showAccordion;
  }

async onSelectIncidents(incidentRefs) {
  this.showPanel = true;
  let tempIncidentRefs = Object.keys(incidentRefs).map((key) => incidentRefs[key]);

  if (this.useNearMe && getActiveMap().$viewer.displayContext.layers.itemId['weather-stations'] && getActiveMap().$viewer.displayContext.layers.itemId['weather-stations'][0].isVisible) {
    try {
      const station = await this.pointIdService.fetchNearestWeatherStation(this.userLocation?.coords.latitude, this.userLocation?.coords.longitude);
      for (const hours of station.hourly) {
        if (hours.temp !== null) {
          station.validHour = hours;
          break;
        }
      }
      let weatherStation = {
        type: 'Feature',
        layerId: 'weather-stations',
        title: station.stationName,
        properties: 'weather-stations',
        data: station,
        geometry: {
          type: 'Point',
          coordinates: [station.longitude, station.latitude],
        },
      };
      tempIncidentRefs.push(weatherStation);
    } catch (error) {
      console.error('Error fetching weather station:', error);
      // Handle error appropriately
    }
    this.useNearMe = false;
  }
  this.incidentRefs = tempIncidentRefs;

  // Ensure this logic executes after incidentRefs is updated
  if (this.incidentRefs.length && this.incidentRefs[0]._identifyPoint) {
    this.panToLocation(
      this.incidentRefs[0]._identifyPoint.longitude,
      this.incidentRefs[0]._identifyPoint.latitude
    );
  }
}

  async initializeLayers() {
    const selectedLayer = await Preferences.get({ key: 'selectedLayer' });
    this.selectedLayer =
      (selectedLayer.value as SelectedLayer) || 'wildfire-stage-of-control';
    this.onSelectLayer(this.selectedLayer);
    this.isMapLoaded = true;
    this.notificationService
      .getUserNotificationPreferences()
      .then((response) => {
        const SMK = window['SMK'];
        const map = getActiveMap(SMK).$viewer.map;

        if (!response.notifications) {
          return;
        }

        map.on('zoomend', () => {
          this.updateSavedLocationLabelVisibility();
        });

        this.resizeObserver = new ResizeObserver(() => {
          map.invalidateSize();
        });

        this.resizeObserver.observe(map._container);

        for (const smkMap in SMK.MAP) {
          if (Object.hasOwn(SMK.MAP, smkMap)) {
            const savedLocationMarker = {
              icon: L.icon({
                iconUrl:
                  '/assets/images/svg-icons/blue-white-location-icon.svg',
                iconSize: [32, 32],
                iconAnchor: [16, 32],
                popupAnchor: [0, -32],
              }),
              draggable: false,
            };
            for (const item of response.notifications) {
              L.marker(
                [item.point.coordinates[1], item.point.coordinates[0]],
                savedLocationMarker,
              ).addTo(getActiveMap(this.SMK).$viewer.map);
              const label = L.marker(
                [item.point.coordinates[1], item.point.coordinates[0]],
                {
                  icon: L.divIcon({
                    className: 'marker-label',
                    html: `<div class="custom-marker"
                  style="margin-top: -20px; margin-left: 25px; height: 1.2em; text-wrap: nowrap; display:flex; align-items: center; justify-content: left; text-align: center; color: #000; font-family: 'BCSans', 'Open Sans', Verdana, Arial, sans-serif; font-size: 16px; font-style: normal; font-weight: 600;">
                  ${item.notificationName}
                </div>`,
                  }),
                },
              );
              label.addTo(getActiveMap(this.SMK).$viewer.map);
              this.savedLocationlabels.push(label);
              this.savedLocationlabelsToShow.push(label);
            }
          }
        }
        map.invalidateSize();
      })
      .catch((error) => {
        console.error(error);
      });
    this.cdr.detectChanges();
  }

  private updateSavedLocationLabelVisibility() {
    // showing the savedLocation label only start with zoom level 5
    const map = getActiveMap(this.SMK).$viewer.map;
    const currentZoom = map.getZoom();
    if (currentZoom < 5) {
      this.removeAllSavedLocationLabels();
    } else {
      this.addAllSavedLocationLabels();
    }
  }

  private removeAllSavedLocationLabels() {
    const map = getActiveMap(this.SMK).$viewer.map;

    // Iterate over the array of markers and remove them from the map
    for (const label of this.savedLocationlabelsToShow) {
      map.removeLayer(label);
    }
    this.savedLocationlabelsToShow = [];
  }

  private addAllSavedLocationLabels() {
    const map = getActiveMap(this.SMK).$viewer.map;
    if (this.savedLocationlabelsToShow?.length === 0) {
      for (const label of this.savedLocationlabels) {
        label.addTo(map);
        this.savedLocationlabelsToShow.push(label);
      }
    }
  }

  onSelectLayer(selectedLayer: SelectedLayer) {
    
    this.selectedLayer = selectedLayer;
    this.selectedPanel = this.selectedLayer;

    this.snowPlowHelper(this.url, {
      action: 'feature_layer_navigation',
      text: this.selectedLayer,
    });

    this.snowPlowHelper(this.url, {
      action: 'map_layer_selection',
      text: this.selectedLayer,
    });

    Preferences.set({
      key: 'selectedLayer',
      value: this.selectedLayer,
    });

    const layers = [
      /* 00 */ { itemId: 'active-wildfires', visible: true }, // Always on
      /* 01 */ { itemId: 'evacuation-orders-and-alerts-wms', visible: false },
      /* 02 */ {
        itemId: 'evacuation-orders-and-alerts-wms-highlight',
        visible: false,
      },
      /* 03 */ { itemId: 'danger-rating', visible: false },
      /* 04 */ { itemId: 'bans-and-prohibitions', visible: false },
      /* 05 */ { itemId: 'bans-and-prohibitions-highlight', visible: false },
      /* 06 */ { itemId: 'area-restrictions', visible: false },
      /* 07 */ { itemId: 'area-restrictions-highlight', visible: false },
      /* 08 */ { itemId: 'fire-perimeters', visible: true }, // Always on
      /* 09 */ { itemId: 'active-wildfires-out', visible: false },
      /* 10 */ { itemId: 'closed-recreation-sites', visible: false },
      /* 11 */ { itemId: 'drive-bc-active-events', visible: false },
      /* 12 */ { itemId: 'bc-fire-centres', visible: true }, // Always on
      /* 13 */ { itemId: 'prescribed-fire', visible: false }, // Currently, we don't display this, but we keep it for consistency in indexing.
      /* 14 */ { itemId: 'hourly-currentforecast-firesmoke', visible: false },
      /* 15 */ { itemId: 'clab-indian-reserves', visible: false },
      /* 16 */ { itemId: 'fnt-treaty-land', visible: false },
      /* 17 */ { itemId: 'abms-municipalities', visible: false },
      /* 18 */ { itemId: 'abms-regional-districts', visible: false },
      /* 19 */ { itemId: 'bans-and-prohibitions-cat1', visible: false },
      /* 20 */ { itemId: 'bans-and-prohibitions-cat2', visible: false },
      /* 21 */ { itemId: 'bans-and-prohibitions-cat3', visible: false },
      /* 22 */ { itemId: 'active-wildfires-fire-of-note', visible: true }, // Always on
      /* 23 */ { itemId: 'active-wildfires-out-of-control', visible: true }, // Always on
      /* 24 */ { itemId: 'active-wildfires-holding', visible: true }, // Always on
      /* 25 */ { itemId: 'active-wildfires-under-control', visible: true }, // Always on
      /* 26 */ { itemId: 'bc-fire-centres-labels', visible: true }, // Always on

      // Not in a feature but need to be cleared
      { itemId: 'bc-fsr', visible: false },
      { itemId: 'current-conditions--default', visible: false },
      { itemId: 'precipitation', visible: false },
      { itemId: 'protected-lands-access-restrictions', visible: false },
      { itemId: 'radar-1km-rrai--radarurpprecipr14-linear', visible: false },
      { itemId: 'weather-stations', visible: true },
    ];

    switch (this.selectedLayer) {
      case 'evacuation-orders-and-alerts':
        layers[1].visible = true;
        layers[2].visible = true;
        break;

      case 'area-restrictions':
        layers[6].visible = true;
        // gives a 404 error from SMK
        // layers[7].visible = true;
        break;

      case 'bans-and-prohibitions':
        layers[5].visible = true;
        layers[19].visible = true;
        layers[20].visible = true;
        layers[21].visible = true;
        break;

      case 'smoke-forecast':
        layers[14].visible = true;
        break;

      case 'fire-danger':
        layers[0].visible = true;
        layers[3].visible = true;
        break;

      case 'local-authorities':
        layers[15].visible = true;
        layers[16].visible = true;
        layers[17].visible = true;
        layers[18].visible = true;
        break;

      case 'routes-impacted':
        layers[11].visible = true;
        break;

      case 'out-fires':
        layers[9].visible = true;
        break;

      case 'all-layers':
        break;

      default:
        layers[0].visible = true;
        layers[22].visible = true;
        layers[23].visible = true;
        layers[24].visible = true;
        layers[25].visible = true;
    }

    // initialize smkApi if undefined
    if (!this.smkApi) {
      let event: Event;
      this.initMap(event);
    }

    this.smkApi.setDisplayContextItemsVisible(...layers);
    this.refreshAllLayers = true;
  }

  async useMyCurrentLocation() {
    this.snowPlowHelper(this.url, {
      action: 'near_me_map_click'
    });
    if (isMobileView){
      this.useNearMe = true;
    }
    this.clickedMyLocation = true;
    this.snowPlowHelper(this.url, {
      action: 'find_my_location',
    });

    this.commonUtilityService.checkLocationServiceStatus().then((enabled) => {
      if (!enabled) {
        const dialogRef = this.dialog.open(DialogLocationComponent, {
          autoFocus: false,
          width: '80vw',
        });
      }
      this.isLocationEnabled = enabled;
    });
    this.searchText = undefined;
    try {
      this.userLocation =
        await this.commonUtilityService.getCurrentLocationPromise();
      const long = this.userLocation.coords.longitude;
      const lat = this.userLocation.coords.latitude;
      if (lat && long) {
        this.showAreaHighlight([long, lat], 50);
        this.showLocationMarker({
          type: 'Point',
          coordinates: [long, lat],
        });
      }
      this.searchByLocationControl.setValue(lat + ',' + long);
    } catch (error) {
      if (this.isLocationEnabled) {
        this.snackbarService.open(
          'Awaiting location information from device. Please try again momentarily.',
          '',
          {
            duration: 5000,
          },
        );
      }
    }
  }

  async updateLocationEnabledVariable() {
    this.isLocationEnabled =
      await this.commonUtilityService.checkLocationServiceStatus();
    this.cdr.detectChanges();
  }

  showAreaHighlight(center, radius) {
    const circle = window.turf.circle(center, radius, {
      steps: 40,
      units: 'kilometers',
    });
    this.smkApi.showFeature('near-me-highlight3x', circle);
    this.smkApi.panToFeature(circle, 10);
  }

  showLocationMarker(point) {
    this.smkApi.showFeature('my-location', point, {
      pointToLayer(geojson, latLong) {
        return L.marker(latLong, {
          icon: L.divIcon({
            className: 'wfone-my-location',
            html: '<i class="material-icons">my_location</i>',
            iconSize: [24, 24],
          }),
        });
      },
    });
  }

  clearMyLocation() {
    this.smkApi.showFeature('near-me-highlight3x');
    this.smkApi.showFeature('my-location');
    this.clickedMyLocation = false;
    this.useNearMe = false;
  }

  searchTextUpdated() {
    // will need to call News API to fetch the results
  }

  @ViewChild('grabber') grabber: ElementRef;
  @ViewChild('resizeBox') resizeBox: ElementRef;

  get grabberElement(): HTMLElement {
    return this.grabber.nativeElement;
  }

  get resizeBoxElement(): HTMLElement {
    return this.resizeBox.nativeElement;
  }

  private lastPointerPosition = 0;
  dragMove(event) {
    this.resizeBoxElement.style.height = `${
      window.innerHeight - event.pointerPosition.y + 20
    }px`;
    this.lastPointerPosition = event.pointerPosition.y;
    if (this.lastTranslate) {
      this.resizeBoxElement.style.transform = this.lastTranslate;
      this.lastTranslate = undefined;
      this.resizeBoxElement.style.top = '80vh';
      this.resizeBoxElement.style.borderRadius = '20px';
      this.resizeBoxElement.style.borderBottomRightRadius = '0px';
      this.resizeBoxElement.style.borderBottomLeftRadius = '0px';
    }
  }

  private lastTranslate = undefined;
  dragDropped(event) {
    if (event.dropPoint.y < 65) {
      this.lastTranslate = this.resizeBoxElement.style.transform;
      this.resizeBoxElement.style.transform = 'none';
      this.resizeBoxElement.style.top = '50px';
      this.resizeBoxElement.style.borderRadius = '0px';
    } else if (event.dropPoint.y > window.innerHeight - 50) {
      this.lastTranslate = this.resizeBoxElement.style.transform;
      this.resizeBoxElement.style.height = '50px';
      this.resizeBoxElement.style.transform = 'none';
      this.resizeBoxElement.style.top = window.innerHeight - 50 + 'px';
    }
    this.resizeBoxElement.style.height = `${
      window.innerHeight - this.lastPointerPosition + 20
    }px`;
  }

  isChecked(layer: SelectedLayer) {
    return this.selectedLayer === layer;
  }

  setupScrollForLayersComponent() {
    const scroller = document.querySelector('.layer-buttons');
    scroller.addEventListener(
      'wheel',
      (e: WheelEvent) => {
        scroller.scrollLeft += e.deltaY;
      },
      { passive: true },
    );
  }

  openAllLayers() {
    this.snowPlowHelper(this.url, {
      action: 'all_layers_map_click'
    });
    this.isAllLayersOpen = !this.isAllLayersOpen;
    this.isLegendOpen = false;
  }

  handleLayerChange() {
    this.selectedLayer = 'all-layers';
    this.selectedPanel = 'all-layers';
  }

  handleDrawerVisibilityChange(isVisible: boolean) {
    if (!isVisible) {
      this.isDataSourcesOpen = false;
    }
  }

  showLegend() {
    this.isLegendOpen = !this.isLegendOpen;
    this.isAllLayersOpen = false;
  }

  openSearchPage() {
    this.snowPlowHelper(this.url, {
      action: 'search_map_click'
    });
    const dialogRef = this.dialog.open(SearchPageComponent, {
      width: '450px',
      height: '650px',
      maxWidth: '100vw',
      maxHeight: '100dvh',
      data: this.searchData,
    });

    const smallDialogSubscription = this.isExtraSmall.subscribe((size) => {
      if (size.matches) {
        dialogRef.updateSize('100%', '100%');
      } else {
        dialogRef.updateSize('450px', '650px');
      }
    });

    dialogRef.afterClosed().subscribe((result: SearchResult | boolean) => {
      smallDialogSubscription.unsubscribe();
      this.searchLayerGroup.clearLayers();
      this.searchLayerGroup.clearLayers();
      this.searchLayerGroup.clearLayers();
      if ((result as boolean) !== false) {
        this.searchData = result as SearchResult;
        // we have a selected result returned. Zoom to the provided lat long
        // identify if it's a feature, show a marker for addresses
        this.mapConfigService.getMapConfig().then(() => {
          getActiveMap().$viewer.panToFeature(
            window['turf'].point([
              this.searchData.location[0],
              this.searchData.location[1],
            ]),
            10,
          );

          if (this.searchData.type !== 'address') {
            // if we have an evac order or alert, turn on that layer
            if (
              ['order', 'alert'].includes(this.searchData.type.toLowerCase())
            ) {
              this.onSelectLayer('evacuation-orders-and-alerts');
            }

            this.identify(this.searchData.location);
          } else {
            this.addMarker(
              this.searchData.location[0],
              this.searchData.location[1],
            );
          }
        });
        // then add to the most recent search list
        let recentSearches: SearchResult[] = [];
        if (localStorage.getItem('recent-search') != null) {
          try {
            recentSearches = JSON.parse(
              localStorage.getItem('recent-search'),
            ) as SearchResult[];
          } catch (err) {
            console.error(err);
            // carry on with the empty array
          }
        }

        recentSearches.unshift(this.searchData);
        if (recentSearches.length > 4) {
          recentSearches = recentSearches.slice(0, 4);
        }
        localStorage.setItem('recent-search', JSON.stringify(recentSearches));
      } else {
        this.searchData = null;
      }
    });
  }

  identify(location: number[], buffer: number = 1) {
    const turf = window['turf'];
    const point = turf.point(location);
    const buffered = turf.buffer(point, buffer, { units: 'meters' });
    const bbox = turf.bbox(buffered);
    const poly = turf.bboxPolygon(bbox);
    /*
    let dialogRef = this.dialog.open(WildfireNotificationDialogComponent, {
      autoFocus: false,
      width: '80vw',
      data: {
        title: "TEST PURPOSE",
        text: JSON.stringify(turf) +' | ' + JSON.stringify(point) + ' | ' + JSON.stringify(buffer) + ' | ' + bbox + ' | ' + JSON.stringify(poly),
        text2: location[1] + ' | ' + location[0]
      }
    });
*/

    getActiveMap().$viewer.identifyFeatures(
      {
        map: { latitude: Number(location[1]), longitude: Number(location[0]) },
        screen: { x: window.innerWidth / 2, y: window.innerHeight / 2 },
      },
      poly,
    );
  }

  slideLayerButtons(slide: number) {
    const layerButtons = document.getElementById('layer-buttons');
    const mapContainer = document.getElementById('map-container');
    if (layerButtons && mapContainer && this.sliderButtonHold) {
      layerButtons.scrollLeft += slide;
    }

    if (this.sliderButtonHold) {
      setTimeout(() => this.slideLayerButtons(slide), 100);
    }
  }

  showLeftLayerScroller(): boolean {
    const layerButtons = document.getElementById('layer-buttons');
    return layerButtons?.scrollLeft > 0;
  }

  showRightLayerScroller(): boolean {
    const layerButtons = document.getElementById('layer-buttons');
    const mapContainer = document.getElementById('map-container');
    return (
      layerButtons?.scrollLeft <
      layerButtons.scrollWidth - mapContainer.scrollWidth
    );
  }

  onPushNotificationClick() {
    const n =
      this.testNotifications[
        this.notificationState % this.testNotifications.length
      ];
    this.notificationState += 1;
    this.capacitorService.handleLocationPushNotification(n);
  }

  testNotifications = [
    makeLocation({
      latitude: 48.461763, // uvic fire
      longitude: -123.31067,
      radius: 20,
      featureId: 'V65425', //FIRE_NUMBER
      featureType: 'BCWS_ActiveFires_PublicView',
      fireYear: 2023,
    }),
    makeLocation({
      latitude: 48.507955, // OUT - beaver lake
      longitude: -123.393515,
      radius: 20,
      featureId: 'V60164', //FIRE_NUMBER
      featureType: 'BCWS_ActiveFires_PublicView',
      fireYear: 2022,
    }),
    makeLocation({
      latitude: 48.463259, // uvic
      longitude: -123.312635,
      radius: 20,
      featureId: 'V65055', //FIRE_NUMBER
      featureType: 'BCWS_ActiveFires_PublicView',
      fireYear: 2022,
    }),
  ];
}

function makeLocation(loc): PushNotification {
  return {
    title: `Near Me Notification for [${loc.featureId}]`,
    // subtitle?: string;
    body: `There is a new active fire [${loc.featureId}] within your saved location, tap here to view the current situation`,
    id: '1',
    // badge?: number;
    // notification?: any;
    data: {
      type: 'location',
      coords: `[ ${loc.latitude}, ${loc.longitude} ]`,
      radius: '' + loc.radius,
      messageID: loc.featureId,
      topicKey: loc.featureType,
    },
    // click_action?: string;
    // link?: string;
  };
}
