import { ChangeDetectorRef, Component, ComponentFactoryResolver, ComponentRef, EventEmitter, Injector, Input, NgZone, OnChanges, OnDestroy, Output, SimpleChanges, Type, ViewChild, ViewContainerRef } from '@angular/core';
import { PointIdService } from '../../services/point-id.service';
import { WFMapService } from '../../services/wf-map.service';
import { IncidentIdentifyPanelComponent } from '../incident-identify-panel/incident-identify-panel.component';
import { WeatherPanelComponent } from '../weather-panel/weather-panel.component';

let mapIndexAuto = 0;
let initPromise = Promise.resolve();

@Component({
  selector: 'wf-map-container',
  templateUrl: './wf-map-container.component.html',
  styleUrls: ['./wf-map-container.component.scss']
})
export class WFMapContainerComponent implements OnDestroy, OnChanges {
  @ViewChild('identifyContainer', { read: ViewContainerRef }) identifyContainer: ViewContainerRef;
  @Input() mapIndex = 0;
  @Input() mapConfig: Array<any>;

  @Output() mapInitialized = new EventEmitter<any>();
  @Output() toggleAccordion = new EventEmitter<any>();

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
    protected componentFactoryResolver: ComponentFactoryResolver
  ) {
    mapIndexAuto += 1;
    this.mapIndexAuto = mapIndexAuto;

    this.zone = this.injector.get(NgZone)
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
    initPromise = initPromise.then(function () {
      return self.wfMap.createSMK({
        id: mapIndex,
        containerSel: self.mapContainer.nativeElement,
        config: mapConfig,
        toggleAccordion: self.toggleAccordion
      }).then(function (smk) {
        self.mapInitialized.emit(smk);

        const hideListButtonElement = document.getElementsByClassName('smk-tool-BespokeTool--show-list');
        hideListButtonElement[0]["style"]["display"] = 'none';

        smk.$viewer.handlePick(3, function (location) {
          self.lastClickedLocation = location
          // If the layer is visible only
          if (smk && smk.$viewer.displayContext.layers.itemId['weather-stations'] && smk.$viewer.displayContext.layers.itemId['weather-stations'][0].isVisible) {
            self.addNearbyWeatherStation(smk);
            (document.getElementsByClassName('identify-panel').item(0) as HTMLElement).style.display = 'none';
          }
        })

        self.wfMap.setIdentifyDoneCallback(() => {
          self.addSelectedIncidentPanels(smk);
        })

        return smk;
      })
    }).catch(function (e) {
      console.warn(e);
    });
    this.initPromise = initPromise;
  }

  destroyMap(): void {
    if (!this.initPromise) {
      return;
    }

    this.initPromise = this.initPromise.then(function (smk) {
      if (!smk) {
        return;
      }

      smk.destroy();
    });
  }

  addSelectedIncidentPanels (smk) {
    const self = this;
    const identified = smk.$viewer.identified;
    for (const fid in identified.featureSet) {
      if (Object.prototype.hasOwnProperty.call(identified.featureSet, fid)) {
        const feature = identified.featureSet[fid];
        if (['active-wildfires-fire-of-note', 'active-wildfires-out-of-control', 'active-wildfires-holding', 'active-wildfires-under-control', 'bcws-activefires-publicview-inactive', 'fire-perimeters'].includes(feature.layerId)) {
          feature.properties.createContent = function (el) {
            self.zone.run(function () {
              let compRef = self.makeComponent(IncidentIdentifyPanelComponent);
              (compRef.instance as any).setIncident(feature.properties, identified.featureSet);
              const panel = (document.getElementsByClassName('identify-panel').item(0) as HTMLElement);
              panel.appendChild(compRef.location.nativeElement);
              self.cdr.detectChanges();
              // display the panel
              (document.getElementsByClassName('identify-panel').item(0) as HTMLElement).style.display = 'block';
              // apply a slight debounce to clear the identify and destroy the panel
              setTimeout(() => {
                const identifyPanel = (document.getElementsByClassName('smk-panel').item(0) as HTMLElement)
                identifyPanel.remove();
                // use smk.$viewer.identified to reset the form?
              }, 200);
            })
          }
        }
      }
    }
  }

  addNearbyWeatherStation (smk) {
    const self = this;
    this.pointIdService.fetchNearestWeatherStation(this.lastClickedLocation.map.latitude, this.lastClickedLocation.map.longitude)
    .then(function (station) {
      smk.$viewer.identified.add('weather-stations', [{
          type: 'Feature',
          title: station.stationName,
          properties: {
              code: station.stationCode,
              createContent: function (el) {
                  self.zone.run(function () {
                      let compRef = self.makeComponent(WeatherPanelComponent);
                      (compRef.instance as any).setWeatherStation(station);
                      el.appendChild(compRef.location.nativeElement)
                      self.cdr.detectChanges();
                  })
              },
          },
          geometry: {
              type: 'Point',
              coordinates: [self.lastClickedLocation.map.longitude, self.lastClickedLocation.map.latitude]
          }
      }])
    });
  }

  makeComponent<C>(component: Type<C>): ComponentRef<C> {
    if (this.componentRef)
        this.componentRef.destroy()

    this.identifyContainer.clear()
    this.componentRef = this.identifyContainer.createComponent(this.componentFactoryResolver.resolveComponentFactory(component))

    return this.componentRef
  }
}

function clone(o) {
  return JSON.parse(JSON.stringify(o));
}
