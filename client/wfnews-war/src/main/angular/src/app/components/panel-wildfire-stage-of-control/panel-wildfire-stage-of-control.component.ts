import { Overlay } from '@angular/cdk/overlay';
import { HttpClient } from '@angular/common/http';
import {
  ChangeDetectorRef,
  ComponentFactoryResolver,
  ComponentRef,
  Directive,
  Injector,
  Input,
  NgZone,
  OnChanges,
  OnDestroy,
  OnInit,
  SimpleChanges,
  Type,
  ViewChild,
  ViewContainerRef,
} from '@angular/core';
import { UntypedFormBuilder } from '@angular/forms';
import { MatCheckboxChange } from '@angular/material/checkbox';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatTabChangeEvent } from '@angular/material/tabs';
import { DomSanitizer } from '@angular/platform-browser';
import { ActivatedRoute, Router } from '@angular/router';
import { Store } from '@ngrx/store';
import { AppConfigService, TokenService } from '@wf1/core-ui';
import * as L from 'leaflet';
import {
  AreaRestrictionsOption,
  EvacOrderOption,
  PagedCollection,
} from '../../conversion/models';
import { ApplicationStateService } from '../../services/application-state.service';
import { CommonUtilityService } from '../../services/common-utility.service';
import { WatchlistService } from '../../services/watchlist-service';
import { haversineDistance } from '../../services/wfnews-map.service/util';
import { RootState } from '../../store';
import { searchWildfires } from '../../store/wildfiresList/wildfiresList.action';
import { LOAD_WILDFIRES_COMPONENT_ID } from '../../store/wildfiresList/wildfiresList.stats';
import {
  convertToDateWithDayOfWeek as DateTimeConvert,
  convertToStageOfControlDescription as StageOfControlConvert,
  checkLayerVisible,
  convertToFireCentreDescription,
  getActiveMap,
  snowPlowHelper,
} from '../../utils';
import { CollectionComponent } from '../common/base-collection/collection.component';
import { PanelWildfireStageOfControlComponentModel } from './panel-wildfire-stage-of-control.component.model';
import { AGOLService } from '@app/services/AGOL-service';
import { MapConfigService } from '@app/services/map-config.service';
import moment from 'moment';
import { WildfirePreviewComponent } from '@app/components/preview-panels/wildfire-preview/wildfire-preview.component';
const delay = (t) => new Promise((resolve) => setTimeout(resolve, t));

