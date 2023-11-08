import { ChangeDetectorRef, Component, OnChanges, OnInit, SimpleChanges } from '@angular/core';
import { Input } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { PublishedIncidentService } from '@app/services/published-incident-service';
import { MapConfigService } from '@app/services/map-config.service';
import { Router } from '@angular/router';
import { LocationData } from '../wildfires-list-header/filter-by-location/filter-by-location-dialog.component';
import { ResourcesRoutes, convertToDateYear } from '@app/utils';

@Component({
  selector: 'wfnews-draggable-panel',
  templateUrl: './draggable-panel.component.html',
  styleUrls: ['./draggable-panel.component.scss']
})

export class DraggablePanelComponent implements OnInit, OnChanges {
  resizeHeight: string = '10vh'; // Initial height of the panel
  @Input() incidentRefs: any[];
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
  showPanel: boolean;
  allowBackToIncidentsPanel: boolean;
  identifyItem: any;
  identifyIncident: any = {};
  wildfireLayerIds: string[] = [
    'active-wildfires-fire-of-note',
    'active-wildfires-out-of-control',
    'active-wildfires-holding',
    'active-wildfires-under-control',
    'bcws-activefires-publicview-inactive',
    "fire-perimeters",
  ];
  convertToDateYear = convertToDateYear;


  constructor(
    private publishedIncidentService: PublishedIncidentService,
    protected cdr: ChangeDetectorRef,
    protected http: HttpClient,
    private mapConfigService: MapConfigService,
    private router: Router
  ) {
  }


  ngOnInit(): void {

  }

  ngOnChanges(changes: SimpleChanges) {
    this.showPanel = false;
    this.identifyIncident = null;
    this.handleLayersSelection()
  }

  handleLayersSelection(returnFromPreiviewPanel?: boolean) {
    console.log(this.incidentRefs)
    if (returnFromPreiviewPanel && this.storedIncidentRefs) {
      // clicked back from preiview panel
      this.incidentRefs = this.storedIncidentRefs
    }
    if (this.incidentRefs.length === 1) {
      this.zoomIn(8)
      // single feature within clicked area
      this.showPanel = true;
      this.identifyItem = this.incidentRefs[0];
      let incidentNumber = null;
      let fireYear = null;
      if (this.identifyItem.layerId === 'fire-perimeters') {
        incidentNumber = this.identifyItem.properties.FIRE_NUMBER;
        fireYear = this.identifyItem.properties.FIRE_YEAR;
      }
      else if (this.identifyItem.properties.incident_number_label && this.identifyItem.properties.fire_year) {
        incidentNumber = this.identifyItem.properties.incident_number_label;
        fireYear = this.identifyItem.properties.fire_year;
      }
      if (incidentNumber && fireYear) {
        this.publishedIncidentService.fetchPublishedIncident(incidentNumber, fireYear).toPromise().then(async result => {
          this.identifyIncident = result
          this.cdr.detectChanges();
        })
      }
    }
    else if (this.incidentRefs.length >= 1) {
      // multiple features within clicked area
      this.identifyItem = null;
      this.showPanel = true;
      this.filteredWildfires = this.incidentRefs.filter(item => this.wildfireLayerIds.includes(item.layerId));
      // this.filteredFirePerimeters = this.incidentRefs.filter(item => item.layerId === 'fire-perimeters');
      this.filteredEvacs = this.incidentRefs.filter(item => item.layerId === 'evacuation-orders-and-alerts-wms');
      this.filteredAreaRestrictions = this.incidentRefs.filter(item => item.layerId === 'area-restrictions');
      this.filteredBansAndProhibitions = this.incidentRefs.filter(item => item.layerId === 'bans-and-prohibitions-cat1' || item.layerId === 'bans-and-prohibitions-cat2' || item.layerId === 'bans-and-prohibitions-cat3');
      this.filteredDangerRatings = this.incidentRefs.filter(item => item.layerId === 'danger-rating');
      this.filteredRoadEvents = this.incidentRefs.filter(item => item.layerId === 'drive-bc-active-events');
      this.filteredClosedRecreationSites = this.incidentRefs.filter(item => item.layerId === 'closed-recreation-sites');
      this.filteredForestServiceRoads = this.incidentRefs.filter(item => item.layerId === 'bc-fsr');
      this.filteredProtectedLandsAccessRestrictions = this.incidentRefs.filter(item => item.layerId === 'protected-lands-access-restrictions');
      this.filteredRegionalDistricts = this.incidentRefs.filter(item => item.layerId === 'abms-regional-districts');
      this.filteredMunicipalities = this.incidentRefs.filter(item => item.layerId === 'abms-municipalities');
      this.filteredFirstNationsTreatyLand = this.incidentRefs.filter(item => item.layerId === 'fnt-treaty-land');
      this.filteredIndianReserve = this.incidentRefs.filter(item => item.layerId === 'clab-indian-reserves');
    }
  }

