import { Overlay } from '@angular/cdk/overlay';
import { HttpClient } from '@angular/common/http';
import { AfterViewInit, ChangeDetectorRef, ComponentFactoryResolver, ComponentRef, Directive, Injector, Input, NgZone, OnChanges, OnDestroy, OnInit, SimpleChanges, Type, ViewChild, ViewContainerRef } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { DomSanitizer } from '@angular/platform-browser';
import { Router, ActivatedRoute } from '@angular/router';
import { Store } from '@ngrx/store';
import { TokenService, AppConfigService } from '@wf1/core-ui';
import * as moment from 'moment';
import { PagedCollection } from '../../conversion/models';
import { ApplicationStateService } from '../../services/application-state.service';
import { CommonUtilityService } from '../../services/common-utility.service';
import { haversineDistance } from '../../services/wfnews-map.service/util';
import { RootState } from '../../store';
import { searchWildfires } from '../../store/wildfiresList/wildfiresList.action';
import { LOAD_WILDFIRES_COMPONENT_ID } from '../../store/wildfiresList/wildfiresList.stats';
import { CollectionComponent } from '../common/base-collection/collection.component';
import { IncidentIdentifyPanelComponent } from '../incident-identify-panel/incident-identify-panel.component';
import { PanelWildfireStageOfControlComponentModel } from './panel-wildfire-stage-of-control.component.model';

const delay = t => new Promise(resolve => setTimeout(resolve, t));

@Directive()
export class PanelWildfireStageOfControlComponent extends CollectionComponent implements OnChanges, AfterViewInit, OnInit, OnDestroy  {
    @ViewChild('listIdentifyContainer', { read: ViewContainerRef }) listIdentifyContainer: ViewContainerRef;
    @Input() collection: PagedCollection

    activeWildfiresInd = true;
    wildfiresOfNoteInd = false;
    currentLat: number;
    currentLong: number;

    private zone: NgZone;
    private componentRef: ComponentRef<any>;
    private mapPanTimer;
    private mapPanProgressBar;
    private progressValues = new Map<string, number>();
    private lastPanned = '';

    private highlightLayer
    private initInterval
    private mapEventDebounce
    private ignorePan = false
    private ignorePanDebounce

    constructor (protected injector: Injector, protected componentFactoryResolver: ComponentFactoryResolver, router: Router, route: ActivatedRoute, sanitizer: DomSanitizer, store: Store<RootState>, fb: FormBuilder, dialog: MatDialog, applicationStateService: ApplicationStateService, tokenService: TokenService, snackbarService: MatSnackBar, overlay: Overlay, cdr: ChangeDetectorRef, appConfigService: AppConfigService, http: HttpClient, commonUtilityService?: CommonUtilityService) {
      super(router, route, sanitizer, store, fb, dialog, applicationStateService, tokenService, snackbarService, overlay, cdr, appConfigService, http, commonUtilityService);
      this.zone = this.injector.get(NgZone)
    }

    ngOnDestroy(): void {
      const SMK = window['SMK'];
      for (const smkMap in SMK.MAP) {
        if (Object.prototype.hasOwnProperty.call(SMK.MAP, smkMap)) {
          SMK.MAP[smkMap].$viewer.map.removeLayer(this.highlightLayer);
        }
      }
    }

    initModels() {
        this.model = new PanelWildfireStageOfControlComponentModel(this.sanitizer);
        this.viewModel = new PanelWildfireStageOfControlComponentModel(this.sanitizer);
    }

    getViewModel(): PanelWildfireStageOfControlComponentModel {
        return <PanelWildfireStageOfControlComponentModel>this.viewModel;
    }

    private mapEventHandler () {
      if (!this.ignorePan) {
        if (this.mapEventDebounce) {
          clearTimeout(this.mapEventDebounce);
          this.mapEventDebounce = null;
        }
        this.mapEventDebounce = setTimeout(() => {
          this.doSearch();
        }, 500);
      }
    }

    ngAfterViewInit() {
      super.ngAfterViewInit();

      this.initInterval = setInterval(() => {
        try {
          const SMK = window['SMK'];
          let viewer = null;
          for (const smkMap in SMK.MAP) {
            if (Object.prototype.hasOwnProperty.call(SMK.MAP, smkMap)) {
              viewer = SMK.MAP[smkMap].$viewer;
            }
          }
          const map = viewer.map;
          if (!this.highlightLayer) {
            this.highlightLayer = window[ 'L' ].layerGroup().addTo(map);
            map.on( 'zoomend', () => {
              this.mapEventHandler();
            });
            map.on( 'moveend', () => {
              this.mapEventHandler();
            });

            clearInterval(this.initInterval);
            this.initInterval = null;
          }
        } catch (err) {
          console.warn('... Waiting on SMK init to hook map events ...')
        }
      }, 1000)
    }


    ngOnChanges(changes: SimpleChanges) {
        super.ngOnChanges(changes);
    }

    ngOnInit() {
        this.updateView();
        this.config = this.getPagingConfig();
        this.baseRoute = this.router.url;
        this.componentId = LOAD_WILDFIRES_COMPONENT_ID
        this.doSearch();
        this.useMyCurrentLocation();
    }

    async useMyCurrentLocation() {
        this.searchText = undefined;

        const location = await this.commonUtilityService.getCurrentLocationPromise()
        if( location ){
            this.currentLat = Number(location.coords.latitude);
            this.currentLong = Number(location.coords.longitude);
        }
    }

