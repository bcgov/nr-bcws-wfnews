import {
  ChangeDetectorRef,
  Component,
  Input,
  OnChanges,
  OnDestroy,
  SimpleChanges,
  ViewChild,
} from '@angular/core';
import { IdentifyActionsService } from '@app/services/identify-actions.service';
import { MapConfigService } from '@app/services/map-config.service';
import { PointIdService } from '@app/services/point-id.service';
import { PublishedIncidentService } from '@app/services/published-incident-service';
import {
  addMarker,
  clearMarker,
  pingMarkerAgain,
  getActiveMap,
  hidePanel,
  showPanel,
} from '@app/utils';
import {
  IdentifyResults,
  LOCAL_AUTHORITY_LAYER_IDS,
  WILDFIRE_LAYER_IDS,
  clearIdentifyOnMap,
  groupIdentifyResults,
  identifyKind,
  identifyTitle,
} from '@app/utils/identify-results';
import { pinDropElement } from '@app/utils/map-markers';
import { coordsToExtent, flashArea, highlightArea, pingPoint, polygonRings } from '@app/utils/preview-map';
import { MobileSlidingDrawerComponent } from '../common/mobile-sliding-drawer/mobile-sliding-drawer.component';
import { IncidentLoad } from '../identify-results/identify-card/identify-card.component';
import * as turf from '@turf/turf';
import { Observable } from 'rxjs';
import { timeout } from 'rxjs/operators';

// After this, a detail or an area that has not come is given up, so it cannot move the map later.
const DETAIL_TIMEOUT_MS = 10000;
// Room round a fitted area: the layer buttons sit on the top of the map.
const FOCUS_PADDING = { top: 88, side: 32, bottom: 24 };
// Below this, the Drawer covers so much that a fit would only zoom far out.
const MIN_FOCUS_HEIGHT = 48;

@Component({
  selector: 'wfnews-identify-drawer',
  templateUrl: './identify-drawer.component.html',
  styleUrls: ['./identify-drawer.component.scss'],
})
export class IdentifyDrawerComponent implements OnChanges, OnDestroy {
  @Input() incidentRefs: any[];
  @ViewChild(MobileSlidingDrawerComponent) drawer: MobileSlidingDrawerComponent;

  currentIncidentRefs: any[];
  storedIncidentRefs: any[];
  results: IdentifyResults = groupIdentifyResults([]);
  showPanel: boolean;
  allowBackToIncidentsPanel: boolean;
  identifyItem: any;
  identifyIncident: any = {};
  pinDrop: any;
  defaultZoomLevel = 13;
  addMarker = addMarker;
  clearMarker = clearMarker;
  pingMarkerAgain = pingMarkerAgain;

  removeIdentity = false;
  incidentLoad: IncidentLoad = null;

  private previousZoom: number;
  private selection = 0;
  private zoomRequest = 0;
  private watchedMap: any;
  // The area the map is fitted to, so a new Drawer height can fit it again.
  private focus: { extent: number[]; maxZoom?: number } | null = null;
  private focusDrawerHeight = -1;
  constructor(
    private publishedIncidentService: PublishedIncidentService,
    private cdr: ChangeDetectorRef,
    private mapConfigService: MapConfigService,
    private actions: IdentifyActionsService,
    private pointIdService: PointIdService,
  ) {}

  ngOnDestroy(): void {
    this.clearMarker();
    this.watchedMap?.off('movestart', this.onMapMoveStart);
  }

  ngOnChanges(changes: SimpleChanges) {
    if (
      !this.removeIdentity ||
      (changes?.incidentRefs?.currentValue &&
        changes.incidentRefs.currentValue.length > 0)
    ) {
      this.removeIdentity = false;
      this.showPanel = false;
      this.identifyIncident = null;
      this.incidentLoad = null;
      this.newSelection();

      const incidentRefs = changes?.incidentRefs?.currentValue;
      if (incidentRefs) {
        this.currentIncidentRefs = incidentRefs;
        this.focusTapPoint();
        this.handleLayersSelection();
      }
    }
  }