@Directive()
export class PanelWildfireStageOfControlComponent
  extends CollectionComponent
  implements OnChanges, OnInit, OnDestroy {
  @ViewChild('listIdentifyContainer', { read: ViewContainerRef })
  listIdentifyContainer: ViewContainerRef;
  @Input() collection: PagedCollection;
  @Input() selectedPanel: string;

  public snowPlowHelper = snowPlowHelper;
  public checkLayerVisible = checkLayerVisible;

  activeWildfiresInd = true;
  outWildfiresInd = false;
  wildfiresOfNoteInd = false;
  newFires = false;
  currentLat: number;
  currentLong: number;

  public areaRestrictions: AreaRestrictionsOption[] = [];
  public evacOrders: EvacOrderOption[] = [];

  public isFirstPage: string;
  public isLastPage: string;

  public loading = true;
  public tabIndex = 0;

  public readonly url =
    this.appConfigService.getConfig().application.baseUrl.toString() +
    this.router.url.slice(1);

  public convertToDateWithDayOfWeek = DateTimeConvert;
  public convertToStageOfControlDescription = StageOfControlConvert;
  public convertToFireCentreDescription = convertToFireCentreDescription;

  private zone: NgZone;
  private componentRef: ComponentRef<any>;
  private mapPanProgressBar;
  private progressValues = new Map<string, number>();
  private lastPanned = '';

  private viewer;
  private map;

  private handlePanelEnterTimeout;
  private handlePanelExitTImeout;
  private markerAnimation;
  private highlightLayer;
  private initInterval;
  private mapEventDebounce;
  private ignorePan = true;
  private ignorePanDebounce;
  private marker: any;
  private cdrScan;

  constructor(
    protected injector: Injector,
    private mapConfigService: MapConfigService,
    private agolService: AGOLService,
    protected componentFactoryResolver: ComponentFactoryResolver,
    router: Router,
    route: ActivatedRoute,
    sanitizer: DomSanitizer,
    store: Store<RootState>,
    fb: UntypedFormBuilder,
    dialog: MatDialog,
    applicationStateService: ApplicationStateService,
    tokenService: TokenService,
    snackbarService: MatSnackBar,
    overlay: Overlay,
    cdr: ChangeDetectorRef,
    appConfigService: AppConfigService,
    http: HttpClient,
    watchlistService: WatchlistService,
    commonUtilityService?: CommonUtilityService,
  ) {
    super(
      router,
      route,
      sanitizer,
      store,
      fb,
      dialog,
      applicationStateService,
      tokenService,
      snackbarService,
      overlay,
      cdr,
      appConfigService,
      http,
      watchlistService,
      commonUtilityService,
    );
    this.zone = this.injector.get(NgZone);
  }

  @ViewChild('wildfirePanelContainer', { read: ViewContainerRef }) wildfirePanelContainer: ViewContainerRef;

  ngOnDestroy(): void {
    const panel = document.getElementsByClassName('incident-details');
    if (panel && panel.length !== 0) {
      (panel.item(0) as HTMLElement).remove();
    }

    if (
      (document.getElementsByClassName('identify-panel').item(0) as HTMLElement)
        ?.style?.display
    ) {
      (
        document.getElementsByClassName('identify-panel').item(0) as HTMLElement
      ).style.display = 'none';
    }

    try {
      getActiveMap().$viewer.map.removeLayer(this.highlightLayer);
    } catch (err) {
      console.error(
        'Ignoring highlight layer clear. This may occur from the mobile side destruction',
        err,
      );
    }

    clearInterval(this.initInterval);
    clearInterval(this.mapPanProgressBar);
    clearInterval(this.markerAnimation);
    clearTimeout(this.ignorePanDebounce);
    clearInterval(this.cdrScan);
  }

  initModels() {
    this.model = new PanelWildfireStageOfControlComponentModel(this.sanitizer);
    this.viewModel = new PanelWildfireStageOfControlComponentModel(
      this.sanitizer,
    );
  }

  getViewModel(): PanelWildfireStageOfControlComponentModel {
    return this.viewModel as PanelWildfireStageOfControlComponentModel;
  }

  private mapEventHandler(ignorePan) {
    if (!ignorePan) {
      if (this.mapEventDebounce) {
        clearTimeout(this.mapEventDebounce);
        this.mapEventDebounce = null;
      }
      this.mapEventDebounce = setTimeout(() => {
        if (this.tabIndex === 1) {
          this.doSearch();
        }
      }, 500);
    }
  }

  bindMapEvents() {
    this.initInterval = setInterval(() => {
      try {
        const SMK = window['SMK'];
        this.viewer = getActiveMap(SMK)?.$viewer;
        this.map = this.viewer?.map;
        if (!this.highlightLayer) {
          this.highlightLayer = window['L'].layerGroup().addTo(this.map);
          this.map.on('zoomend', () => {
            this.mapEventHandler(false);
          });
          this.map.on('moveend', () => {
            this.mapEventHandler(this.ignorePan);
          });

          console.warn('... Hooking list to map ...');
          clearInterval(this.initInterval);
          this.initInterval = null;
          this.onChangeFilters();
          this.doSearch();
        }
      } catch (err) {
        let message = '... Waiting on SMK init to hook map events ...';
        if (err instanceof Error) {
message = err.message;
}

        console.warn(message);
      }
    }, 1000);
  }

  onTabChanged(event: MatTabChangeEvent) {
    this.onChangeFilters();
    this.doSearch();

    this.snowPlowHelper(this.url, {
      action: 'incident_tab_change',
      text: `${event.index}:${event.tab.textLabel}`,
    });
  }

  ngOnChanges(changes: SimpleChanges) {
    super.ngOnChanges(changes);
    if (changes.collection && changes.collection.currentValue) {
      this.isFirstPage = null;
      this.isLastPage = null;
      const collection = changes.collection.currentValue;
      if (
        collection.pageNumber === 1 &&
        collection.pageNumber === collection.totalPageCount
      ) {
        //total results less than pageRowCount:10, no need for pagination
        this.isFirstPage = 'FIRST';
        this.isLastPage = 'LAST';
      } else if (collection.pageNumber === 1) {
        //first page
        this.isFirstPage = 'FIRST';
        this.isLastPage = null;
      } else if (collection.pageNumber === collection.totalPageCount) {
        //last page
        this.isFirstPage = null;
        this.isLastPage = 'LAST';
      }
    }
  }

  ngOnInit() {
    this.updateView();
    this.config = this.getPagingConfig();
    this.baseRoute = this.router.url;
    this.componentId = LOAD_WILDFIRES_COMPONENT_ID;
    this.useMyCurrentLocation();
    // trigger the bind events after a slight delay
    // otherwise the interval for syncing with SMK
    // won't always fire
    setTimeout(() => {
      this.bindMapEvents();
    }, 3000);

    this.cdrScan = setInterval(() => {
      this.cdr.markForCheck();
    }, 5000);

    this.getAreaRestrictions();
    this.getEvacOrders();
  }

  async useMyCurrentLocation() {
    this.searchText = undefined;

    const location =
      await this.commonUtilityService.getCurrentLocationPromise();
    if (location) {
      this.currentLat = Number(location.coords.latitude);
      this.currentLong = Number(location.coords.longitude);
    }
  }

  doSearch() {
    if (
      !this.activeWildfiresInd &&
      !this.outWildfiresInd &&
      !this.newFires &&
      !this.wildfiresOfNoteInd
    ) {
      this.collectionData = [];
      this.collection = null;
      this.searchState = null;
      this.loading = false;
      this.summaryString = 'No records to display.';
      this.isFirstPage = 'FIRST';
      this.isLastPage = 'LAST';
      setTimeout(() => {
        this.cdr.detectChanges();
      });
      return;
    }

    let bbox;
    // Fetch the maps bounding box
    this.loading = true;
    try {
      const viewer = getActiveMap().$viewer;
      const map = viewer.map;
      const bounds = map.getBounds();
      bbox = `${bounds._northEast.lng},${bounds._northEast.lat},${bounds._southWest.lng},${bounds._southWest.lat}`;
      // this.onChangeFilters()  // why is this here? It will reset the pagination?!?
    } catch (err) {
      console.log('SMK initializing... wait to fetch bounds.');
    }

    // set stages of control to return
    const stageOfControlList = [];
    if (this.outWildfiresInd) {
      stageOfControlList.push('OUT');
    }
    if (this.activeWildfiresInd) {
      stageOfControlList.push('OUT_CNTRL');
      stageOfControlList.push('HOLDING');
      stageOfControlList.push('UNDR_CNTRL');
    }

    // We use a boolean in the postgres model so this shouldn't be needed
    //if(this.wildfiresOfNoteInd) {
    //  stageOfControlList.push('FIRE_OF_NOTE')
    //}

    this.store.dispatch(
      searchWildfires(
        this.componentId,
        {
          pageNumber: this.config.currentPage,
          pageRowCount: 10,
          sortColumn: this.currentSort,
          sortDirection: this.currentSortDirection,
          query: undefined,
        },
        undefined,
        this.wildfiresOfNoteInd,
        stageOfControlList,
        this.newFires,
        bbox,
        this.displayLabel,
        undefined,
        undefined,
        undefined,
        () => {
          this.loading = false;
          this.cdr.detectChanges();
        },
      ),
    );

    // set a timeout to turn of the loading indicator
    setTimeout(() => {
      this.loading = false;
      this.cdr.detectChanges();
    }, 5000);
  }

  stageOfControlChanges(event: MatCheckboxChange) {
    this.snowPlowHelper(this.url, {
      action: 'incident_list_options',
      text: `${event.source.ariaLabel.toUpperCase()}-${event.checked}`,
    });
    this.onChangeFilters();
    this.doSearch();
  }

  calculateDistance(lat: number, long: number): string {
    let result = '---';
    if (lat && long && this.currentLat && this.currentLong) {
      result = (
        haversineDistance(lat, this.currentLat, long, this.currentLong) / 1000
      ).toFixed(2);
    }
    return result;
  }

  public Number(value: string): number {
    return Number(value);
  }

  private handlePanelEnter(incident: any) {
    // force an exit cleanup
    this.onPanelMouseExit(null);
    this.ignorePan = true;
    if (this.ignorePanDebounce) {
      clearTimeout(this.ignorePanDebounce);
      this.ignorePanDebounce = null;
    }

    this.viewer = getActiveMap().$viewer;
    this.map = this.viewer.map;

    if (this.lastPanned !== incident.incidentName) {
      this.progressValues.set(incident.incidentName, 0);
      this.mapPanProgressBar = setInterval(() => {
        this.progressValues.set(
          incident.incidentName,
          this.progressValues.get(incident.incidentName) + 10,
        );
        if (this.progressValues.get(incident.incidentName) >= 100) {
          this.lastPanned = incident.incidentName;
          this.viewer.panToFeature(
            window['turf'].point([incident.longitude + 1, incident.latitude]),
            this.map._zoom,
          );
          clearInterval(this.mapPanProgressBar);
          this.mapPanProgressBar = null;
        }
        this.cdr.detectChanges();
      }, 100);
    }

    this.addMarker(incident);
  }

  private addMarker(incident: any) {
    const pointerIcon = L.divIcon({
      iconSize: [20, 20],
      iconAnchor: [12, 12],
      popupAnchor: [10, 0],
      shadowSize: [0, 0],
      className: 'animated-icon',
    });

    if (this.marker) {
      this.marker.remove();
      this.marker = null;
    }

    this.marker = L.marker(
      [Number(incident.latitude), Number(incident.longitude)],
      { icon: pointerIcon },
    );
    this.marker.on('add', function() {
      const icon: any = document.querySelector('.animated-icon');
      

      if (incident.fireOfNoteInd) {
        icon.style.backgroundColor = '#aa0d0d';
      } else if (incident.stageOfControlCode === 'OUT_CNTRL') {
        icon.style.backgroundColor = '#FF0000';
      } else if (incident.stageOfControlCode === 'HOLDING') {
        icon.style.backgroundColor = '#FFFF00';
      } else if (incident.stageOfControlCode === 'UNDR_CNTRL') {
        icon.style.backgroundColor = '#98E600';
      }

      if (this.markerAnimation) {
        clearInterval(this.markerAnimation);
      }

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
    this.marker.addTo(this.map);
  }

  onPanelMouseEnter(incident: any) {
    if (this.map) {
      // clear any existing timer
      if (this.handlePanelEnterTimeout) {
        clearTimeout(this.handlePanelEnterTimeout);
      }

      // debounce on mouse enter
      this.handlePanelEnterTimeout = setTimeout(() => {
        this.handlePanelEnter(incident);
      }, 500);
    }
  }

  onPanelMouseExit(incident: any) {
    if (this.handlePanelEnterTimeout) {
      clearTimeout(this.handlePanelEnterTimeout);
    }
    if (this.mapPanProgressBar) {
      clearInterval(this.mapPanProgressBar);
      this.mapPanProgressBar = null;
    }
    if (this.markerAnimation) {
      clearInterval(this.markerAnimation);
    }
    if (incident) {
      this.progressValues.set(incident.incidentName, 0);
    } else {
      for (const key of this.progressValues.keys()) {
        this.progressValues.set(key, 0);
      }
    }
    this.highlightLayer.clearLayers();
    if (this.marker) {
      this.marker.remove();
      this.marker = null;
    }

    if (this.ignorePanDebounce) {
      clearTimeout(this.ignorePanDebounce);
    }
    this.ignorePanDebounce = setTimeout(() => {
      this.ignorePan = false;
      this.ignorePanDebounce = null;
    }, 1000);
  }

  openPreview(incident: any) {
    this.onPanelMouseEnter(incident);

    this.snowPlowHelper(this.url, {
      action: 'wildfire_list_click',
      text: incident.incidentName,
      id: incident.incidentNumberLabel,
    });
    this.wildfirePanelContainer.clear();
    const componentFactory = this.componentFactoryResolver.resolveComponentFactory(WildfirePreviewComponent);
    const componentRef = this.wildfirePanelContainer.createComponent(componentFactory);
    componentRef.instance.setContent(incident);
  
    const panel = document.getElementsByClassName('desktop-preview').item(0) as HTMLElement;
    panel.innerHTML = '';
    panel.appendChild(componentRef.location.nativeElement);
    panel.style.display = 'block';
  }

  makeComponent<C>(component: Type<C>): ComponentRef<C> {
    if (this.componentRef) {
      this.componentRef.destroy();
    }
    if (this.listIdentifyContainer) {
      this.listIdentifyContainer.clear();
    }
    this.componentRef = this.listIdentifyContainer.createComponent(
      this.componentFactoryResolver.resolveComponentFactory(component),
    );
    return this.componentRef;
  }

  onWatchlist(incident: any): boolean {
    return this.watchlistService
      .getWatchlist()
      .includes(incident.fireYear + ':' + incident.incidentNumberLabel);
  }

  addToWatchlist(incident: any) {
    this.watchlistService.saveToWatchlist(
      incident.fireYear,
      incident.incidentNumberLabel,
    );
  }

  removeFromWatchlist(incident: any) {
    this.watchlistService.removeFromWatchlist(
      incident.fireYear,
      incident.incidentNumberLabel,
    );
  }

  onClickBookmark(event: Event) {
    event.stopPropagation();
  }

  openlink(url: string) {
    this.snowplow('outbound_click', url);
    window.open(url, '_blank');
  }

  async snowplow(action: string, link: string, area: string | null = null) {
    const url =
      this.appConfigService.getConfig().application.baseUrl.toString() +
      this.router.url.slice(1);
    const snowPlowPackage = {
      action: action.toLowerCase(),
      text: link,
    };

    if (area) {
      snowPlowPackage['area'] = area;
    }

    this.snowPlowHelper(url, snowPlowPackage);
  }

  convertToDate(value: string) {
    if (value) {
      return moment(value).format('YYYY-MM-DD HH:mm:ss');
    }
  }

  getEvacOrders() {
    this.agolService
      .getEvacOrders(null, null, {
        returnCentroid: true,
        returnGeometry: false,
      })
      .subscribe((response) => {
        if (response.features) {
          for (const element of response.features) {
            this.evacOrders.push({
              eventName: element.attributes.EVENT_NAME,
              eventType: element.attributes.EVENT_TYPE,
              orderAlertStatus: element.attributes.ORDER_ALERT_STATUS,
              issuingAgency: element.attributes.ISSUING_AGENCY,
              preOcCode: element.attributes.PREOC_CODE,
              emrgOAAsysID: element.attributes.EMRG_OAA_SYSID,
              centroid: element.centroid,
              issuedOn: this.convertToDate(element.attributes.DATE_MODIFIED),
            });
          }
        }
      });
  }

  getAreaRestrictions() {
    this.agolService
      .getAreaRestrictions(null, null, {
        returnCentroid: true,
        returnGeometry: false,
      })
      .subscribe((response) => {
        if (response.features) {
          for (const element of response.features) {
            this.areaRestrictions.push({
              protRsSysID: element.attributes.PROT_RA_SYSID,
              name: element.attributes.NAME,
              accessStatusEffectiveDate:
                element.attributes.ACCESS_STATUS_EFFECTIVE_DATE,
              fireCentre: element.attributes.FIRE_CENTRE_NAME,
              fireZone: element.attributes.FIRE_ZONE_NAME,
              bulletinUrl: element.attributes.BULLETIN_URL,
              centroid: element.centroid,
            });
          }
        }
      });
  }

  zoomToEvac(evac) {
    this.snowplow(
      `${evac.orderAlertStatus}_list_click`,
      `${evac.emrgOAAsysID}:${evac.eventName}`,
      evac.issuingAgency,
    );
    this.mapConfigService.getMapConfig().then(() => {
      const viewer = getActiveMap().$viewer;
      viewer.panToFeature(
        window['turf'].point([evac.centroid.x, evac.centroid.y]),
        12,
      );
    });
  }

  zoomToArea(area) {
    this.snowplow(
      'area_restriction_map_click',
      `${area.protRsSysID}:${area.name}`,
    );
    this.mapConfigService.getMapConfig().then(() => {
      const viewer = getActiveMap().$viewer;
      viewer.panToFeature(
        window['turf'].point([area.centroid.x, area.centroid.y]),
        12,
      );
    });
  }
}
