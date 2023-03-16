import { AfterViewInit, Component, ElementRef, Input, NgZone, OnInit, QueryList, ViewChild, ViewChildren } from '@angular/core';
import { FormControl } from '@angular/forms';
import { MatExpansionPanel } from '@angular/material/expansion';
import { AppConfigService } from '@wf1/core-ui';
import { AGOLService } from '../../services/AGOL-service';
import { CommonUtilityService } from '../../services/common-utility.service';
import { MapConfigService } from '../../services/map-config.service';
import { PlaceData } from '../../services/wfnews-map.service/place-data';
import { SmkApi } from '../../utils/smk';
import * as L from 'leaflet';
import { debounceTime } from 'rxjs/operators';
import { isMobileView as mobileView, snowPlowHelper } from '../../utils';
import { ActivatedRoute, ParamMap, Router } from '@angular/router';
import { PublishedIncidentService } from '../../services/published-incident-service';


export type SelectedLayer =
  'evacuation-orders-and-alerts' |
  'area-restrictions' |
  'bans-and-prohibitions' |
  'smoke-forecast' |
  'fire-danger' |
  'local-authorities' |
  'routes-impacted' |
  'wildfire-stage-of-control';

declare const window: any;
@Component({
  selector: 'active-wildfire-map',
  templateUrl: './active-wildfire-map.component.html',
  styleUrls: ['./active-wildfire-map.component.scss'],
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

  incidentsServiceUrl: string;
  mapConfig = null;
  smkApi: SmkApi;
  activeFireCountPromise;
  selectedLayer: SelectedLayer;
  selectedPanel = 'wildfire-stage-of-control'
  showAccordion: boolean;
  searchText = undefined;
  zone: NgZone;

  placeData: PlaceData;
  searchByLocationControl = new FormControl();
  filteredOptions: any[];
  SMK: any;
  leafletInstance: any;
  searchLocationsLayerGroup: any;
  markers: any[];
  url;

  public isMobileView = mobileView
  public snowPlowHelper = snowPlowHelper

  constructor(
    protected appConfigService: AppConfigService,
    protected router: Router,
    protected activedRouter: ActivatedRoute,
    private appConfig: AppConfigService,
    private mapConfigService: MapConfigService,
    private agolService: AGOLService,
    private publishedIncidentService: PublishedIncidentService,
    private commonUtilityService: CommonUtilityService,
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

      if (val.length > 2) {
        this.filteredOptions = [];
        self.searchLayerGroup.clearLayers();

        this.placeData.searchAddresses(val).then(function (results) {
          if (results) {
            results.forEach((result) => {
              let address = self.getFullAddress(result);
              result.address = address.trim();
              self.highlight(result);
            });

            self.filteredOptions = results;
          }
        });
      }
    });
  }

  ngAfterViewInit() {
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
        this.mapConfigService.getMapConfig().then(() => {
          const SMK = window['SMK'];
          let viewer = null;
          for (const smkMap in SMK.MAP) {
            if (Object.prototype.hasOwnProperty.call(SMK.MAP, smkMap)) {
              viewer = SMK.MAP[smkMap].$viewer;
            }
          }
          viewer.panToFeature(window['turf'].point([long, lat]), 15)
        })
      }
    })
  }

  ngOnInit() {
    this.url = this.appConfigService.getConfig().application.baseUrl.toString() + this.router.url.slice(1)
    this.snowPlowHelper(this.url)
    this.showAccordion = true;
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

    this.highlight({ loc: [lat, long] }, largerIcon);
  }

  onLocationOptionOut(event) {
    let long = window.jQuery(event.currentTarget).data("loc-long");
    let lat = window.jQuery(event.currentTarget).data("loc-lat");

    this.removeMarker([lat, long]);

    if (!long || !lat) return;

    this.highlight({ loc: [lat, long] });
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
        "coordinates": place.loc
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
        // [0] [-123.5082451, 48.4207067]
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
      const second = this.serializeLatLng({ lat: result.loc[0], lng: result.loc[1] });
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
    let locationControlValue = selectedOption.address ? selectedOption.address : selectedOption.localityName;
    this.searchByLocationControl.setValue(locationControlValue.trim(), { onlySelf: true, emitEvent: false });
    this.highlight(selectedOption);
    this.SMK.MAP[1].$viewer.panToFeature(window['turf'].point(selectedOption.loc), 8);
  }

  clearSearchLocationControl() {
    this.searchByLocationControl.reset();
    this.clearMyLocation()
  }

  get activeFireCount(): Promise<number> {
    if (this.activeFireCountPromise) {
      return this.activeFireCountPromise;
    }
    this.activeFireCountPromise = this.publishedIncidentService.getActiveFireCount()
      .then((resp: any) => {
        return resp || 0
      }).catch((e) => {
        console.error('COUNTSTATS-FAIL');
        return 'loading...';
      });

    return this.activeFireCountPromise;
  }

  initMap(smk: any) {
    this.smkApi = new SmkApi(smk);
  }

  onToggleAccordion() {
    this.showAccordion = !this.showAccordion;
  }

  onSelectLayer(selectedLayer: SelectedLayer) {
    this.selectedLayer = selectedLayer;
    this.selectedPanel = selectedLayer
    this.snowPlowHelper(this.url, {
      action: 'feature_layer_navigation',
      text: selectedLayer
    })
    const layers = [
            /* 00 */ { itemId: 'active-wildfires', visible: true },
            /* 01 */ { itemId: 'evacuation-orders-and-alerts-wms', visible: false },
            /* 02 */ { itemId: 'evacuation-orders-and-alerts-wms-highlight', visible: false },
            /* 03 */ { itemId: 'danger-rating', visible: false },
            /* 04 */ { itemId: 'bans-and-prohibitions', visible: false },
            /* 05 */ { itemId: 'bans-and-prohibitions-highlight', visible: false },
            /* 06 */ { itemId: 'area-restrictions', visible: false },
            /* 07 */ { itemId: 'area-restrictions-highlight', visible: false },
            /* 08 */ { itemId: 'fire-perimeters', visible: false },
            /* 09 */ { itemId: 'bcws-activefires-publicview-inactive', visible: false },
            /* 10 */ { itemId: 'closed-recreation-sites', visible: false },
            /* 11 */ { itemId: 'drive-bc-active-events', visible: false },
            /* 12 */ { itemId: 'bc-fire-centres', visible: true },
            /* 13 */ { itemId: 'prescribed-fire', visible: false },
            /* 14 */ { itemId: 'hourly-currentforecast-firesmoke', visible: false },
            /* 15 */ { itemId: 'clab-indian-reserves', visible: false },
            /* 16 */ { itemId: 'fnt-treaty-land', visible: false },
            /* 17 */ { itemId: 'abms-municipalities', visible: false },
            /* 18 */ { itemId: 'abms-regional-districts', visible: false }
    ];

    switch (selectedLayer) {
      case 'evacuation-orders-and-alerts':
        layers[1].visible = true;
        break;

      case 'area-restrictions':
        layers[6].visible = true;
        layers[7].visible = true;
        break;

      case 'bans-and-prohibitions':
        layers[4].visible = true;
        layers[5].visible = true;
        break;

      case 'smoke-forecast':
        layers[14].visible = true
        break;

      case 'fire-danger':
        layers[0].visible = true;
        layers[3].visible = true;
        break;

      case 'local-authorities':
        layers[12].visible = true;
        layers[15].visible = true;
        layers[16].visible = true;
        layers[17].visible = true;
        layers[18].visible = true;
        break;

      case 'routes-impacted':
        layers[11].visible = true;
        break;
    }

    return this.smkApi.setDisplayContextItemsVisible(...layers);
  }

  async useMyCurrentLocation() {
    this.snowPlowHelper(this.url, {
      action: 'find_my_location'
    })

    this.searchText = undefined;

    const location = await this.commonUtilityService.getCurrentLocationPromise()

    const long = location.coords.longitude;
    const lat = location.coords.latitude;
    if (lat && long) {
      this.showAreaHighlight([long, lat], 50)
      this.showLocationMarker({
        type: 'Point',
        coordinates: [long, lat]
      });
    }
    this.searchByLocationControl.setValue(lat + ',' + long)
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

  openLink(link:string) {
    if (link === 'Disclaimer') {
      window.open('https://www2.gov.bc.ca/gov/content/home/disclaimer', "_blank");
    }
    else if  (link === 'Privacy') {
      window.open('https://www2.gov.bc.ca/gov/content/home/privacy', "_blank");
    }
    else if (link === 'Copyright') {
      window.open('https://www2.gov.bc.ca/gov/content/home/copyright', "_blank");
    }
  }

  disclaimerText() {
    if (screen.width <= 1200) {
      return 'Legal';
    } else {
      return 'Disclaimer and Legal Links';
    }
  }
}
