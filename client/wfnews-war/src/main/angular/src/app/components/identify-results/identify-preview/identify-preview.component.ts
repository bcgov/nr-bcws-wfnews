import { ChangeDetectorRef, Component, OnDestroy } from '@angular/core';
import { IdentifyActionsService } from '@app/services/identify-actions.service';
import { MapConfigService } from '@app/services/map-config.service';
import { PublishedIncidentService } from '@app/services/published-incident-service';
import {
  addMarker,
  clearLocationPin,
  clearMarker,
  displayItemTitle,
  getActiveMap,
  hidePanel,
  pingMarkerAgain,
  showPanel,
  zoomInWithLocationPin,
} from '@app/utils';
import { IdentifyKind, identifyKind, identifyTitle } from '@app/utils/identify-results';
import * as turf from '@turf/turf';
import { IncidentLoad } from '../identify-card/identify-card.component';

// The old previews of these kept a rounder panel, a card bottom margin and a tighter button row.
const COMPACT: IdentifyKind[] = ['area-restriction', 'ban', 'danger-rating', 'protected-land'];
const DETAILS: IdentifyKind[] = ['wildfire', 'evacuation', 'area-restriction', 'ban', 'danger-rating'];
const PIN_ZOOM: IdentifyKind[] = ['road-event', 'closed-recreation-site', 'forest-service-road'];

/** The desktop preview of one identify result, beside the identify list. */
@Component({
  selector: 'wfnews-identify-preview',
  templateUrl: './identify-preview.component.html',
  styleUrls: ['./identify-preview.component.scss'],
})
export class IdentifyPreviewComponent implements OnDestroy {
  item: any;
  incident: any;
  incidentLoad: IncidentLoad = null;
  // Read by the marker and pin helpers, which run with this component as `this`.
  pinDrop: boolean;
  selectedMarker: any;
  readonly addMarker = addMarker;
  readonly clearMarker = clearMarker;
  readonly pingMarkerAgain = pingMarkerAgain;
  readonly zoomInWithLocationPin = zoomInWithLocationPin;
  readonly clearLocationPin = clearLocationPin;

  constructor(
    private cdr: ChangeDetectorRef,
    private actions: IdentifyActionsService,
    private publishedIncidentService: PublishedIncidentService,
    // Read by zoomInWithLocationPin.
    public mapConfigService: MapConfigService,
  ) {}

  ngOnDestroy(): void {
    this.clearMarker();
    this.clearLocationPin();
  }

  /** zoomInWithLocationPin reads the record as `data`. */
  get data(): any {
    return this.item;
  }

  get defaultZoomLevel(): number {
    return this.kind === 'wildfire' ? 13 : 11;
  }

  get kind(): IdentifyKind | null {
    return identifyKind(this.item);
  }

  get compact(): boolean {
    return COMPACT.includes(this.kind);
  }

  get title(): string {
    if (this.kind === 'wildfire') {
      return this.incident ? displayItemTitle(this.item) : 'Wildfire';
    }
    return identifyTitle(this.item);
  }

  get hasDetails(): boolean {
    return DETAILS.includes(this.kind);
  }

  get showButtons(): boolean {
    return this.kind !== 'wildfire' || !!this.incident;
  }

  setContent(item: any) {
    this.item = item;
    if (this.kind === 'wildfire') {
      this.loadIncident();
    } else if (this.kind === 'evacuation' || this.kind === 'local-authority') {
      // These previews always moved the map to the area when they opened.
      this.zoomIn();
    }
  }

  private async loadIncident() {
    this.incidentLoad = 'loading';
    this.cdr.detectChanges();
    const p = this.item.properties;
    const perimeter = this.item.layerId === 'fire-perimeters';
    const incidentNumber = perimeter ? p?.FIRE_NUMBER : p?.incident_number_label || this.item.incidentNumberLabel;
    const fireYear = perimeter ? p?.FIRE_YEAR : p?.fire_year || this.item.fireYear;
    if (incidentNumber && fireYear) {
      try {
        this.incident = await this.publishedIncidentService.fetchPublishedIncident(incidentNumber, fireYear).toPromise();
        this.zoomIn();
        this.addMarker(this.incident);
        this.cdr.markForCheck();
      } catch (error) {
        console.error('Unable to identify', error);
      }
    }
    this.incidentLoad = this.incident ? 'done' : 'unavailable';
    this.cdr.markForCheck();
  }

  zoomIn() {
    const kind = this.kind;
    if (kind === 'wildfire') {
      const long = Number(this.incident?.longitude);
      const lat = Number(this.incident?.latitude);
      if (long && lat) {
        this.mapConfigService.getMapConfig().then(() => {
          getActiveMap().$viewer.panToFeature(turf.point([long, lat]), this.defaultZoomLevel);
          this.pingMarkerAgain();
        });
      }
    } else if (PIN_ZOOM.includes(kind)) {
      this.zoomInWithLocationPin();
    } else if (kind === 'protected-land' || kind === 'local-authority') {
      this.actions.fitIdentifyGeometry(this.item);
    } else {
      this.actions.agolArea(this.item)?.toPromise().then((rings) => {
        if (rings?.length) {
          this.actions.fitArea(rings);
        }
      });
    }
  }

  openDetails() {
    this.actions.openDesktopDetails(this.item, this.incident);
  }

  openDriveBc() {
    window.open(this.actions.driveBcUrl(this.item), '_blank');
  }

  closePanel() {
    this.clearMarker();
    hidePanel('desktop-preview');
  }

  goBack() {
    this.clearMarker();
    showPanel('identify-panel-wrapper');
    hidePanel('desktop-preview');
  }
}
