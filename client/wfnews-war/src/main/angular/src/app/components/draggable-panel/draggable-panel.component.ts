import { HttpClient } from '@angular/common/http';
import {
  ChangeDetectorRef,
  Component,
  Input,
  OnChanges,
  OnDestroy,
  OnInit,
  SimpleChanges,
} from '@angular/core';
import { Router } from '@angular/router';
import { MapConfigService } from '@app/services/map-config.service';
import { PublishedIncidentService } from '@app/services/published-incident-service';
import {
  ResourcesRoutes,
  convertToDateYear,
  getActiveMap,
  setDisplayColor,
  convertToDateTime,
} from '@app/utils';
import * as L from 'leaflet';
import { LocationData } from '../wildfires-list-header/filter-by-location/filter-by-location-dialog.component';
import { AGOLService } from '@app/services/AGOL-service';

@Component({
  selector: 'wfnews-draggable-panel',
  templateUrl: './draggable-panel.component.html',
  styleUrls: ['./draggable-panel.component.scss'],
})
export class DraggablePanelComponent implements OnInit, OnChanges, OnDestroy {
  @Input() incidentRefs: any[];

  resizeHeight = '10vh'; // Initial height of the panel
  currentIncidentRefs: any[];
  storedIncidentRefs: any[];
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
  weatherStations: any[];
  showPanel: boolean;
  allowBackToIncidentsPanel: boolean;
  identifyItem: any;
  identifyIncident: any = {};
  map: any;
  wildfireLayerIds: string[] = [
    'active-wildfires-fire-of-note',
    'active-wildfires-out-of-control',
    'active-wildfires-holding',
    'active-wildfires-under-control',
    'bcws-activefires-publicview-inactive',
    'fire-perimeters',
  ];
  convertToDateYear = convertToDateYear;
  convertToDateTime = convertToDateTime;
  removeIdentity = false;

  private previousZoom: number;
  private marker: any;
  private markerAnimation;

  constructor(
    private publishedIncidentService: PublishedIncidentService,
    protected cdr: ChangeDetectorRef,
    protected http: HttpClient,
    private mapConfigService: MapConfigService,
    private router: Router,
    private agolService: AGOLService,
  ) {}

  ngOnDestroy(): void {
    if (this.markerAnimation) {
      clearInterval(this.markerAnimation);
    }
  }

  ngOnInit(): void {}

  ngOnChanges(changes: SimpleChanges) {
    if (
      !this.removeIdentity ||
      (changes?.incidentRefs?.currentValue &&
        changes.incidentRefs.currentValue.length > 0)
    ) {
      this.removeIdentity = false;
      this.showPanel = false;
      this.identifyIncident = null;

      const incidentRefs = changes?.incidentRefs?.currentValue;
      if (incidentRefs) {
        this.currentIncidentRefs = incidentRefs;
        this.handleLayersSelection();
      }
    }
  }

