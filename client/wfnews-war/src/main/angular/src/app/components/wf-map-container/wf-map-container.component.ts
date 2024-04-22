import {
  ChangeDetectorRef,
  Component,
  ComponentFactoryResolver,
  ComponentRef,
  EventEmitter,
  Injector,
  Input,
  NgZone,
  OnChanges,
  OnDestroy,
  Output,
  SimpleChanges,
  Type,
  ViewChild,
  ViewContainerRef,
} from '@angular/core';
import { CommonUtilityService } from '@app/services/common-utility.service';
import { PointIdService } from '../../services/point-id.service';
import { WFMapService } from '../../services/wf-map.service';
import { IncidentIdentifyPanelComponent } from '../incident-identify-panel/incident-identify-panel.component';
import { WeatherPanelComponent } from '../weather/weather-panel/weather-panel.component';

let mapIndexAuto = 0;
let initPromise = Promise.resolve();

@Component({
  selector: 'wf-map-container',
  templateUrl: './wf-map-container.component.html',
  styleUrls: ['./wf-map-container.component.scss'],
})
export class WFMapContainerComponent implements OnDestroy, OnChanges {
  @ViewChild('identifyContainer', { read: ViewContainerRef })
  identifyContainer: ViewContainerRef;
  @Input() mapIndex = 0;
  @Input() mapConfig: Array<any>;

  @Output() mapInitialized = new EventEmitter<any>();
  @Output() toggleAccordion = new EventEmitter<any>();
  @Output() fullScreen = new EventEmitter<any>();
  @Output() selectIncidents = new EventEmitter<any>();

  @ViewChild('mapContainer') mapContainer;

  private initPromise: Promise<any>; // = Promise.resolve()
  private mapIndexAuto;
  private lastClickedLocation;
  private zone: NgZone;
  private componentRef: ComponentRef<any>;