    doSearch() {

      let bbox = undefined
      // Fetch the maps bounding box
      try {
        const SMK = window['SMK'];
        let viewer = null;
        for (const smkMap in SMK.MAP) {
          if (Object.prototype.hasOwnProperty.call(SMK.MAP, smkMap)) {
            viewer = SMK.MAP[smkMap].$viewer;
          }
        }
        const map = viewer.map;
        const bounds = map.getBounds();
        bbox = `${bounds._northEast.lng},${bounds._northEast.lat},${bounds._southWest.lng},${bounds._southWest.lat}`
      } catch(err) {
        console.log('SMK initializing... wait to fetch bounds.')
      }

        this.store.dispatch(searchWildfires(this.componentId, {
          pageNumber: this.config.currentPage,
          pageRowCount: 10,
          sortColumn: this.currentSort,
          sortDirection: this.currentSortDirection,
          query: undefined
        }, undefined, this.wildfiresOfNoteInd, !this.activeWildfiresInd, bbox, this.displayLabel));
      }


    stageOfControlChanges(event:any) {
        this.doSearch()
    }

    convertFromTimestamp(date: string) {
        if (date) {
            return moment(date).format('Y-MM-DD hh:mm')
        }
    }

    convertToDescription(code: string) {
        switch(code) {
            case 'OUT_CNTRL':
                return 'Out Of Control'
            case 'HOLDING':
                return 'Being Held'
            case 'UNDR_CNTRL':
                return 'Under Control'
            case 'OUT':
                return 'Out'
            default:
                break;
          }
    }

    calculateDistance (lat: number, long: number): string {
      let result = '---';
      if (lat && long && this.currentLat && this.currentLong) {
        result = (haversineDistance(lat, this.currentLat, long, this.currentLong) / 1000).toFixed(2);
      }
      return result;
    }

    public Number(value: string): number {
      return Number(value);
    }

    onPanelMouseEnter (incident: any) {
      this.ignorePan = true;
      if (this.ignorePanDebounce) {
        clearTimeout(this.ignorePanDebounce)
        this.ignorePanDebounce = null
      }
      const self = this;
      const SMK = window['SMK'];
      let viewer = null;
      for (const smkMap in SMK.MAP) {
        if (Object.prototype.hasOwnProperty.call(SMK.MAP, smkMap)) {
          viewer = SMK.MAP[smkMap].$viewer;
        }
      }
      const leaflet = window[ 'L' ];
      const map = viewer.map;

      this.mapPanTimer = setTimeout(() => {
        viewer.panToFeature(window['turf'].point([incident.longitude + 1, incident.latitude]), map._zoom);

        clearInterval(this.mapPanProgressBar);
        self.mapPanProgressBar = null;
        self.progressValues.set(incident.incidentName, 0);
        self.lastPanned = incident.incidentName
      }, 500);

      if (this.lastPanned !== incident.incidentName) {
        self.progressValues.set(incident.incidentName, 0);
        this.mapPanProgressBar = setInterval(() => {
          self.progressValues.set(incident.incidentName, self.progressValues.get(incident.incidentName) + 5);
          if (self.progressValues.get(incident.incidentName) > 100) {
            self.progressValues.set(incident.incidentName, 100);
          }
          self.cdr.detectChanges();
        }, 1);
      }

      const pointerIcon = leaflet.icon({
        iconUrl: "/assets/smk/assets/src/smk/mixin/tool-feature-list/config/marker-icon-white.png",
        iconSize: [25, 35],
        shadowAnchor: [4, 62],
        popupAnchor: [1, -34],
        shadowSize: [41, 41]
      });

      leaflet.geoJson({
        "type": "Feature",
        "geometry": {
          "type": "Point",
          "coordinates": [Number(incident.longitude), Number(incident.latitude)]
        }}, {
        pointToLayer: function (feature, latlng) {
            let marker = leaflet.marker(latlng, {icon: pointerIcon});
            return marker;
        }
      }).addTo(this.highlightLayer);
    }

    onPanelMouseExit(incident: any) {
      if (this.mapPanTimer) {
        clearTimeout(this.mapPanTimer);
        this.mapPanTimer = null;
      }
      if (this.mapPanProgressBar) {
        clearInterval(this.mapPanProgressBar);
        this.mapPanProgressBar = null;
      }
      this.progressValues.set(incident.incidentName, 0);
      this.highlightLayer.clearLayers();

      if (this.ignorePanDebounce) {
        clearTimeout(this.ignorePanDebounce)
      }
      this.ignorePanDebounce = setTimeout(() => {
        this.ignorePan = false;
        this.ignorePanDebounce = null;
      }, 500);
    }

    openPreview (incident: any) {
      this.onPanelMouseEnter(incident);

      incident.incident_number_label = incident.incidentNumberLabel;
      const self = this;
      this.zone.run(function () {
        let compRef = self.makeComponent(IncidentIdentifyPanelComponent);
        (compRef.instance as any).setIncident(incident, {});
        const panel = (document.getElementsByClassName('identify-panel').item(0) as HTMLElement);
        panel.appendChild(compRef.location.nativeElement);
        self.cdr.detectChanges();
        (document.getElementsByClassName('identify-panel').item(0) as HTMLElement).style.display = 'block';
        setTimeout(() => {
          const identifyPanel = (document.getElementsByClassName('smk-panel').item(0) as HTMLElement)
          if (identifyPanel) {
            identifyPanel.remove();
          }
        }, 200);
      })
    }

    makeComponent<C>(component: Type<C>): ComponentRef<C> {
      if (this.componentRef) {
          this.componentRef.destroy()
      }
      if (this.listIdentifyContainer) {
        this.listIdentifyContainer.clear();
      }
      this.componentRef = this.listIdentifyContainer.createComponent(this.componentFactoryResolver.resolveComponentFactory(component))
      return this.componentRef;
    }
}