  async handleLayersSelection(
    returnFromPreiviewPanel: boolean = false,
    openPreviewPanel: boolean = false,
  ) {
    if (this.marker) {
      this.marker.remove();
      this.marker = null;
    }

    if (this.markerAnimation) {
      clearInterval(this.markerAnimation);
    }
    if (returnFromPreiviewPanel && this.storedIncidentRefs) {
      // clicked back from preiview panel
      this.currentIncidentRefs = this.storedIncidentRefs;
    }

    // re-check for the identified incidents, in case the
    // list has been modified while loading external data (weather)
    if (!openPreviewPanel && !returnFromPreiviewPanel) {
      // open preiview for notification
      if (
        !(
          this.currentIncidentRefs.length === 1 &&
          this.currentIncidentRefs[0].notification
        )
      ) {
        try {
          const identFeatureSet = getActiveMap().$viewer.identified.featureSet;
          const identifiedIncidents = Object.keys(identFeatureSet).map(
            (key) => identFeatureSet[key],
          );

          if (
            identifiedIncidents?.length !== this.currentIncidentRefs?.length
          ) {
            this.currentIncidentRefs = identifiedIncidents;
          }
        } catch (err) {
          console.error(err);
        }
      }
    }

    if (this.currentIncidentRefs.length === 1) {
      // single feature within clicked area
      this.showPanel = true;
      this.identifyItem = this.currentIncidentRefs[0];
      let incidentNumber = null;
      let fireYear = null;
      if (this.identifyItem.layerId === 'fire-perimeters') {
        incidentNumber = this.identifyItem.properties.FIRE_NUMBER;
        fireYear = this.identifyItem.properties.FIRE_YEAR;
      } else if (
        this.identifyItem.properties.incident_number_label &&
        this.identifyItem.properties.fire_year
      ) {
        incidentNumber = this.identifyItem.properties.incident_number_label;
        fireYear = this.identifyItem.properties.fire_year;
      }
      if (incidentNumber && fireYear) {
        // identify an incident
        try {
          const result = await this.publishedIncidentService
            .fetchPublishedIncident(incidentNumber, fireYear)
            .toPromise();

          this.identifyIncident = result;
          this.zoomIn(getActiveMap().$viewer.map._zoom);

          if (this.identifyIncident) {
            this.addMarker(this.identifyIncident);
          }

          this.cdr.markForCheck();

        } catch (error) {
          console.error('Unable to identify', error);
        }
      } else {
        //identify anything other than incident
        if (
          this.identifyItem.layerId.includes('bans-and-prohibitions') ||
          this.identifyItem.layerId.includes('evacuation-orders-and-alerts') ||
          this.identifyItem.layerId.includes('area-restrictions') ||
          this.identifyItem.layerId.includes('weather-stations')
        ) {
          this.zoomIn(getActiveMap().$viewer.map._zoom, true);
        } else {
          this.zoomIn(getActiveMap().$viewer.map._zoom);
        }
      }
      const SMK = window['SMK'];
      const map = getActiveMap(SMK);

      if (map) {
        map.$viewer.identified.clear();
        map.$sidepanel.setExpand(0);
      }
      this.removeIdentity = true;
    } else if (this.currentIncidentRefs.length >= 1) {
      // multiple features within clicked area
      this.identifyItem = null;
      this.showPanel = true;
      this.filteredWildfires = this.currentIncidentRefs.filter((item) =>
        this.wildfireLayerIds.includes(item.layerId),
      );
      // this.filteredFirePerimeters = this.currentIncidentRefs.filter(item => item.layerId === 'fire-perimeters');
      this.filteredEvacs = this.currentIncidentRefs.filter(
        (item) => item.layerId === 'evacuation-orders-and-alerts-wms',
      );
      this.filteredAreaRestrictions = this.currentIncidentRefs.filter(
        (item) => item.layerId === 'area-restrictions',
      );
      this.filteredBansAndProhibitions = this.currentIncidentRefs.filter(
        (item) =>
          item.layerId === 'bans-and-prohibitions-cat1' ||
          item.layerId === 'bans-and-prohibitions-cat2' ||
          item.layerId === 'bans-and-prohibitions-cat3',
      );
      this.filteredDangerRatings = this.currentIncidentRefs.filter(
        (item) => item.layerId === 'danger-rating',
      );
      this.filteredRoadEvents = this.currentIncidentRefs.filter(
        (item) => item.layerId === 'drive-bc-active-events',
      );
      this.filteredClosedRecreationSites = this.currentIncidentRefs.filter(
        (item) => item.layerId === 'closed-recreation-sites',
      );
      this.filteredForestServiceRoads = this.currentIncidentRefs.filter(
        (item) => item.layerId === 'bc-fsr',
      );
      this.filteredProtectedLandsAccessRestrictions =
        this.currentIncidentRefs.filter(
          (item) => item.layerId === 'protected-lands-access-restrictions',
        );
      this.filteredRegionalDistricts = this.currentIncidentRefs.filter(
        (item) => item.layerId === 'abms-regional-districts',
      );
      this.filteredMunicipalities = this.currentIncidentRefs.filter(
        (item) => item.layerId === 'abms-municipalities',
      );
      this.filteredFirstNationsTreatyLand = this.currentIncidentRefs.filter(
        (item) => item.layerId === 'fnt-treaty-land',
      );
      this.filteredIndianReserve = this.currentIncidentRefs.filter(
        (item) => item.layerId === 'clab-indian-reserves',
      );
      this.weatherStations = this.currentIncidentRefs.filter(
        (item) => item.layerId === 'weather-stations',
      );
    }
  }