  displayWildfireName(wildfire) {
    if (wildfire.layerId === 'fire-perimeters') {
      return wildfire.properties.FIRE_NUMBER + ' Wildfire'
    }
    else {
      if (wildfire.properties.incident_name) {
        return wildfire.properties.incident_name + ' (' + wildfire.properties.incident_number_label + ')';
      } else {
        return wildfire.properties.incident_number_label + ' Wildfire';
      }
    }
  }

  closePanel() {
    const SMK = window['SMK'];
    SMK.MAP[1].$viewer.identified.clear();
    SMK.MAP[1].$sidepanel.setExpand(0)
    this.cdr.detectChanges();

    this.showPanel = false;
    this.allowBackToIncidentsPanel = false;
    this.identifyIncident = {};
  }


  convertFirePerimeterFireStatus(status) {
    switch (status) {
      case 'Out of Control':
        return 'active-wildfires-out-of-control'
      case 'Being Held':
        return 'active-wildfires-holding'
      case 'Under Control':
        return 'active-wildfires-under-control'
      case 'Out':
        return 'bcws-activefires-publicview-inactive'
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
        return 'Wildfire'
    }
  }

  displayTitleIcon(identifyItem) {
    switch (identifyItem.layerId) {
      case 'active-wildfires-out-of-control':
      case 'active-wildfires-under-control':
      case 'bcws-activefires-publicview-inactive':
      case 'active-wildfires-holding':
        return 'report'
    }
  }

  getStageOfControlLabel(code: string) {
    if (code) {
      if (code.toUpperCase().trim() === 'OUT') return 'Out'
      else if (code.toUpperCase().trim() === 'OUT_CNTRL') return 'Out of Control'
      else if (code.toUpperCase().trim() === 'HOLDING') return 'Being Held'
      else if (code.toUpperCase().trim() === 'UNDR_CNTRL') return 'Under Control'
      else return 'Unknown'
    }
  }

  getStageOfControlIcon(code: string) {
    if (code) {
      if (code.toUpperCase().trim() === 'OUT') return 'bcws-activefires-publicview-inactive'
      else if (code.toUpperCase().trim() === 'OUT_CNTRL') return 'active-wildfires-out-of-control'
      else if (code.toUpperCase().trim() === 'HOLDING') return 'active-wildfires-holding'
      else if (code.toUpperCase().trim() === 'UNDR_CNTRL') return 'active-wildfires-under-control'
      else return 'Unknown'
    }
  }

  getDescription(code: string) {
    if (code) {
      if (code.toUpperCase().trim() === 'OUT') return "This wildfire is extinguished. Suppression efforts are complete."
      else if (code.toUpperCase().trim() === 'OUT_CNTRL') return "This wildfire is continuing to spread and is not responding to suppression efforts."
      else if (code.toUpperCase().trim() === 'HOLDING') return "This wildfire is not likely to spread beyond predetermined boundaries under current conditions."
      else if (code.toUpperCase().trim() === 'UNDR_CNTRL') return "This wildfire will not spread any further due to suppression efforts."
      else return 'Unknown'
    }
  }

  zoomIn(level?: number) {
    let long;
    let lat;
    if (this.identifyIncident && this.identifyIncident.longitude && this.identifyIncident.latitude) {
      long = Number(this.identifyIncident.longitude);
      lat = Number(this.identifyIncident.latitude);
    } else if (this.identifyItem && this.identifyItem._identifyPoint.longitude && this.identifyItem._identifyPoint.latitude) {
      long = Number(this.identifyItem._identifyPoint.longitude);
      lat = Number(this.identifyItem._identifyPoint.latitude);
    }
    if (long && lat) {
      this.mapConfigService.getMapConfig().then(() => {
        const SMK = window['SMK'];
        let viewer = null;
        for (const smkMap in SMK.MAP) {
          if (Object.prototype.hasOwnProperty.call(SMK.MAP, smkMap)) {
            viewer = SMK.MAP[smkMap].$viewer;
          }
        }
        viewer.panToFeature(window['turf'].point([long, lat]), level ? level : 12)
      })
    }
  }

  openPreviewPanel(item) {
    this.allowBackToIncidentsPanel = true;
    this.storedIncidentRefs = this.incidentRefs
    // capture the identify panel list;
    this.identifyItem = item;
    this.incidentRefs = [item];
    this.cdr.detectChanges();
    this.handleLayersSelection();
  }

  backToIdentifyPanel() {
    this.allowBackToIncidentsPanel = false;
    this.handleLayersSelection(true)
  }

