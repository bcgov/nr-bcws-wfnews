import {
  Component,
  EventEmitter,
  Injector,
  Input,
  NgZone,
  OnChanges,
  OnDestroy,
  Output,
  SimpleChanges,
  ViewChild,
} from '@angular/core';
import { hasOwn } from '@app/utils';
import { haversineDistance } from '@app/services/wfnews-map.service/util';
import { PointIdService } from '../../services/point-id.service';
import { WFMapService } from '../../services/wf-map.service';

let mapIndexAuto = 0;
let initPromise = Promise.resolve();

@Component({
  selector: 'wf-map-container',
  templateUrl: './wf-map-container.component.html',
  styleUrls: ['./wf-map-container.component.scss'],
})
export class WFMapContainerComponent implements OnDestroy, OnChanges {
  @Input() mapIndex = 0;
  @Input() mapConfig: Array<any>;

  @Output() mapInitialized = new EventEmitter<any>();
  @Output() toggleAccordion = new EventEmitter<any>();
  @Output() fullScreen = new EventEmitter<any>();
  @Output() selectIncidents = new EventEmitter<any>();
  @Output() identifyState = new EventEmitter<'searching' | null>();

  @ViewChild('mapContainer') mapContainer;

  private initPromise: Promise<any>; // = Promise.resolve()
  private mapIndexAuto;
  private zone: NgZone;
  // A new identify clears the results, so an older station must not be added to them.
  private identifyCount = 0;
  // A station that comes after its results were sent is too late to show.
  private sentIdentify = 0;

  constructor(
    protected wfMap: WFMapService,
    protected pointIdService: PointIdService,
    protected injector: Injector,
  ) {
    mapIndexAuto += 1;
    this.mapIndexAuto = mapIndexAuto;

    this.zone = this.injector.get(NgZone);
  }

  ngOnDestroy() {
    this.destroyMap();
  }

  ngOnChanges(changes: SimpleChanges): void {
      this.initMap();
  }

  initMap(): void {
    const self = this;
    const mapIndex = this.mapIndex || this.mapIndexAuto;
    const mapConfig = clone(this.mapConfig);

    if (!mapConfig) {
      return;
    }

    this.destroyMap();

    // initialize the map
    initPromise = initPromise
      .then(() => self.wfMap
          .createSMK({
            id: mapIndex,
            containerSel: self.mapContainer.nativeElement,
            config: mapConfig,
            toggleAccordion: self.toggleAccordion,
            fullScreen: self.fullScreen,
          })
          .then((smk) => {
            self.mapInitialized.emit(smk);

            // On this map's viewer, so each map gets only its own results.
            smk.$viewer.startedIdentify(({ location }) => {
              self.identifyCount += 1;
              if (location) {
                self.zone.run(() => self.identifyState.emit('searching'));
                // Loads alongside the identify, so the first click does not wait for it.
                stationList(smk);
              }
            });

            smk.$viewer.finishedIdentify(({ location }) => {
              // A clear also ends an identify. It has no location, and it must
              // not close the panel that made it.
              if (!location) {
                return;
              }
              self.loadStationWeather(smk);
              self.addSelectedIncidentPanels(smk, self.addNearestStation(smk, location));
            });

            return smk;
          }))
      .catch((e) => {
        console.warn(e);
      });

    this.initPromise = initPromise;
  }

  destroyMap(): void {
    if (!this.initPromise) {
      return;
    }

    this.initPromise = this.initPromise.then(function(smk) {
      if (!smk) {
        return;
      }

      smk.destroy();
    });
  }