  constructor(
    protected wfMap: WFMapService,
    protected pointIdService: PointIdService,
    protected injector: Injector,
    protected cdr: ChangeDetectorRef,
    protected componentFactoryResolver: ComponentFactoryResolver,
    protected commonUtilityService: CommonUtilityService
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

            // force bc fire centres to the front
            // Note, this will move any active tile layer
            // over to the overlay pane on app startup. If the tile
            // is not active, it will not be moved
            // note: When we disable the tile layer, we can (and should) remove this
            smk.$viewer.map.eachLayer((lyr) => {
              if (lyr?._smk_id === 'bc-fire-centres') {
                lyr.bringToFront();
                lyr.options.pane = 'tileOverlay';
                let tileOverlay = smk.$viewer.map.getPane('tileOverlay');
                if (!tileOverlay) {
                  smk.$viewer.map.createPane('tileOverlay');
                  tileOverlay = smk.$viewer.map.getPane('tileOverlay');
                  //If you want to change the custom pane order,
                  // set tileOverlay.style.zIndex = ###; to whatever number makes sense
                }
                // this will move the initially visible layer over on init, as it will
                // be placed in the default div on app start. Not really a great way to
                // do this so we should implement a better solution for layer pane order
                // in smk directly. note that this requires the tile layer to be visible
                // by default
                const tilePanes = smk.$viewer.map.getPane('tilePane').childNodes;
                tileOverlay.appendChild(tilePanes[tilePanes.length - 1]);
              }
            });

            // enforce a max zoom setting, in case we're using cluster/heatmapping
            smk.$viewer.map._layersMaxZoom = 20;

            smk.$viewer.handlePick(3, (location) => {
              self.lastClickedLocation = location;
              // If the layer is visible only
              if (
                smk?.$viewer.displayContext.layers.itemId['weather-stations'] &&
                smk?.$viewer.displayContext.layers.itemId['weather-stations'][0]
                  .isVisible
              ) {
                self.addNearbyWeatherStation(smk);
                (
                  document
                    .getElementsByClassName('identify-panel')
                    .item(0) as HTMLElement
                ).style.display = 'none';
              }
            });

            self.wfMap.setIdentifyDoneCallback(() => {
              // Apply a delay to the identify complete callback
              // to allow for the weather station query to complete
              // this is primarily for Mobile, which doesn't append
              // the station to the identify results
              if (
                smk?.$viewer?.displayContext?.layers?.itemId['weather-stations'] &&
                smk?.$viewer?.displayContext?.layers?.itemId['weather-stations'][0].isVisible 
              ) {
                setTimeout(() => {
                  self.addSelectedIncidentPanels(smk);
                }, 1000);
                // setTimeout(() => {
                //   self.addNearbyWeatherStation(smk);
                // }, 1000);
              } else {
                // if the weather stations layer is turned off, we can ignore the debounce
                // and immediately execute
                self.addSelectedIncidentPanels(smk);
              }
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

    // Variable to store the timeout ID
    // Function to handle the timeout logic
    function handleTimeout() {
      self.selectIncidents.emit(identified.featureSet);
    }

    // Set a timeout to emit selectIncidents event after 500 milliseconds
    const delayTimer = setTimeout(handleTimeout, 500);

    // Listen for the zoomend event
    map.on('zoomend', () => {
      // Clear the timeout to prevent the selectIncidents event from being emitted
      clearTimeout(delayTimer);
    });

    let lastFeature;
    let featureCount = 0;
    for (const fid in identified.featureSet) {
      if (Object.hasOwn(identified.featureSet, fid)) {
        const feature = identified.featureSet[fid];
        featureCount++;
        if (
          [
            'active-wildfires-fire-of-note',
            'active-wildfires-out-of-control',
            'active-wildfires-holding',
            'active-wildfires-under-control',
            'active-wildfires-out',
            'fire-perimeters',
          ].includes(feature.layerId)
        ) {
          lastFeature = feature;
          feature.properties.createContent = function(el) {
            self.zone.run(function() {
              const compRef = self.makeComponent(IncidentIdentifyPanelComponent);
              (compRef.instance as any).setIncident(
                feature.properties,
                identified.featureSet,
              );
              const panel = document
                .getElementsByClassName('identify-panel')
                .item(0) as HTMLElement;
              panel.appendChild(compRef.location.nativeElement);
              self.cdr.detectChanges();
              // display the panel
              (
                document
                  .getElementsByClassName('identify-panel')
                  .item(0) as HTMLElement
              ).style.display = 'block';
              // apply a slight debounce to clear the identify and destroy the panel
              setTimeout(() => {
                const identifyPanel = document
                  .getElementsByClassName('smk-panel')
                  .item(0) as HTMLElement;
                if (identifyPanel) {
                  identifyPanel.remove();
                }
                // use smk.$viewer.identified to reset the form?
              }, 200);
            });
          };
        }
      }
    }

    if (lastFeature && featureCount === 1) {
      // force the call from the list view (should auto-trigger but wont if identify called from list view)
      lastFeature.properties.createContent();
    }
  }

  async addNearbyWeatherStation(smk) {
    const self = this;
    let lat, long;
    if (this.lastClickedLocation?.map) {
      lat = this.lastClickedLocation.map.latitude;
      long = this.lastClickedLocation.map.longitude;
    } else {
      let userLocation = await this.commonUtilityService.getCurrentLocationPromise();
      lat = userLocation.coords.latitude;
      long = userLocation.coords.longitude;
    }

    this.pointIdService
      .fetchNearestWeatherStation(
        lat,
        long,
      )
      .then(function(station) {
        for (const hours of station.hourly) {
          if (hours.temp !== null) {
            station.validHour = hours;
            break;
          }
        }

        station.latitude = lat;
        station.longitude = long;

        smk.$viewer.identified.add('weather-stations', [
          {
            type: 'Feature',
            title: station.stationName,
            data: station,
            properties: {
              code: station.stationCode,
              createContent(el) {
                self.zone.run(function() {
                  const compRef = self.makeComponent(WeatherPanelComponent);
                  (compRef.instance as any).setWeatherStation(station);
                  el.appendChild(compRef.location.nativeElement);
                  self.cdr.detectChanges();
                });
              },
            },
            geometry: {
              type: 'Point',
              coordinates: [
                long,
                lat,
              ],
            },
          },
        ]);
      });
  }

  makeComponent<C>(component: Type<C>): ComponentRef<C> {
    if (this.componentRef) {
this.componentRef.destroy();
}

    this.identifyContainer.clear();
    this.componentRef = this.identifyContainer.createComponent(
      this.componentFactoryResolver.resolveComponentFactory(component),
    );

    return this.componentRef;
  }
}

function clone(o) {
  return JSON.parse(JSON.stringify(o));
}