  async handleLayersSelection(returnFromPreiviewPanel: boolean = false) {
    this.clearMarker();
    if (returnFromPreiviewPanel && this.storedIncidentRefs) {
      // clicked back from preiview panel
      this.currentIncidentRefs = this.storedIncidentRefs;
    }

    if (this.currentIncidentRefs.length === 1 && this.allowBackToIncidentsPanel) {
      // only show preview detial if it is through openPreviewPanel(). We will always the preview list page by clicking on map, even there is only single item.
      this.showPanel = true;
      showPanel('identify-panel-wrapper');
      hidePanel('desktop-preview');
      // Passing no geometry empties the acetate.
      getActiveMap().showFeature('area-highlight');
      if (this.pinDrop) {
        getActiveMap().showFeature('pin-drop');
        this.pinDrop = false;
      }

      this.identifyItem = this.currentIncidentRefs[0];
      if (this.identifyItem.layerId === 'weather-stations') {
        // The parent is OnPush, so the card does not update on its own.
        this.pointIdService
          .loadStationWeather(this.identifyItem)
          .then(() => this.cdr.markForCheck());
      }
      this.newSelection();
      if (this.incidentKey(this.identifyItem)) {
        this.loadIncident();
      } else if (
        ['weather-stations', 'danger-rating'].some((str) => this.identifyItem.layerId.includes(str))
      ) {
        // Nothing on the map marks a station or a rating zone, so a zoom would look random.
      } else if (
        ['bans-and-prohibitions', 'evacuation-orders-and-alerts', 'area-restrictions'].some(str => this.identifyItem.layerId.includes(str))
      ) {
        this.zoomIn(getActiveMap().$viewer.map.getZoom());
      } else {
        this.zoomIn(this.defaultZoomLevel);
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
      showPanel('identify-panel-wrapper');
      hidePanel('desktop-preview');
      this.results = groupIdentifyResults(this.currentIncidentRefs);
    }
  }

  private incidentKey(item: any): { incidentNumber: string; fireYear: string } | null {
    const incidentNumber =
      item?.layerId === 'fire-perimeters' ? item.properties?.FIRE_NUMBER : item?.properties?.incident_number_label;
    const fireYear =
      item?.layerId === 'fire-perimeters' ? item.properties?.FIRE_YEAR : item?.properties?.fire_year;
    return incidentNumber && fireYear ? { incidentNumber, fireYear } : null;
  }

  // Not awaited by the caller, so the card shows the title at once and the details when they come.
  async loadIncident() {
    const key = this.incidentKey(this.identifyItem);
    if (!key) {
      return;
    }
    const selection = this.selection;
    const zoomRequest = this.zoomRequest;
    this.incidentLoad = 'loading';
    this.cdr.markForCheck();
    let result: any;
    let unpublished = false;
    try {
      result = await this.publishedIncidentService
        .fetchPublishedIncident(key.incidentNumber, key.fireYear)
        .pipe(timeout(DETAIL_TIMEOUT_MS))
        .toPromise();
    } catch (error) {
      console.error('Unable to identify', error);
      // A 404 means the fire has no published Incident, so a retry cannot help.
      unpublished = error?.status === 404;
    }
    if (selection !== this.selection) {
      return;
    }
    this.identifyIncident = result ?? null;
    this.incidentLoad = result ? 'done' : unpublished ? 'unavailable' : 'failed';
    if (result) {
      this.addMarker(result);
    }
    if (zoomRequest === this.zoomRequest) {
      this.zoomIn(this.defaultZoomLevel);
    }
    this.cdr.markForCheck();
  }

  // A new selection, or a close, makes every answer still on its way out of date.
  private newSelection() {
    this.selection++;
    this.zoomRequest++;
    this.focus = null;
    this.watchMapGestures();
  }

  // Keeps the tapped place above the Drawer. A zoom to the item replaces this.
  private focusTapPoint() {
    const point = this.currentIncidentRefs?.[0]?._identifyPoint;
    if (!point?.longitude || !point?.latitude) {
      return;
    }
    let zoom: number;
    try {
      zoom = getActiveMap().$viewer.map.getZoom();
    } catch {
      return;
    }
    const x = Number(point.longitude);
    const y = Number(point.latitude);
    this.fitFocus([x, y, x, y], zoom);
  }

  private fitFocus(extent: number[], maxZoom?: number) {
    this.focus = { extent, maxZoom };
    this.refitFocus();
  }

  // Fits the area in the part of the map that the Drawer does not cover.
  private refitFocus() {
    let map: any;
    try {
      map = getActiveMap()?.$viewer?.map;
    } catch {
      return;
    }
    if (!map || !this.focus) {
      return;
    }
    const drawerHeight = this.drawer?.restingHeight() ?? 0;
    this.focusDrawerHeight = drawerHeight;
    const box = map.getContainer().getBoundingClientRect();
    const covered = Math.max(0, box.bottom - (window.innerHeight - drawerHeight));
    const bottom = covered + FOCUS_PADDING.bottom;
    if (box.height - bottom - FOCUS_PADDING.top < MIN_FOCUS_HEIGHT) {
      return;
    }
    const [west, south, east, north] = this.focus.extent;
    map.fitBounds(
      [[west, south], [east, north]],
      {
        padding: { top: FOCUS_PADDING.top, left: FOCUS_PADDING.side, right: FOCUS_PADDING.side, bottom },
        // An undefined maxZoom replaces MapLibre's default and makes the camera NaN.
        ...(this.focus.maxZoom !== undefined && { maxZoom: this.focus.maxZoom }),
        duration: 500,
      },
    );
  }

  onDrawerRest(height: number) {
    if (this.focus && height !== this.focusDrawerHeight) {
      this.refitFocus();
    }
  }

  // A zoom that arrives after the user moved the map would take the map away from them.
  private watchMapGestures() {
    let map: any;
    try {
      map = getActiveMap()?.$viewer?.map;
    } catch {
      return;
    }
    if (!map || map === this.watchedMap) {
      return;
    }
    this.watchedMap?.off('movestart', this.onMapMoveStart);
    this.watchedMap = map;
    map.on('movestart', this.onMapMoveStart);
  }

  private onMapMoveStart = (event: any) => {
    if (event?.originalEvent) {
      this.zoomRequest++;
      this.focus = null;
    }
  };

  isOpen(): boolean {
    return this.showPanel && this.currentIncidentRefs?.length >= 1;
  }

  drawerTitle(): string {
    if (!this.identifyItem) {
      const count = this.currentIncidentRefs?.length ?? 0;
      return `${count} ${count === 1 ? 'Result' : 'Results'}`;
    }
    return identifyTitle(this.identifyItem);
  }

  hasFullDetails(): boolean {
    const layerId: string = this.identifyItem?.layerId ?? '';
    return (
      !this.shareableLayers() ||
      layerId === 'area-restrictions' ||
      layerId.includes('bans-and-prohibitions')
    );
  }

  closePanel() {
    clearIdentifyOnMap();
    if (this.pinDrop) {
      getActiveMap().showFeature('pin-drop');
      this.pinDrop = false;
    }

    this.showPanel = false;
    this.allowBackToIncidentsPanel = false;
    this.identifyIncident = {};
    this.incidentLoad = null;
    this.newSelection();
    this.clearMarker();
    this.cdr.markForCheck();
  }

  zoomToClicked() {
    // A full-height Drawer leaves no map to fit into.
    this.drawer?.uncoverMap();
    this.zoomIn(undefined, true);
  }

  /** With ping, the item rings or flashes, so the button answers when the map is already there. */
  zoomIn(level?: number, ping = false) {
    this.previousZoom = getActiveMap().$viewer.map.getZoom();
    const zoomRequest = this.zoomRequest;
    const current = () => zoomRequest === this.zoomRequest;
    let long;
    let lat;
    if (this.identifyIncident?.longitude && this.identifyIncident?.latitude) {
      const x = Number(this.identifyIncident.longitude);
      const y = Number(this.identifyIncident.latitude);
      this.fitFocus([x, y, x, y], level ? level : this.defaultZoomLevel);
      this.pingMarkerAgain();
      return;
    }
    if (this.identifyItem?.geometry?.type === 'Point' && WILDFIRE_LAYER_IDS.includes(this.identifyItem.layerId)) {
      // The fire itself, not the place the user tapped near it.
      long = Number(this.identifyItem.geometry.coordinates[0]);
      lat = Number(this.identifyItem.geometry.coordinates[1]);
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
      const fitPoint = () => {
        if (current()) {
          this.fitFocus([long, lat, long, lat], level || this.defaultZoomLevel);
          if (ping) {
            pingPoint(getActiveMap(), long, lat);
          }
        }
      };
      // Without the area, the point still moves the map, so the button is never dead.
      const fitRings = (rings: number[][][] | undefined) => {
        if (!this.fixPolygonToMap(rings?.flat() ?? [])) {
          fitPoint();
        } else if (ping) {
          flashArea(getActiveMap(), rings);
        }
      };
      const fitArea = (request: Observable<number[][][] | undefined>, what: string) =>
        request
          .pipe(timeout(DETAIL_TIMEOUT_MS))
          .toPromise()
          .then((rings) => {
            if (!current()) {
              return;
            }
            fitRings(rings);
          })
          .catch((error) => {
            console.error(`Unable to zoom to the ${what}`, error);
            fitPoint();
          });
      this.mapConfigService.getMapConfig().then(() => {
        if (!current()) {
          return;
        }
        const layerId = this.identifyItem?.layerId;
        // A MultiPolygon is one level deeper than a Polygon.
        const identifyRings = polygonRings(this.identifyItem?.geometry);
        const agolArea = this.actions.agolArea(this.identifyItem);
        if (layerId && ['drive-bc-active-events', 'closed-recreation-site'].some(str => layerId.includes(str))) {
          const coords = this.identifyItem?.geometry?.coordinates;
          if (coords) {
            this.fitFocus([coords[0], coords[1], coords[0], coords[1]], this.defaultZoomLevel);

            // showFeature replaces the acetate each call, so the old pin goes.
            getActiveMap().showFeature(
              'pin-drop',
              turf.point([coords[0], coords[1]]),
              { htmlMarker: () => pinDropElement() },
            );
            this.pinDrop = true;
            if (ping) {
              pingPoint(getActiveMap(), coords[0], coords[1]);
            }
          }
        } else if (identifyRings && agolArea) {
          // The identify already holds the area. The AGOL copy of one ban can be 6 MB.
          fitRings(identifyRings);
        } else if (agolArea) {
          fitArea(agolArea, identifyKind(this.identifyItem).replace('-', ' '));
        } else if (LOCAL_AUTHORITY_LAYER_IDS.includes(layerId) || layerId?.includes('protected-lands-access-restrictions')) {
          fitRings(identifyRings);
        } else {
          // A point with nothing better to fit, for example an incident whose details did not load.
          fitPoint();
        }
      });
    }
  }

  openPreviewPanel(item) {
    this.allowBackToIncidentsPanel = true;
    this.storedIncidentRefs = this.currentIncidentRefs;
    // capture the identify panel list;
    this.identifyItem = item;
    // A stale incident would show the last fire and steer zoomIn to it.
    this.identifyIncident = null;
    this.incidentLoad = null;
    this.currentIncidentRefs = [item];
    this.cdr.markForCheck();
    this.handleLayersSelection();
  }

  backToIdentifyPanel() {
    this.newSelection();
    this.zoomIn(this.previousZoom);
    this.allowBackToIncidentsPanel = false;
    this.handleLayersSelection(true);
  }

  enterFullDetail() {
    this.actions.openPhoneDetails(this.identifyItem);
  }

  openDriveBc() {
    window.open(this.actions.driveBcUrl(this.identifyItem), '_blank');
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
        LOCAL_AUTHORITY_LAYER_IDS.includes(this.identifyItem.layerId))
    ) {
      return true;
    }
  }

  /** False when the data has no area to fit. */
  fixPolygonToMap(polygonData): boolean {
    const extent = coordsToExtent(polygonData);
    if (extent) {
      this.fitFocus(extent);
    }
    // The area keeps its own map colours; Zoom to marks it with a glow instead.
    highlightArea(getActiveMap());
    return !!extent;
  }
}