  addSelectedIncidentPanels(smk, station: Promise<void> = Promise.resolve()) {
    const self = this;
    const identified = smk.$viewer.identified;
    const map = smk.$viewer.map;

    // SMK identifies outside the Angular zone, so an emit from here changes
    // nothing on screen unless it runs inside it.
    // A station later than STATION_WAIT_MS is left out: a second emit rebuilds the open list.
    function handleTimeout() {
      within(station, STATION_WAIT_MS).then(() => {
        self.sentIdentify = self.identifyCount;
        self.zone.run(() => {
          self.selectIncidents.emit(identified.featureSet);
        });
      });
    }

    // A zoom by the user means they moved on, so drop the panel for the old
    // point. SMK's pan to a single result also ends in zoomend, but has no
    // originalEvent.
    const cancel = (e) => {
      if (!e?.originalEvent) {
        return;
      }
      clearTimeout(delayTimer);
      map.off('zoomend', cancel);
      self.zone.run(() => self.identifyState.emit(null));
    };
    map.on('zoomend', cancel);

    const delayTimer = setTimeout(() => {
      map.off('zoomend', cancel);
      handleTimeout();
    }, 500);
  }

  // Start the weather now, so it is often ready before the user opens the
  // station. The panels show the station name until it arrives.
  loadStationWeather(smk) {
    const featureSet = smk.$viewer.identified.featureSet;
    this.zone.run(() => {
      for (const fid in featureSet) {
        if (hasOwn(featureSet, fid) && featureSet[fid].layerId === 'weather-stations') {
          this.pointIdService.loadStationWeather(featureSet[fid]);
        }
      }
    });
  }

  // When no station is under the click, the nearest one is shown, as 2.6.1 did.
  async addNearestStation(smk, location): Promise<void> {
    const viewer = smk.$viewer;
    const featureSet = viewer.identified.featureSet;
    const found = Object.keys(featureSet).some((fid) => featureSet[fid].layerId === STATION_LAYER);
    if (found || !viewer.isDisplayContextItemVisible?.(STATION_LAYER)) {
      return;
    }
    const identify = this.identifyCount;
    const stations = await stationList(smk);
    if (identify !== this.identifyCount || identify === this.sentIdentify) {
      return;
    }

    const { latitude, longitude } = location.map;
    let nearest = null;
    let best = Infinity;
    for (const s of stations) {
      const [lon, lat] = s.geometry.coordinates;
      const d = haversineDistance(latitude, lat, longitude, lon);
      if (d < best) {
        best = d;
        nearest = s;
      }
    }
    if (!nearest) {
      return;
    }

    // A copy, because the feature set and the weather write to the feature.
    const feature = { ...nearest, title: nearest.properties.STATION_NAME, _identifyPoint: location.map };
    viewer.identified.add(STATION_LAYER, [feature]);
    this.zone.run(() => this.pointIdService.loadStationWeather(feature));
  }
}

const STATION_LAYER = 'weather-stations';
const STATION_WAIT_MS = 500;

// One list per URL for every map: the WFS request SMK sends for a WMS identify, with no area.
const stationLists: Record<string, Promise<any[]>> = {};

function stationList(smk): Promise<any[]> {
  const cfg = smk.$viewer.layerId?.[STATION_LAYER]?.config;
  if (!cfg) {
    return Promise.resolve([]);
  }
  const params = new URLSearchParams({
    service: 'WFS',
    version: '1.1.0',
    request: 'GetFeature',
    srsName: 'EPSG:4326',
    typename: cfg.layerName,
    outputformat: 'application/json',
  });
  const url = cfg.serviceUrl + (cfg.serviceUrl.includes('?') ? '&' : '?') + params;
  stationLists[url] ??= fetch(url)
    .then((resp) => (resp.ok ? resp.json() : Promise.reject(resp.status)))
    .then((data) => data.features || [])
    .catch(() => {
      // The next identify tries again.
      delete stationLists[url];
      return [];
    });
  return stationLists[url];
}

function within(p: Promise<unknown>, ms: number): Promise<void> {
  return new Promise((resolve) => {
    const timer = setTimeout(resolve, ms);
    p.catch(() => {}).then(() => {
      clearTimeout(timer);
      resolve();
    });
  });
}

function clone(o) {
  return JSON.parse(JSON.stringify(o));
}