  addMarker(incident: any) {
    if (this.marker) {
      this.marker.remove();
      this.marker = null;
    }

    if (this.markerAnimation) {
      clearInterval(this.markerAnimation);
    }

    const pointerIcon = L.divIcon({
      iconSize: [20, 20],
      iconAnchor: [12, 12],
      popupAnchor: [10, 0],
      shadowSize: [0, 0],
      className: 'animated-icon',
    });
    this.marker = L.marker(
      [Number(incident.latitude), Number(incident.longitude)],
      { icon: pointerIcon },
    );
    this.marker.on('add', function() {
      const icon: any = document.querySelector('.animated-icon');
      icon.style.backgroundColor = setDisplayColor(incident.stageOfControlCode);

      this.markerAnimation = setInterval(() => {
        icon.style.width = icon.style.width === '10px' ? '20px' : '10px';
        icon.style.height = icon.style.height === '10px' ? '20px' : '10px';
        icon.style.marginLeft = icon.style.width === '20px' ? '-10px' : '-5px';
        icon.style.marginTop = icon.style.width === '20px' ? '-10px' : '-5px';
        icon.style.boxShadow =
          icon.style.width === '20px'
            ? '4px 4px 4px rgba(0, 0, 0, 0.65)'
            : '0px 0px 0px transparent';
      }, 1000);
    });

    const viewer = getActiveMap().$viewer;
    this.marker.addTo(viewer.map);
  }

  displayWildfireName(wildfire) {
    if (wildfire.layerId === 'fire-perimeters') {
      return wildfire.properties.FIRE_NUMBER + ' Wildfire';
    } else {
      if (wildfire.properties.incident_name) {
        return (
          wildfire.properties.incident_name +
          ' (' +
          wildfire.properties.incident_number_label +
          ')'
        );
      } else {
        return wildfire.properties.incident_number_label + ' Wildfire';
      }
    }
  }

  closePanel() {
    this.showPanel = false;
    this.allowBackToIncidentsPanel = false;
    this.identifyIncident = {};
    if (this.marker) {
      this.marker.remove();
      this.marker = null;
    }

    if (this.markerAnimation) {
      clearInterval(this.markerAnimation);
    }
    const SMK = window['SMK'];
    const map = SMK?.MAP?.[1];

    if (map) {
      map.$viewer.identified.clear();
      map.$sidepanel.setExpand(0);
    }
    this.cdr.markForCheck();
  }

  convertFirePerimeterFireStatus(status) {
    switch (status) {
      case 'Out of Control':
        return 'active-wildfires-out-of-control';
      case 'Being Held':
        return 'active-wildfires-holding';
      case 'Under Control':
        return 'active-wildfires-under-control';
      case 'Out':
        return 'bcws-activefires-publicview-inactive';
      default:
        break;
    }
  }

  displayItemTitle(identifyItem) {
    switch (identifyItem.layerId) {
      case 'active-wildfires-fire-of-note':
        return 'Wildfire of Note';
      case 'active-wildfires-out-of-control':
      case 'active-wildfires-under-control':
      case 'bcws-activefires-publicview-inactive':
      case 'active-wildfires-holding':
        return 'Wildfire';
    }
  }

  displayTitleIcon(identifyItem) {
    switch (identifyItem.layerId) {
      case 'active-wildfires-out-of-control':
      case 'active-wildfires-under-control':
      case 'bcws-activefires-publicview-inactive':
      case 'active-wildfires-holding':
        return 'report';
    }
  }

  getStageOfControlLabel(code: string) {
    if (code) {
      if (code.toUpperCase().trim() === 'OUT') {
return 'Out';
} else if (code.toUpperCase().trim() === 'OUT_CNTRL') {
return 'Out of Control';
} else if (code.toUpperCase().trim() === 'HOLDING') {
return 'Being Held';
} else if (code.toUpperCase().trim() === 'UNDR_CNTRL') {
return 'Under Control';
} else {
return 'Unknown';
}
    }
  }

