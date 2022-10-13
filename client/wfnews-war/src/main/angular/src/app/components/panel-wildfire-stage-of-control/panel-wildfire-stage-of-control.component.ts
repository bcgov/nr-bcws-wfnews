import { Overlay } from '@angular/cdk/overlay';
import { HttpClient } from '@angular/common/http';
import { AfterViewInit, ChangeDetectorRef, ComponentFactoryResolver, ComponentRef, Directive, Injector, Input, NgZone, OnChanges, OnInit, SimpleChanges, Type, ViewChild, ViewContainerRef } from '@angular/core';
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
import { MapConfigService } from '../../services/map-config.service';
import { haversineDistance } from '../../services/wfnews-map.service/util';
import { RootState } from '../../store';
import { searchWildfires } from '../../store/wildfiresList/wildfiresList.action';
import { LOAD_WILDFIRES_COMPONENT_ID } from '../../store/wildfiresList/wildfiresList.stats';
import { CollectionComponent } from '../common/base-collection/collection.component';
import { IncidentIdentifyPanelComponent } from '../incident-identify-panel/incident-identify-panel.component';
import { PanelWildfireStageOfControlComponentModel } from './panel-wildfire-stage-of-control.component.model';
import L from 'leaflet';

const delay = t => new Promise(resolve => setTimeout(resolve, t));

@Directive()
export class PanelWildfireStageOfControlComponent extends CollectionComponent implements OnChanges, AfterViewInit, OnInit  {
    @ViewChild('listIdentifyContainer', { read: ViewContainerRef }) listIdentifyContainer: ViewContainerRef;
    @Input() collection: PagedCollection

    activeWildfiresInd = true;
    wildfiresOfNoteInd = false;
    wildfiresOutInd = false;
    currentLat: number;
    currentLong: number;

    private zone: NgZone;
    private componentRef: ComponentRef<any>;
    private mapPanTimer;
    private mapPanProgressBar;
    private progressValues = new Map<string, number>();
    private lastPanned = '';

    constructor (protected injector: Injector, protected componentFactoryResolver: ComponentFactoryResolver, private mapConfigService: MapConfigService, router: Router, route: ActivatedRoute, sanitizer: DomSanitizer, store: Store<RootState>, fb: FormBuilder, dialog: MatDialog, applicationStateService: ApplicationStateService, tokenService: TokenService, snackbarService: MatSnackBar, overlay: Overlay, cdr: ChangeDetectorRef, appConfigService: AppConfigService, http: HttpClient, commonUtilityService?: CommonUtilityService) {
      super(router, route, sanitizer, store, fb, dialog, applicationStateService, tokenService, snackbarService, overlay, cdr, appConfigService, http, commonUtilityService);
      this.zone = this.injector.get(NgZone)
    }

    initModels() {
        this.model = new PanelWildfireStageOfControlComponentModel(this.sanitizer);
        this.viewModel = new PanelWildfireStageOfControlComponentModel(this.sanitizer);
    }

    getViewModel(): PanelWildfireStageOfControlComponentModel {
        return <PanelWildfireStageOfControlComponentModel>this.viewModel;
    }


    ngAfterViewInit() {
        super.ngAfterViewInit();
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
        console.log(location)
        if( location ){
            this.currentLat = Number(location.coords.latitude);
            this.currentLong = Number(location.coords.longitude);
        }
    }

    doSearch() {
        this.store.dispatch(searchWildfires(this.componentId, {
          pageNumber: this.config.currentPage,
          pageRowCount: 10,
          sortColumn: this.currentSort,
          sortDirection: this.currentSortDirection,
          query: undefined
        },
          undefined, undefined, this.displayLabel));
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
      // pan to incident location
      const self = this;

      this.mapPanTimer = setTimeout(() => {
        const SMK = window['SMK'];
        const viewer = SMK.MAP[1].$viewer;
        const map = viewer.map;
        viewer.panToFeature(window['turf'].point([incident.longitude + 1, incident.latitude]), map._zoom);

        clearInterval(this.mapPanProgressBar);
        this.mapPanProgressBar = null;
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
        // display the panel
        (document.getElementsByClassName('identify-panel').item(0) as HTMLElement).style.display = 'block';
        // apply a slight debounce to clear the identify and destroy the panel
        setTimeout(() => {
          const identifyPanel = (document.getElementsByClassName('smk-panel').item(0) as HTMLElement)
          if (identifyPanel) {
            identifyPanel.remove();
          }
          // use smk.$viewer.identified to reset the form?
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

      return this.componentRef
    }
}
