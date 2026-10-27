import { ChangeDetectorRef, Component, OnDestroy } from '@angular/core';
import { IdentifyActionsService, currentView } from '@app/services/identify-actions.service';
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
} from '@app/utils';
import { IdentifyKind, identifyKind, identifyTitle } from '@app/utils/identify-results';
import { pinDropElement } from '@app/utils/map-markers';
import { pingPoint } from '@app/utils/preview-map';
import * as turf from '@turf/turf';
import { IncidentLoad } from '../identify-card/identify-card.component';

// The old previews of these kept a rounder panel, a card bottom margin and a tighter button row.
const COMPACT: IdentifyKind[] = ['area-restriction', 'ban', 'danger-rating', 'protected-land'];
const DETAILS: IdentifyKind[] = ['wildfire', 'evacuation', 'area-restriction', 'ban', 'danger-rating'];
// Nothing on the map marks a station or a rating zone, so a zoom would look random.
const NO_ZOOM: IdentifyKind[] = ['weather-station', 'danger-rating'];

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
  readonly clearLocationPin = clearLocationPin;

  constructor(
    private cdr: ChangeDetectorRef,
    private actions: IdentifyActionsService,
    private publishedIncidentService: PublishedIncidentService,
  ) {}

  ngOnDestroy(): void {
    this.clearMarker();
    this.clearLocationPin();
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
    } else if (!NO_ZOOM.includes(this.kind)) {
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
    const item = this.item;
    const before = currentView();
    this.actions.zoomTarget(item, this.incident).then((target) => {
      if (!target || item !== this.item) {
        return;
      }
      this.actions.cardZoomed(before);
      if (target.type === 'area') {
        this.actions.fitArea(target.rings);
        return;
      }
      const [x, y] = target.point;
      getActiveMap().$viewer.panToFeature(turf.point([x, y]), this.defaultZoomLevel);
      if (target.type === 'incident') {
        this.pingMarkerAgain();
        return;
      }
      if (target.type === 'pin') {
        getActiveMap().showFeature('pin-drop', turf.point([x, y]), { htmlMarker: () => pinDropElement() });
        this.pinDrop = true;
      } else {
        pingPoint(getActiveMap(), x, y);
      }
    });
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
    this.actions.backToList();
    this.clearMarker();
    showPanel('identify-panel-wrapper');
    hidePanel('desktop-preview');
  }
}