  getStageOfControlIcon(code: string) {
    if (code) {
      if (code.toUpperCase().trim() === 'OUT') {
return 'bcws-activefires-publicview-inactive';
} else if (code.toUpperCase().trim() === 'OUT_CNTRL') {
return 'active-wildfires-out-of-control';
} else if (code.toUpperCase().trim() === 'HOLDING') {
return 'active-wildfires-holding';
} else if (code.toUpperCase().trim() === 'UNDR_CNTRL') {
return 'active-wildfires-under-control';
} else {
return 'Unknown';
}
    }
  }

  getDescription(code: string) {
    if (code) {
      if (code.toUpperCase().trim() === 'OUT') {
return 'This wildfire is extinguished. Suppression efforts are complete.';
} else if (code.toUpperCase().trim() === 'OUT_CNTRL') {
return 'This wildfire is continuing to spread and is not responding to suppression efforts.';
} else if (code.toUpperCase().trim() === 'HOLDING') {
return 'This wildfire is not likely to spread beyond predetermined boundaries under current conditions.';
} else if (code.toUpperCase().trim() === 'UNDR_CNTRL') {
return 'This wildfire will not spread any further due to suppression efforts.';
} else {
return 'Unknown';
}
    }
  }

  zoomIn(level?: number, polygon?: boolean) {
    this.previousZoom = getActiveMap().$viewer.map._zoom;
    let long;
    let lat;
    if (this.identifyIncident?.longitude && this.identifyIncident?.latitude) {
      long = Number(this.identifyIncident.longitude);
      lat = Number(this.identifyIncident.latitude);
    } else if (
      this.identifyItem?._identifyPoint?.longitude &&
      this.identifyItem?._identifyPoint?.latitude
    ) {
      long = Number(this.identifyItem._identifyPoint.longitude);
      lat = Number(this.identifyItem._identifyPoint.latitude);
    } else if (this.identifyItem?.geometry?.coordinates) {
      long = Number(this.identifyItem.geometry.coordinates[0]);
      lat = Number(this.identifyItem.geometry.coordinates[1]);
    }
    if (long && lat) {
      this.mapConfigService.getMapConfig().then(() => {
        const viewer = getActiveMap().$viewer;
        viewer.panToFeature(
          window['turf'].point([long, lat]),
          level ? level : 12,
        );
        const layerId = this.identifyItem?.layerId;
        if (
          polygon &&
          (layerId.includes('bans-and-prohibitions') ||
            layerId.includes('evacuation-orders-and-alerts') ||
            layerId.includes('area-restrictions'))
        ) {
          viewer.panToFeature(window['turf'].point([long, lat]), 5);

          if (layerId.includes('bans-and-prohibitions')) {

            this.agolService
              .getBansAndProhibitionsById(
                this.identifyItem.properties.PROT_BAP_SYSID,
                {
                  returnGeometry: false,
                  returnCentroid: false,
                  returnExtent: true,
                },
              )
              .toPromise()
              .then((response) => {
                if (response?.extent) {
                  viewer.map.fitBounds([
                    [response.extent.ymin, response.extent.xmin],
                    [response.extent.ymax, response.extent.xmax]
                ]);
                }
              });
          } else if (layerId.includes('evacuation-orders-and-alerts')) {
            this.agolService
              .getEvacOrdersByEventNumber(
                this.identifyItem.properties.EVENT_NUMBER,
                {
                  returnGeometry: false,
                  returnCentroid: false,
                  returnExtent: true,
                },
              )
              .toPromise()
              .then((response) => {
                if (response?.extent) {
                  viewer.map.fitBounds([
                    [response.extent.ymin, response.extent.xmin],
                    [response.extent.ymax, response.extent.xmax]
                ]);
                }
              });
          } else if (layerId.includes('area-restrictions')) {
            this.agolService
              .getAreaRestrictions(
                `NAME='${this.identifyItem.properties.NAME}'`,
                null,
                {
                  returnGeometry: false,
                  returnCentroid: false,
                  returnExtent: true,
                },
              )
              .toPromise()
              .then((response) => {
                viewer.map.fitBounds([
                    [response.extent.ymin, response.extent.xmin],
                    [response.extent.ymax, response.extent.xmax]
                ]);
              });
          }
        }
      });
    }
  }