  enterFullDetail() {
    const item = this.identifyItem
    console.log(this.identifyItem.layerId)
    if (item && item.layerId && item.properties) {
      // swtich?
      const location = new LocationData()
      location.latitude = Number(this.identifyItem._identifyPoint.latitude)
      location.longitude = Number(this.identifyItem._identifyPoint.longitude)

      if (this.identifyItem.layerId === 'area-restrictions' && item.properties.PROT_RA_SYSID){
        this.router.navigate([ResourcesRoutes.FULL_DETAILS], { queryParams: { type: 'area-restriction', id: item.properties.PROT_RA_SYSID, source: [ResourcesRoutes.ACTIVEWILDFIREMAP]} });
      } else if (this.identifyItem.layerId.startsWith('bans-and-prohibitions') && item.properties.PROT_BAP_SYSID){
        this.router.navigate([ResourcesRoutes.FULL_DETAILS], { queryParams: { type: 'bans-prohibitions', id: item.properties.PROT_BAP_SYSID, source: [ResourcesRoutes.ACTIVEWILDFIREMAP]} });
      } else if (this.identifyItem.layerId === 'danger-rating'){
        this.router.navigate([ResourcesRoutes.FULL_DETAILS], { queryParams: { type: 'danger-rating', id: item.properties.DANGER_RATING_DESC, location: JSON.stringify(location), source: [ResourcesRoutes.ACTIVEWILDFIREMAP]} });
      } else if (item.layerId === 'active-wildfires-fire-of-note' || item.layerId === 'active-wildfires-out-of-control'
      || item.layerId === 'active-wildfires-holding' || item.layerId === 'active-wildfires-under-control' && (item.properties.fire_year && item.properties.incident_number_label)) {
      this.router.navigate([ResourcesRoutes.PUBLIC_INCIDENT],
        { queryParams: { fireYear: item.properties.fire_year, incidentNumber: item.properties.incident_number_label, source: [ResourcesRoutes.ACTIVEWILDFIREMAP] } })
      }
    }
  }

  convertTimeStamp(time) {
    const options: Intl.DateTimeFormatOptions = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(time).toLocaleTimeString("en-US", options)
  }

  convertIrregularTimeStamp(time) {
    const date = new Date(time);
    return this.convertTimeStamp(date);
  }

  displayEvacTitle(item) {
    let prefix = null;
    if (item.properties.ORDER_ALERT_STATUS === 'Alert') {
      prefix = 'Evacuation Alert for '
    }
    else if (item.properties.ORDER_ALERT_STATUS === 'Order') {
      prefix = 'Evacuation Order for '
    }
    return prefix + item.properties.EVENT_NAME;
  }

  displayDangerRatingDes(danger) {
    switch (danger) {
      case 'Extreme':
        return "Extremely dry forest fuels and the fire risk is very serious. New fires will start easily, spread rapidly, and challenge fire suppression efforts."
      case 'High':
        return "Forest fuels are very dry and the fire risk is serious.  Extreme caution must be used in any forest activities."
      case 'Moderate':
        return "Forest fuels are drying and there is an increased risk of surface fires starting. Carry out any forest activities with caution."
      case 'Low':
        return "Fires may start easily and spread quickly but there will be minimal involvement of deeper fuel layers or larger fuels."
      case 'Very Low':
        return "Dry forest fuels are at a very low risk of catching fire."
    }
  }

  shareableLayers() {
    if (this.showPanel && this.identifyItem &&
      (this.identifyItem.layerId === 'area-restrictions' ||
        this.identifyItem.layerId.includes('bans-and-prohibitions') ||
        this.identifyItem.layerId === 'closed-recreation-sites' ||
        this.identifyItem.layerId === 'drive-bc-active-events' ||
        this.identifyItem.layerId === 'protected-lands-access-restrictions' ||
        this.identifyItem.layerId === 'bc-fsr' ||
        this.identifyItem.layerId === 'abms-regional-districts' ||
        this.identifyItem.layerId === 'clab-indian-reserves' ||
        this.identifyItem.layerId === 'abms-municipalities')) {
      return true
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
        return 'Unknown'
    }
  }

  showLocationIcon(layerId: string) {
    if (layerId !== 'drive-bc-active-events'
      && layerId !== 'protected-lands-access-restrictions'
      && layerId !== 'bc-fsr'
      && layerId !== 'abms-regional-districts'
      && layerId !== 'clab-indian-reserves'
      && layerId !== 'abms-municipalities') {
      return true;
    }
  }

  showCalendarIcon(layerId: string) {
    if (layerId !== 'bc-fsr'
      && layerId !== 'abms-regional-districts'
      && layerId !== 'clab-indian-reserves'
      && layerId !== 'abms-municipalities') {
      return true;
    }
  }

  isLocalAuthoritiesLayer(layerId: string) {
    if (layerId === 'abms-regional-districts' || layerId === 'clab-indian-reserves' || layerId === 'abms-municipalities') {
      return true;
    }
  }

  displayLocalAuthorityType(layerId: string) {
    if (layerId === 'abms-regional-districts') {
      return 'Regional District'
    }
    if (layerId === 'clab-indian-reserves') {
      return 'Indian Reserve'
    }
    if (layerId === 'abms-municipalities') {
      return 'Municipality'
    }
  }

}
