import { CdkDrag } from '@angular/cdk/drag-drop';
import { Component, Injectable, OnChanges, OnInit, SimpleChanges } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import {Input} from '@angular/core';

@Component({
  selector: 'wfnews-draggable-panel',
  templateUrl: './draggable-panel.component.html',
  styleUrls: ['./draggable-panel.component.scss']
})

export class DraggablePanelComponent implements OnInit, OnChanges {
  resizeHeight: string = '10vh'; // Initial height of the panel
  @Input() incidentRefs: any[];
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

  wildfireLayerIds: string[] = [
    'active-wildfires-fire-of-note',
    'active-wildfires-out-of-control',
    'active-wildfires-holding',
    'active-wildfires-under-control',
    'bcws-activefires-publicview-inactive',
  ];

  ngOnInit(): void {
      
  }

  ngOnChanges(changes: SimpleChanges){
    if (this.incidentRefs.length >= 1) {
      this.showPanel = true;
      // multiple features within clicked area
      this.filteredWildfires = this.incidentRefs.filter(item => this.wildfireLayerIds.includes(item.layerId));
      this.filteredFirePerimeters = this.incidentRefs.filter(item => item.layerId === 'fire-perimeters');
      this.filteredEvacs = this.incidentRefs.filter(item => item.layerId === 'evacuation-orders-and-alerts-wms');
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

  closePanel() {
    this.showPanel = false;
  }
}