  openPreviewPanel(item) {
    this.allowBackToIncidentsPanel = true;
    this.storedIncidentRefs = this.currentIncidentRefs;
    // capture the identify panel list;
    this.identifyItem = item;
    this.currentIncidentRefs = [item];
    this.cdr.markForCheck();
    this.handleLayersSelection(false, true);
  }

  backToIdentifyPanel() {
    this.zoomIn(this.previousZoom);
    this.allowBackToIncidentsPanel = false;
    this.handleLayersSelection(true);
  }

  enterFullDetail() {
    const item = this.identifyItem;

    if (item && item.layerId && item.properties) {
      // swtich?
      const location = new LocationData();
      location.latitude = Number(this.identifyItem._identifyPoint.latitude);
      location.longitude = Number(this.identifyItem._identifyPoint.longitude);

      if (
        this.identifyItem.layerId === 'area-restrictions' &&
        item.properties.NAME
      ) {
        this.router.navigate([ResourcesRoutes.FULL_DETAILS], {
          queryParams: {
            type: 'area-restriction',
            id: item.properties.PROT_RA_SYSID,
            name:item.properties.NAME,
            source: [ResourcesRoutes.ACTIVEWILDFIREMAP],
          },
        });
      } else if (
        this.identifyItem.layerId.startsWith('bans-and-prohibitions') &&
        item.properties.PROT_BAP_SYSID
      ) {
        this.router.navigate([ResourcesRoutes.FULL_DETAILS], {
          queryParams: {
            type: 'bans-prohibitions',
            id: item.properties.PROT_BAP_SYSID,
            source: [ResourcesRoutes.ACTIVEWILDFIREMAP],
          },
        });
      } else if (this.identifyItem.layerId === 'danger-rating') {
        this.router.navigate([ResourcesRoutes.FULL_DETAILS], {
          queryParams: {
            type: 'danger-rating',
            id: item.properties.DANGER_RATING_DESC,
            location: JSON.stringify(location),
            source: [ResourcesRoutes.ACTIVEWILDFIREMAP],
          },
        });
      } else if (
        this.identifyItem.layerId === 'evacuation-orders-and-alerts-wms'
      ) {
        let type = null;
        if (item.properties.ORDER_ALERT_STATUS === 'Alert') {
type = 'evac-alert';
} else if (item.properties.ORDER_ALERT_STATUS === 'Order') {
type = 'evac-order';
}
        this.router.navigate([ResourcesRoutes.FULL_DETAILS], {
          queryParams: {
            type,
            id: item.properties.EMRG_OAA_SYSID,
            name: item.properties.EVENT_NAME,
            source: [ResourcesRoutes.ACTIVEWILDFIREMAP],
          },
        });
      } else if (
        item.layerId === 'active-wildfires-fire-of-note' ||
        item.layerId === 'active-wildfires-out-of-control' ||
        item.layerId === 'active-wildfires-holding' ||
        (item.layerId === 'active-wildfires-under-control' &&
          item.properties.fire_year &&
          item.properties.incident_number_label)
      ) {
        this.router.navigate([ResourcesRoutes.PUBLIC_INCIDENT], {
          queryParams: {
            fireYear: item.properties.fire_year,
            incidentNumber: item.properties.incident_number_label,
            source: [ResourcesRoutes.ACTIVEWILDFIREMAP],
          },
        });
      }
    }
  }

  convertTimeStamp(time) {
    const options: Intl.DateTimeFormatOptions = {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    };
    return new Date(time).toLocaleTimeString('en-US', options);
  }

  displayEvacTitle(item) {
    let prefix = null;
    if (item.properties.ORDER_ALERT_STATUS === 'Alert') {
      prefix = 'Evacuation Alert for ';
    } else if (item.properties.ORDER_ALERT_STATUS === 'Order') {
      prefix = 'Evacuation Order for ';
    }
    return prefix + item.properties.EVENT_NAME;
  }

