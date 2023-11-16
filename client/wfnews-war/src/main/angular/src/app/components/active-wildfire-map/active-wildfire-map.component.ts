import { AfterViewInit, ChangeDetectionStrategy, ChangeDetectorRef, Component, ElementRef, Input, NgZone, OnInit, QueryList, ViewChild, ViewChildren } from '@angular/core';
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
import { isMobileView as mobileView, snowPlowHelper } from '../../utils';
import { SmkApi } from '../../utils/smk';
import { SearchResult, SearchPageComponent } from '../search/search-page.component';
import { Observable } from 'rxjs';
import { BreakpointObserver, BreakpointState, Breakpoints } from '@angular/cdk/layout';
import { AGOLService } from '@app/services/AGOL-service';
import { MatAutocompleteTrigger } from '@angular/material/autocomplete';


export type SelectedLayer =
  'evacuation-orders-and-alerts' |
  'area-restrictions' |
  'bans-and-prohibitions' |
  'smoke-forecast' |
  'fire-danger' |
  'local-authorities' |
  'routes-impacted' |
  'wildfire-stage-of-control' |
  'out-fires' |
  'all-layers';

declare const window: any;
@Component({
  selector: 'active-wildfire-map',
  templateUrl: './active-wildfire-map.component.html',
  styleUrls: ['./active-wildfire-map.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ActiveWildfireMapComponent implements OnInit, AfterViewInit {
  @Input() incidents: any;

  @ViewChild('WildfireStageOfControl') wildfireStageOfControlPanel: MatExpansionPanel;
  @ViewChild('EvacuationOrdersAndAlerts') evacuationOrdersAndAlertsPanel: MatExpansionPanel;
  @ViewChild('AreaRestrictions') areaRestrictionsPanel: MatExpansionPanel;
  @ViewChild('BansAndProhibitions') bansAndProhibitionsPanel: MatExpansionPanel;
  @ViewChild('SmokeForecast') smokeForecastPanel: MatExpansionPanel;
  @ViewChild('FireDanger') fireDangerPanel: MatExpansionPanel;
  @ViewChild('LocalAuthorities') localAuthoritiesPanel: MatExpansionPanel;
  @ViewChild('RoutesImpacted') routesImpactedPanel: MatExpansionPanel;

  @ViewChildren("locationOptions") locationOptions: QueryList<ElementRef>;
  @ViewChild(MatAutocompleteTrigger, {read: MatAutocompleteTrigger}) inputAutoComplete: MatAutocompleteTrigger;

  incidentsServiceUrl: string;
  mapConfig = null;
  smkApi: SmkApi;
  activeFireCountPromise;
  selectedLayer: SelectedLayer;
  selectedPanel = 'wildfire-stage-of-control';
  showAccordion: boolean;
  searchText = undefined;
  zone: NgZone;

  placeData: PlaceData;
  searchByLocationControl = new UntypedFormControl();
  public filteredOptions: SearchResult[] = []
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

  isLocationEnabled: boolean;
  public userLocation;
  isMapLoaded = false;
  isAllLayersOpen = false;
  isLegendOpen = false;
  refreshAllLayers = false;
  isDataSourcesOpen = false;

  public searchData: SearchResult

  showPanel: boolean;

  wildfireLayerIds: string[] = [
    'active-wildfires-fire-of-note',
    'active-wildfires-out-of-control',
    'active-wildfires-holding',
    'active-wildfires-under-control',
    'active-wildfires-out',
  ];
  public isMobileView = mobileView
  public snowPlowHelper = snowPlowHelper

  public sliderButtonHold = false
  public clickedMyLocation = false

  private isExtraSmall: Observable<BreakpointState> = this.breakpointObserver.observe(Breakpoints.XSmall);

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
    private agolService: AGOLService
  ) {
    this.incidentsServiceUrl = this.appConfig.getConfig().rest['newsLocal'];
    this.placeData = new PlaceData();
    this.markers = new Array();
    let self = this;

    this.searchByLocationControl.valueChanges.pipe(debounceTime(200)).subscribe((val: string) => {
      if (!val) {
        this.filteredOptions = [];
        self.searchLayerGroup.clearLayers();
        return;
      }

      if (val.length > 2 || this.isLocationEnabled) {
        this.filteredOptions = [];
        this.searchLayerGroup.clearLayers();
        if(!this.isMobileView) this.inputAutoComplete.openPanel();
        // search addresses
        this.placeData.searchAddresses(val).then((results) => {
          if (results) {
            const sortedResults = this.commonUtilityService.sortAddressList(results, val);
            for (const result of sortedResults) {
              this.filteredOptions.push({
                id: result.loc,
                type: 'address',
                title: `${result.streetQualifier} ${result.civicNumber} ${result.streetName} ${result.streetType}`.trim() || result.localityName,
                subtitle: result.localityName,
                distance: '0',
                relevance: /^\d/.test(val.trim()) ? 4 : 1,
                location: result.loc
              })
            }
            this.filteredOptions.sort((a, b) => a.relevance > b.relevance ? 1 : a.relevance < b.relevance ? -1 : 0 || a.title.localeCompare(b.title))
            this.cdr.markForCheck()
          }
        });
        // search incidents
        let searchFon = 0;
        while (searchFon < 2) {
          this.publishedIncidentService.fetchPublishedIncidentsList(1, 50, this.isLocationEnabled ? { longitude: this.userLocation.coords.longitude, latitude: this.userLocation.coords.latitude, radius: 50, searchText: null, useUserLocation: false } : null, this.isLocationEnabled ? null : val, Boolean(searchFon).valueOf()).toPromise().then(incidents => {
            if (incidents && incidents.collection) {
              for (const element of incidents.collection) {
                this.filteredOptions.push({
                  id: element.incidentNumberLabel,
                  type: 'incident',
                  title: element.incidentName === element.incidentNumberLabel ? element.incidentName : `${element.incidentName} (${element.incidentNumberLabel})`,
                  subtitle: element.fireCentreName,
                  distance: '0',
                  relevance: /^\d/.test(val.trim()) ? 3 : 4,
                  location: [Number(element.longitude), Number(element.latitude)]
                })
              }
              this.filteredOptions.sort((a, b) => a.relevance > b.relevance ? 1 : a.relevance < b.relevance ? -1 : 0 || a.title.localeCompare(b.title))
              this.cdr.markForCheck()

              console.log(this.filteredOptions)
            }
          })
          searchFon++;
        }

        // search evac orders
        this.agolService.getEvacOrders(this.isLocationEnabled ? null : val, this.isLocationEnabled ? { x: this.userLocation.coords.longitude, y: this.userLocation.coords.latitude, radius: 50 } : null, { returnCentroid: false, returnGeometry: false}).toPromise().then(evacs => {
          if (evacs && evacs.features) {
            for (const element of evacs.features) {
              this.filteredOptions.push({
                id: element.attributes.EMRG_OAA_SYSID,
                type: (element.attributes.ORDER_ALERT_STATUS as string).toLowerCase(),
                title: element.attributes.EVENT_NAME,
                subtitle: '', // Fire Centre would mean loading incident as well... evacs can cross centres
                distance: '0',
                relevance: /^\d/.test(this.searchText.trim()) && (element.attributes.ORDER_ALERT_STATUS as string).toLowerCase() === 'Order' ? 2
                        : /^\d/.test(this.searchText.trim()) && (element.attributes.ORDER_ALERT_STATUS as string).toLowerCase() === 'Alert' ? 1
                        : /^\d/.test(this.searchText.trim()) === false && (element.attributes.ORDER_ALERT_STATUS as string).toLowerCase() === 'Order' ? 3
                        : 2,
                location: [element.centroid.y, element.centroid.x]
              })
            }
            this.filteredOptions.sort((a, b) => a.relevance > b.relevance ? 1 : a.relevance < b.relevance ? -1 : 0 || a.title.localeCompare(b.title))
            this.cdr.markForCheck()
          }
        })
      }
    });

    App.addListener('resume', () => {
      this.updateLocationEnabledVariable();
    });
  }

  async ngAfterViewInit() {
    this.locationOptions.changes.subscribe(() => {
      this.locationOptions.forEach((option: ElementRef) => {
        option.nativeElement.addEventListener('mouseover', this.onLocationOptionOver.bind(this));
        option.nativeElement.addEventListener('mouseout', this.onLocationOptionOut.bind(this));
      });
    });

    this.appConfig.configEmitter.subscribe((config) => {
      const mapConfig = [];

      this.mapConfigService.getMapConfig()
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
      if (params && params['longitude'] && params['latitude']) {
        const long = Number(params['longitude']);
        const lat = Number(params['latitude']);
        // set timeout to load smk features to load
        setTimeout(() => {
          const pan = this.panToLocation(long, lat);
          // turn on layers
          if (params['areaRestriction']) this.onSelectLayer('area-restrictions')
          if (params['bans']) this.onSelectLayer('bans-and-prohibitions')
          if (params['evac']) this.onSelectLayer('evacuation-orders-and-alerts')
          if (params['wildfires']) this.onSelectLayer('wildfire-stage-of-control')
          // identify
          setTimeout(() => {
            if (params['identify']) {
              this.identify([long, lat])
            }
          }, 2000)
        }, 1000)
      }});
    }

  panToLocation(long, lat, noZoom?) {
    this.mapConfigService.getMapConfig().then(() => {
      const SMK = window['SMK'];
      let viewer = null;
      for (const smkMap in SMK.MAP) {
        if (Object.prototype.hasOwnProperty.call(SMK.MAP, smkMap)) {
          viewer = SMK.MAP[smkMap].$viewer;
        }
      }
      viewer.panToFeature(window['turf'].point([long, lat]), noZoom? null:12)
    });
  }

  ngOnInit() {
    this.url = this.appConfigService.getConfig().application.baseUrl.toString() + this.router.url.slice(1)
    this.snowPlowHelper(this.url)
    this.showAccordion = true;
    this.updateLocationEnabledVariable();
  }

  getFullAddress(location) {
    let result = "";

    if (location.civicNumber) {
      result += location.civicNumber
    }

    if (location.streetName) {
      result += " " + location.streetName
    }

    if (location.streetQualifier) {
      result += " " + location.streetQualifier
    }

    if (location.streetType) {
      result += " " + location.streetType
    }

    return result;
  }

  get leaflet() {
    if (!this.leafletInstance) this.leafletInstance = window['L'];
    return this.leafletInstance;
  }

  get searchLayerGroup() {
    if (!this.searchLocationsLayerGroup) this.searchLocationsLayerGroup = this.leaflet.layerGroup().addTo(this.SMK.MAP[1].$viewer.map);
    return this.searchLocationsLayerGroup;
  }

  onLocationOptionOver(event) {
    let long = window.jQuery(event.currentTarget).data("loc-long");
    let lat = window.jQuery(event.currentTarget).data("loc-lat");

    this.removeMarker([lat, long]);

    if (!long || !lat) return;

    let largerIcon = {
      iconSize: [40, 38],
      shadowAnchor: [4, 62],
      popupAnchor: [1, -34],
      shadowSize: [41, 41]
    };

    this.highlight({ location: [long, lat] }, largerIcon);
  }

  onLocationOptionOut(event) {
    let long = window.jQuery(event.currentTarget).data("loc-long");
    let lat = window.jQuery(event.currentTarget).data("loc-lat");

    this.removeMarker([lat, long]);

    if (!long || !lat) return;

    this.highlight({ location: [long, lat] });
  }

  highlight(place, iconSettings?) {

    if (!iconSettings) {
      iconSettings = {
        iconSize: [20, 19],
        iconAnchor: [10, 9],
        shadowAnchor: [4, 62],
        popupAnchor: [-3, -76],
        shadowSize: [21, 21]
      }
    }

    const self = this;
    const geojsonFeature = {
      "type": "Feature",
      "geometry": {
        "type": "Point",
        "coordinates": place.location
      }
    };

    const starIcon = this.leaflet.icon({
      iconUrl: "data:image/svg+xml,%3Csvg version='1.1' id='Capa_1' xmlns='http://www.w3.org/2000/svg' xmlns:xlink='http://www.w3.org/1999/xlink' x='0px' y='0px' viewBox='0 0 55.867 55.867' xml:space='preserve'%3E%3Cpath d='M55.818,21.578c-0.118-0.362-0.431-0.626-0.808-0.681L36.92,18.268L28.83,1.876c-0.168-0.342-0.516-0.558-0.896-0.558 s-0.729,0.216-0.896,0.558l-8.091,16.393l-18.09,2.629c-0.377,0.055-0.689,0.318-0.808,0.681c-0.117,0.361-0.02,0.759,0.253,1.024 l13.091,12.76l-3.091,18.018c-0.064,0.375,0.09,0.754,0.397,0.978c0.309,0.226,0.718,0.255,1.053,0.076l16.182-8.506l16.18,8.506 c0.146,0.077,0.307,0.115,0.466,0.115c0.207,0,0.413-0.064,0.588-0.191c0.308-0.224,0.462-0.603,0.397-0.978l-3.09-18.017 l13.091-12.761C55.838,22.336,55.936,21.939,55.818,21.578z' fill='%23FCBA19'/%3E%3C/svg%3E%0A",
      iconSize: iconSettings.iconSize,
      iconAnchor: iconSettings.iconAnchor,
      shadowAnchor: iconSettings.shadowAnchor,
      popupAnchor: iconSettings.popupAnchor,
      shadowSize: iconSettings.shadowSize,
    });

    this.leaflet.geoJson(geojsonFeature, {
      pointToLayer: function (feature, latlng) {
        let marker = self.leaflet.marker(latlng, { icon: starIcon });
        self.markers[self.serializeLatLng(latlng)] = marker;
        return marker;
      }
    }).addTo(self.searchLayerGroup);
  }

  serializeLatLng(latLng) {
    let latRounded = Math.round((latLng['lat'] + Number.EPSILON) * 100) / 100;
    let longRounded = Math.round((latLng['lng'] + Number.EPSILON) * 100) / 100;

    let latLongRounded = {
      latRounded, longRounded
    };

    return JSON.stringify(latLongRounded);
  }

  removeMarker(latLng) {
    const self = this;
    this.searchLayerGroup.clearLayers();

    this.filteredOptions.forEach((result) => {
      const first = this.serializeLatLng({ lat: latLng[0], lng: latLng[1] });
      const second = this.serializeLatLng({ lat: result.location[0], lng: result.location[1] });
      if (first != second) {
        self.highlight(result);
      }
    });
  }

  onLocationSelected(selectedOption) {
    this.snowPlowHelper(this.url, {
      action: 'location_search',
      text: selectedOption.address
    })
    const self = this;
    self.searchLayerGroup.clearLayers();
    let locationControlValue = selectedOption.title;
    this.searchByLocationControl.setValue(locationControlValue.trim(), { onlySelf: true, emitEvent: false });
    this.highlight(selectedOption);
    this.SMK.MAP[1].$viewer.panToFeature(window['turf'].point(selectedOption.location), 12);
    if (selectedOption.type !== 'address') {
      setTimeout(() => {
        console.log('IDENTIFY', selectedOption)
        this.identify(selectedOption.location)
      }, 1000)
    }
  }

  clearSearchLocationControl() {
    this.searchByLocationControl.reset();
    this.isLocationEnabled = false;
    this.clearMyLocation()
  }

  initMap(smk: any) {
    this.smkApi = new SmkApi(smk);
    this.initializeLayers();
  }

  onToggleAccordion() {
    this.showAccordion = !this.showAccordion;
  }

  onSelectIncidents(incidentRefs){
    this.showPanel = true;
    this.incidentRefs = Object.keys(incidentRefs).map(key => incidentRefs[key]);
    if (this.incidentRefs[0] && this.incidentRefs[0]._identifyPoint) {
      this.panToLocation(this.incidentRefs[0]._identifyPoint.longitude, this.incidentRefs[0]._identifyPoint.latitude,true)
    }
  }

  async initializeLayers() {
    const selectedLayer = await Preferences.get({ key: 'selectedLayer' });
    this.selectedLayer = selectedLayer.value as SelectedLayer || 'wildfire-stage-of-control';
    this.onSelectLayer(this.selectedLayer);
    this.isMapLoaded = true;
    this.cdr.detectChanges();
  }

  onSelectLayer(selectedLayer: SelectedLayer) {
    this.selectedLayer = selectedLayer;
    this.selectedPanel = this.selectedLayer;

    this.snowPlowHelper(this.url, {
      action: 'feature_layer_navigation',
      text: this.selectedLayer
    });

    Preferences.set({
      key: 'selectedLayer',
      value: this.selectedLayer
    });

    const layers = [
      /* 00 */ { itemId: 'active-wildfires', visible: true }, // Always on
      /* 01 */ { itemId: 'evacuation-orders-and-alerts-wms', visible: false },
      /* 02 */ { itemId: 'evacuation-orders-and-alerts-wms-highlight', visible: false },
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
      /* 13 */ { itemId: 'prescribed-fire', visible: false },
      /* 14 */ { itemId: 'hourly-currentforecast-firesmoke', visible: false },
      /* 15 */ { itemId: 'clab-indian-reserves', visible: false },
      /* 16 */ { itemId: 'fnt-treaty-land', visible: false },
      /* 17 */ { itemId: 'abms-municipalities', visible: false },
      /* 18 */ { itemId: 'abms-regional-districts', visible: false },
      /* 19 */ { itemId: 'bans-and-prohibitions-cat1', visible: false },
      /* 20 */ { itemId: 'bans-and-prohibitions-cat2', visible: false },
      /* 21 */ { itemId: 'bans-and-prohibitions-cat3', visible: false },

      // Not in a feature but need to be cleared
      { itemId: 'bc-fsr', visible: false },
      { itemId: 'current-conditions--default', visible: false },
      { itemId: 'precipitation', visible: false },
      { itemId: 'protected-lands-access-restrictions', visible: false },
      { itemId: 'radar-1km-rrai--radarurpprecipr14-linear', visible: false },
      { itemId: 'weather-stations', visible: false },
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
    }

    // initialize smkApi if undefined
    if (!this.smkApi) {
      let event: Event;
      this.initMap(event)
    }

    this.smkApi.setDisplayContextItemsVisible(...layers);
    this.refreshAllLayers = true;
  }

  async useMyCurrentLocation() {
    this.clickedMyLocation = true;
    this.snowPlowHelper(this.url, {
      action: 'find_my_location'
    })

    this.commonUtilityService.checkLocationServiceStatus().then((enabled) => {
      if (!enabled) {
        let dialogRef = this.dialog.open(DialogLocationComponent, {
          autoFocus: false,
          width: '80vw',
        });
      }
      this.isLocationEnabled = enabled;
    });
    this.searchText = undefined;
    try {
      this.userLocation = await this.commonUtilityService.getCurrentLocationPromise();
      const long = this.userLocation.coords.longitude;
      const lat = this.userLocation.coords.latitude;
      if (lat && long) {
        this.showAreaHighlight([long, lat], 50);
        this.showLocationMarker({
          type: 'Point',
          coordinates: [long, lat]
        });
      }
      this.searchByLocationControl.setValue(lat + ',' + long);
    } catch (error) {
      if (this.isLocationEnabled) {
        this.snackbarService.open('Awaiting location information from device. Please try again momentarily.', '', {
          duration: 5000,
        });
      }
    }
  }

  async updateLocationEnabledVariable() {
    this.isLocationEnabled = await this.commonUtilityService.checkLocationServiceStatus();
    this.cdr.detectChanges();
  }

  showAreaHighlight(center, radius) {
    const circle = window.turf.circle(center, radius, { steps: 40, units: 'kilometers' });
    this.smkApi.showFeature('near-me-highlight3x', circle);
    this.smkApi.panToFeature(circle, 10)
  }

  showLocationMarker(point) {
    this.smkApi.showFeature('my-location', point, {
      pointToLayer: function (geojson, latLong) {
        return L.marker(latLong, {
          icon: L.divIcon({
            className: 'wfone-my-location',
            html: '<i class="material-icons">my_location</i>',
            iconSize: [24, 24]
          })
        })
      }
    })
  }

  clearMyLocation() {
    this.smkApi.showFeature('near-me-highlight3x');
    this.smkApi.showFeature('my-location')
    this.clickedMyLocation = false
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

  private lastPointerPosition = 0
  dragMove(event) {
    this.resizeBoxElement.style.height = `${window.innerHeight - event.pointerPosition.y + 20}px`
    this.lastPointerPosition = event.pointerPosition.y
    if (this.lastTranslate) {
      this.resizeBoxElement.style.transform = this.lastTranslate
      this.lastTranslate = undefined
      this.resizeBoxElement.style.top = '80vh'
      this.resizeBoxElement.style.borderRadius = '20px'
      this.resizeBoxElement.style.borderBottomRightRadius = '0px'
      this.resizeBoxElement.style.borderBottomLeftRadius = '0px'
    }
  }

  private lastTranslate = undefined
  dragDropped(event) {
    if (event.dropPoint.y < 65) {
      this.lastTranslate = this.resizeBoxElement.style.transform
      this.resizeBoxElement.style.transform = 'none'
      this.resizeBoxElement.style.top = '50px'
      this.resizeBoxElement.style.borderRadius = '0px'
    } else if (event.dropPoint.y > window.innerHeight - 50) {
      this.lastTranslate = this.resizeBoxElement.style.transform
      this.resizeBoxElement.style.height = '50px'
      this.resizeBoxElement.style.transform = 'none'
      this.resizeBoxElement.style.top = window.innerHeight - 50 + 'px'
    }
    this.resizeBoxElement.style.height = `${window.innerHeight - this.lastPointerPosition + 20}px`
  }

  isChecked(layer: SelectedLayer) {
    return this.selectedLayer === layer;
  }

  setupScrollForLayersComponent() {
    const scroller = document.querySelector('.layer-buttons');
    scroller.addEventListener('wheel', (e: WheelEvent) => {
      scroller.scrollLeft += e.deltaY;
    }, { passive: true });
  }

  openAllLayers() {
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

  showLegend () {
    this.isLegendOpen = !this.isLegendOpen;
    this.isAllLayersOpen = false;
  }

  openSearchPage () {
    const dialogRef = this.dialog.open(SearchPageComponent, {
      width: '450px',
      height: '650px',
      maxWidth: '100vw',
      maxHeight: '100vh',
      data: this.searchData
    });

    const smallDialogSubscription = this.isExtraSmall.subscribe(size => {
      if (size.matches) {
        dialogRef.updateSize('100%', '100%');
      } else {
        dialogRef.updateSize('450px', '650px');
      }
    });

    dialogRef.afterClosed().subscribe((result: SearchResult | boolean) => {
      smallDialogSubscription.unsubscribe();
      if ((result as boolean) !== false) {
        this.searchData = result as SearchResult
        // we have a selected result returned. Zoom to the provided lat long
        // trigger identify? Turn on layers?
        this.mapConfigService.getMapConfig().then(() => {
          const SMK = window['SMK']
          for (const smkMap in SMK.MAP) {
            if (Object.hasOwn(SMK.MAP, smkMap)) {
              SMK.MAP[smkMap].$viewer.panToFeature(window['turf'].point([this.searchData.location[0], this.searchData.location[1]]), 10)

              if (this.searchData.type !== 'address') {
                this.identify(this.searchData.location)
              }
              break
            }
          }
        })
        // then add to the most recent search list
        let recentSearches: SearchResult[] = []
        if (localStorage.getItem('recent-search') != null) {
          try {
            recentSearches = JSON.parse(localStorage.getItem('recent-search')) as SearchResult[]
          } catch (err) {
            console.error(err)
            // carry on with the empty array
          }
        }

        recentSearches.unshift(this.searchData)
        if (recentSearches.length > 4) {
          recentSearches = recentSearches.slice(0, 4)
        }
        localStorage.setItem('recent-search', JSON.stringify(recentSearches))
      } else {
        this.searchData = null
      }
    });
  }

  identify (location: number[]) {
    const SMK = window['SMK']
    const turf = window['turf']
    const point = turf.point(location)
    const buffered = turf.buffer(point, 1, { units:'meters' })
    const bbox = turf.bbox(buffered)
    const poly = turf.bboxPolygon(bbox)

    for (const smkMap in SMK.MAP) {
      if (Object.hasOwn(SMK.MAP, smkMap)) {
        SMK.MAP[smkMap].$viewer.identifyFeatures({ map: { latitude: Number(location[1]), longitude: Number(location[0])}, screen: {x: window.innerWidth / 2, y: window.innerHeight / 2}}, poly)
        break
      }
    }
  }

  slideLayerButtons (slide: number) {
    const layerButtons = document.getElementById('layer-buttons')
    const mapContainer = document.getElementById('map-container')
    if (layerButtons && mapContainer && this.sliderButtonHold) {
      layerButtons.scrollLeft += slide
    }

    if (this.sliderButtonHold) {
      setTimeout(() => this.slideLayerButtons(slide), 100)
    }
  }

  showLeftLayerScroller (): boolean {
    const layerButtons = document.getElementById('layer-buttons')
    return layerButtons?.scrollLeft > 0
  }

  showRightLayerScroller (): boolean {
    const layerButtons = document.getElementById('layer-buttons')
    const mapContainer = document.getElementById('map-container')
    return layerButtons?.scrollLeft < (layerButtons.scrollWidth - mapContainer.scrollWidth)
  }
}
