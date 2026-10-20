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
              if (location) {
                self.zone.run(() => self.identifyState.emit('searching'));
              }
            });

            smk.$viewer.finishedIdentify(({ location }) => {
              // A clear also ends an identify. It has no location, and it must
              // not close the panel that made it.
              if (!location) {
                return;
              }
              self.loadStationWeather(smk);
              self.addSelectedIncidentPanels(smk);
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

  addSelectedIncidentPanels(smk) {
    const self = this;
    const identified = smk.$viewer.identified;
    const map = smk.$viewer.map;

    // SMK identifies outside the Angular zone, so an emit from here changes
    // nothing on screen unless it runs inside it.
    function handleTimeout() {
      self.zone.run(() => {
        self.selectIncidents.emit(identified.featureSet);
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
}

function clone(o) {
  return JSON.parse(JSON.stringify(o));
}
