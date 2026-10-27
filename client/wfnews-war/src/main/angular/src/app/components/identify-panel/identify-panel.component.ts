import { ChangeDetectorRef, Component,ComponentFactoryResolver,Input,OnChanges,OnDestroy,SimpleChanges,ViewChild, ViewContainerRef } from '@angular/core';
import {
  FOCUS_DURATION_MS,
  IdentifyActionsService,
  TAP_MAX_ZOOM,
  tapCircleExtent,
} from '@app/services/identify-actions.service';
import { PointIdService } from '@app/services/point-id.service';
import {
  IdentifyResults,
  clearIdentifyOnMap,
  groupIdentifyResults,
  identifyKind,
} from '@app/utils/identify-results';
import { WeatherPanelComponent } from '@app/components/weather/weather-panel/weather-panel.component';
import { IdentifyPreviewComponent } from '@app/components/identify-results/identify-preview/identify-preview.component';
import { clearMarker, getActiveMap, hidePanel, showPanel } from '@app/utils';

// The list and the preview cover 345px on the left of the map; the layer buttons cover the top.
const FREE_MAP_PADDING = { top: 88, left: 345 + 32, right: 32, bottom: 32 };

@Component({
  selector: 'wfnews-identify-panel',
  templateUrl: './identify-panel.component.html',
  styleUrls: ['./identify-panel.component.scss']
})
export class IdentifyPanel implements OnChanges, OnDestroy {
  @Input() incidentRefs: any[];
  @ViewChild('weatherPanelContainer', { read: ViewContainerRef }) weatherPanelContainer: ViewContainerRef;
  @ViewChild('previewContainer', { read: ViewContainerRef }) previewContainer: ViewContainerRef;

  currentIncidentRefs: any[];
  results: IdentifyResults = groupIdentifyResults([]);
  showPanel: boolean;
  clearMarker = clearMarker;

  constructor(
    private cdr: ChangeDetectorRef,
    private componentFactoryResolver: ComponentFactoryResolver,
    private pointIdService: PointIdService,
    private actions: IdentifyActionsService,
  ) {}

  ngOnDestroy(): void {
    this.clearMarker();
  }

  ngOnChanges(changes: SimpleChanges) {
    this.showPanel = false;

    const incidentRefs = changes?.incidentRefs?.currentValue;
    if (incidentRefs) {
      this.currentIncidentRefs = incidentRefs;
      this.showResults();
      this.zoomToTapCircle();
    }

    // A map click always shows the list; only a link to one incident opens it.
    // The preview containers sit under an ngIf, so wait for the list to render.
    if (this.currentIncidentRefs?.length == 1 && this.currentIncidentRefs[0].notification) {
      const item = this.currentIncidentRefs[0];
      setTimeout(() => this.enterPreview(item));
    }
  }

  showResults() {
    this.clearMarker();
    if (!this.currentIncidentRefs.length) {
      return;
    }
    this.showPanel = true;
    showPanel('identify-panel-wrapper');
    hidePanel('desktop-preview');
    this.results = groupIdentifyResults(this.currentIncidentRefs);
  }

  // Zooms in to the identify circle beside the list. It does not zoom out.
  private zoomToTapCircle() {
    const point = this.currentIncidentRefs[0]?._identifyPoint;
    if (!point?.longitude || !point?.latitude) {
      return;
    }
    const map = getActiveMap().$viewer.map;
    const zoom = map.getZoom();
    const [west, south, east, north] = tapCircleExtent(Number(point.longitude), Number(point.latitude), zoom);
    map.fitBounds([[west, south], [east, north]], {
      padding: FREE_MAP_PADDING,
      maxZoom: Math.max(zoom, TAP_MAX_ZOOM),
      duration: FOCUS_DURATION_MS,
    });
  }

  closePanel() {
    clearIdentifyOnMap();
    this.showPanel = false;
    this.clearMarker();
    this.cdr.markForCheck();
  }

  // Back from the list leaves identify for the BC view.
  backToBc() {
    this.closePanel();
    this.actions.showBc();
  }

  enterPreview(item: any) {
    this.actions.cardOpened();
    const kind = identifyKind(item);
    if (kind === 'weather-station') {
      this.handleWeatherStations(item);
    } else if (kind) {
      this.handlePreview(item);
    } else {
      console.error('Unknown layerId:', item.layerId);
    }

    // Hide the identify-panel-wrapper
    hidePanel('identify-panel-wrapper')

    this.cdr.markForCheck();
  }

  handleWeatherStations(item: any) {
    this.weatherPanelContainer.clear();

    const componentFactory = this.componentFactoryResolver.resolveComponentFactory(WeatherPanelComponent);
    const componentRef = this.weatherPanelContainer.createComponent(componentFactory);
    componentRef.instance.stationName = item.title;
    componentRef.changeDetectorRef.detectChanges();
    this.pointIdService.loadStationWeather(item).then((station) => {
      // The user may have opened another item before the weather arrived.
      if (!componentRef.hostView.destroyed) {
        componentRef.instance.setWeatherStation(station);
      }
    });

    const panel = document.getElementsByClassName('desktop-preview').item(0) as HTMLElement;
    panel.innerHTML = '';
    panel.appendChild(componentRef.location.nativeElement);
    panel.style.display = 'block';
  }

  handlePreview(item: any) {
    this.previewContainer.clear();
    const componentFactory = this.componentFactoryResolver.resolveComponentFactory(IdentifyPreviewComponent);
    const componentRef = this.previewContainer.createComponent(componentFactory);
    componentRef.instance.setContent(item);

    const panel = document.getElementsByClassName('desktop-preview').item(0) as HTMLElement;
    panel.innerHTML = '';
    panel.appendChild(componentRef.location.nativeElement);
    panel.style.display = 'block';
  }
}