  displayDangerRatingDes(danger) {
    switch (danger) {
      case 'Extreme':
        return 'Extremely dry forest fuels and the fire risk is very serious. New fires will start easily, spread rapidly, and challenge fire suppression efforts.';
      case 'High':
        return 'Forest fuels are very dry and the fire risk is serious.  Extreme caution must be used in any forest activities.';
      case 'Moderate':
        return 'Forest fuels are drying and there is an increased risk of surface fires starting. Carry out any forest activities with caution.';
      case 'Low':
        return 'Fires may start easily and spread quickly but there will be minimal involvement of deeper fuel layers or larger fuels.';
      case 'Very Low':
        return 'Dry forest fuels are at a very low risk of catching fire.';
    }
  }

  shareableLayers() {
    if (
      this.showPanel &&
      this.identifyItem &&
      (this.identifyItem.layerId === 'area-restrictions' ||
        this.identifyItem.layerId.includes('bans-and-prohibitions') ||
        this.identifyItem.layerId === 'closed-recreation-sites' ||
        this.identifyItem.layerId === 'drive-bc-active-events' ||
        this.identifyItem.layerId === 'protected-lands-access-restrictions' ||
        this.identifyItem.layerId === 'bc-fsr' ||
        this.identifyItem.layerId === 'abms-regional-districts' ||
        this.identifyItem.layerId === 'clab-indian-reserves' ||
        this.identifyItem.layerId === 'abms-municipalities')
    ) {
      return true;
    }
  }

  displayForestServiceRoadsAlert(item) {
    switch (item['ALERT_TYPE']) {
      case 'WARNING':
        return 'Warning for ' + item['LOCATION'];
      case 'CLOSURE':
        return 'Closure for ' + item['LOCATION'];
      case 'SEASONAL':
        return 'Seasonal Closure for ' + item['LOCATION'];
      default:
        return 'Unknown';
    }
  }

  showLocationIcon(layerId: string) {
    if (
      layerId !== 'drive-bc-active-events' &&
      layerId !== 'protected-lands-access-restrictions' &&
      layerId !== 'bc-fsr' &&
      layerId !== 'abms-regional-districts' &&
      layerId !== 'clab-indian-reserves' &&
      layerId !== 'abms-municipalities'
    ) {
      return true;
    }
  }

  showCalendarIcon(layerId: string) {
    if (
      layerId !== 'bc-fsr' &&
      layerId !== 'abms-regional-districts' &&
      layerId !== 'clab-indian-reserves' &&
      layerId !== 'abms-municipalities'
    ) {
      return true;
    }
  }

  isLocalAuthoritiesLayer(layerId: string) {
    if (
      layerId === 'abms-regional-districts' ||
      layerId === 'clab-indian-reserves' ||
      layerId === 'abms-municipalities'
    ) {
      return true;
    }
  }

  displayLocalAuthorityType(layerId: string) {
    if (layerId === 'abms-regional-districts') {
      return 'Regional District';
    }
    if (layerId === 'clab-indian-reserves') {
      return 'Indian Reserve';
    }
    if (layerId === 'abms-municipalities') {
      return 'Municipality';
    }
  }

  decode(text: string): string {
    return decodeURIComponent(escape(text));
  }

  convertStationHour(name: string) {
    return (
      name.substring(0, 4) +
      '-' +
      name.substring(4, 6) +
      '-' +
      name.substring(6, 8) +
      ' ' +
      name.substring(8, 10) +
      ':00'
    );
  }

  getPrecipitation(station: any): string {
    const precip =
      station?.data?.hourly?.reduce(
        (n, { precipitation }) => n + Number(precipitation),
        0,
      ) || 0;
    return `${precip.toFixed(1)}mm`;
  }

  formatDate(timestamp: string | number): string {
    if (timestamp) {
      const date = new Date((typeof timestamp === 'string' ? timestamp.slice(0, 10) : timestamp));
      const options: Intl.DateTimeFormatOptions = {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      };

      return date.toLocaleDateString('en-US', options);
    } else return '';
  }
}
