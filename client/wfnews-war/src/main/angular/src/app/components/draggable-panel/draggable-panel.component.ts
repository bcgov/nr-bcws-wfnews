import { ChangeDetectorRef, Component,OnChanges, OnInit, SimpleChanges} from '@angular/core';
import {Input} from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { PublishedIncidentService } from '@app/services/published-incident-service';
import { MapConfigService } from '@app/services/map-config.service';

@Component({
  selector: 'wfnews-draggable-panel',
  templateUrl: './draggable-panel.component.html',
  styleUrls: ['./draggable-panel.component.scss']
})

export class DraggablePanelComponent implements OnInit, OnChanges {
  resizeHeight: string = '10vh'; // Initial height of the panel
  @Input() incidentRefs: any[];
  storedIncidentRefs: any [];
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
  identifyItem:any;
  identifyIncident: any = {};
  wildfireLayerIds: string[] = [
    'active-wildfires-fire-of-note',
    'active-wildfires-out-of-control',
    'active-wildfires-holding',
    'active-wildfires-under-control',
    'bcws-activefires-publicview-inactive',
    "fire-perimeters",
  ];

  constructor(
    private publishedIncidentService: PublishedIncidentService,
    protected cdr: ChangeDetectorRef,
    protected http: HttpClient,
    private mapConfigService: MapConfigService,
    ) { 
    }


  ngOnInit(): void {
      
  }

  ngOnChanges(changes: SimpleChanges){
    this.showPanel = false;
    this.identifyIncident = null;
    this.handleLayersSelection()
  }

  handleLayersSelection(returnFromPreiviewPanel?: boolean){
    console.log(this.incidentRefs)
    if (returnFromPreiviewPanel && this.storedIncidentRefs) {
      // clicked back from preiview panel
      this.incidentRefs = this.storedIncidentRefs
    }
    if (this.incidentRefs.length === 1){
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
      }else {
        return wildfire.properties.incident_number_label + ' Wildfire';
      }
    }
  }

  closePanel() {
    this.showPanel = false;
    this.allowBackToIncidentsPanel = false;
    this.identifyIncident = {};
  }

  convertFirePerimeterFireStatus(status) {
    switch(status) {
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
    switch(identifyItem.layerId) {
      case 'active-wildfires-fire-of-note':
        return  'Wildfire of Note';
      case 'active-wildfires-out-of-control':
      case 'active-wildfires-under-control':
      case 'bcws-activefires-publicview-inactive':
      case 'active-wildfires-holding':
        return 'Wildfire'
      }
  }

  displayTitleIcon(identifyItem) {
    switch(identifyItem.layerId) {
      case 'active-wildfires-out-of-control':
      case 'active-wildfires-under-control':
      case 'bcws-activefires-publicview-inactive':
      case 'active-wildfires-holding':
        return 'report'
      }
  }

  getStageOfControlLabel (code: string) {
    if (code) {
      if (code.toUpperCase().trim() === 'OUT') return 'Out'
        else if (code.toUpperCase().trim() === 'OUT_CNTRL') return 'Out of Control'
        else if (code.toUpperCase().trim() === 'HOLDING') return 'Being Held'
        else if (code.toUpperCase().trim() === 'UNDR_CNTRL') return 'Under Control'
        else return 'Unknown'
    }
  }

  getStageOfControlIcon (code: string) {
    if (code) {
      if (code.toUpperCase().trim() === 'OUT') return 'bcws-activefires-publicview-inactive'
        else if (code.toUpperCase().trim() === 'OUT_CNTRL') return 'active-wildfires-out-of-control'
        else if (code.toUpperCase().trim() === 'HOLDING') return 'active-wildfires-holding'
        else if (code.toUpperCase().trim() === 'UNDR_CNTRL') return 'active-wildfires-under-control'
        else return 'Unknown'
    }
  }

  getDescription (code: string) {
    if (code) {
      if (code.toUpperCase().trim() === 'OUT') return "This wildfire is extinguished. Suppression efforts are complete."
        else if (code.toUpperCase().trim() === 'OUT_CNTRL') return "This wildfire is continuing to spread and is not responding to suppression efforts."
        else if (code.toUpperCase().trim() === 'HOLDING') return "This wildfire is not likely to spread beyond predetermined boundaries under current conditions."
        else if (code.toUpperCase().trim() === 'UNDR_CNTRL') return "This wildfire will not spread any further due to suppression efforts."
        else return 'Unknown'
    }
  }

  zoomIn() {
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
        viewer.panToFeature(window['turf'].point([long, lat]), 15)
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
    //yet to implement
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
    switch(danger) {
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
      (this.identifyItem.layerId === 'area-restrictions' || this.identifyItem.layerId.includes('bans-and-prohibitions') || this.identifyItem.layerId === 'closed-recreation-sites' || this.identifyItem.layerId === 'drive-bc-active-events')){
        return true
    }
  }

}