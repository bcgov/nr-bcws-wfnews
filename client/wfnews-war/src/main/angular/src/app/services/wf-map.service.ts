import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { CapacitorService } from '@app/services/capacitor-service';
import {
  getActiveMap,
  hasOwn,
  hidePanel,
} from '@app/utils';
import { CapacitorHttp } from '@capacitor/core';
import { AppConfigService } from '@wf1/core-ui';
import { registerTimeDimension } from '@app/services/smk-time-dimension';

export type Smk = any;
export type SmkPromise = Promise<Smk>;

@Injectable({
  providedIn: 'root',
})
export class WFMapService {
  identifyCallback;
  identifyDoneCallback;
  private patchPromise: Promise<any>;
  private smkBaseUrl = `${window.location.protocol}//${window.location.host}/assets/smk/`;

  constructor(
    protected appConfigService: AppConfigService,
    private httpClient: HttpClient,
    private capacitorService: CapacitorService,
  ) { }

  setHandler(id, method, handler): Promise<any> {
    const SMK = window['SMK'];

    return this.patch().then(() => {
      SMK.HANDLER.set(id, method, handler);
    });
  }

  setIdentifyCallback(cb) {
    this.identifyCallback = cb;
  }

  setIdentifyDoneCallback(cb) {
    this.identifyDoneCallback = cb;
  }

  createSMK(option: any) {
    const SMK = window['SMK'];
    const mapService = this;

    return this.patch()
      .then(() => {
        try {
          // First, so each map's own Config can override these defaults.
          // A caller may give one Config or a list of fragments.
          option.config = [{
            viewer: {
              // A static picture for each basemap, and the definitions of the
              // two basemaps SMK does not have. Each map gets its own.
              baseMapConfig: basemapConfig(),
              // Show the map at once and let each layer fade in as it loads.
              waitForLayers: false,
            },
            tools: [
              {
                type: 'baseMaps',
                choices: basemapChoices(),
              },
              {
                type: 'bespoke',
                instance: 'full-extent',
                title: 'Zoom to Full Extent',
                enabled: true,
                position: 'actionbar',
                showTitle: false,
                showPanel: false,
                icon: 'zoom_out_map',
                order: 3,
              },
              {
                type: "measure",
                enabled: true
              }
            ],
          }, ...[].concat(option.config)];

          SMK.HANDLER.set(
            'BespokeTool--full-extent',
            'triggered',
            (smk, tool) => {
              hidePanel('desktop-preview')
              zoomToProvince();
            },
          );

          SMK.HANDLER.set(
            'BespokeTool--full-screen',
            'triggered',
            (smk, tool) => {
              option.fullScreen.emit();
            },
          );

          SMK.HANDLER.set(
            'measure',
            'triggered',
            (smk, tool) => {
              hidePanel('desktop-preview')
              zoomToProvince();
            },
          );

          return SMK.INIT({
            baseUrl: mapService.smkBaseUrl,
            ...option,
          });
        } catch (error) {
          console.error('Error occurred during SMK initialization:', error);
          throw error;
        }
      })
      .catch((error) => {
        console.error('Error occurred during patching:', error);
        throw error; // Re-throw the error to propagate it to the caller
      });
  }

  public patch(): Promise<any> {
    try {
      const SMK = window['SMK'];

      if (!this.patchPromise) {
        this.patchPromise = Promise.resolve()
          .then(() => {
            console.log('start patching SMK');
          })
          .then(() => {
            // SMK's maps run Vue 3 with no template compiler, so these render
            // themselves. SMK.component makes them known to every map.
            const { h, withDirectives, resolveDirective } = window['Vue'];
            const featureWith = (cls: string) => ({
              extends: f,
              computed: {
                content() {
                  return { create: this.feature.properties.createContent };
                },
              },
              render() {
                return h('div', { class: cls }, [
                  withDirectives(h('div', { class: 'smk-bespoke-content' }), [
                    [resolveDirective('content'), this.content],
                  ]),
                ]);
              },
            });

            const f = SMK.component('wf-feature', {
              extends: SMK.COMPONENT.FeatureBase,
              methods: {
                asDate(attr) {
                  let v;
                  try {
                    v = this.feature.properties[attr];
                  } catch (e) {
                    return attr;
                  }

                  try {
                    return new Date(v).toISOString().slice(0, 10);
                  } catch (e) {
                    return v;
                  }
                },
                zoomFeature() {
                  this.$root.trigger('IdentifyFeatureTool', 'zoom');
                },
              },
            });

            SMK.component('wf-weather-station-feature', featureWith('wf-weather-station-feature'));
            SMK.component('wf-incident-feature', featureWith('wf-incident-feature'));
          })
          .then(() => {
            registerTimeDimension(SMK, window['Vue']);
          })
          .then(() => {
            console.log('done patching SMK');
          });
      }
      return this.patchPromise;
    } catch (error) {
      console.error('Error occurred during patching:', error);
      throw error; // Re-throw the error to propagate it to the caller
    }
  }

  setBaseMap(mapId: string) {
    const SMK = window['SMK'];
    let viewer = null;
    for (const smkMap in SMK.MAP) {
      if (hasOwn(SMK.MAP, smkMap)) {
        viewer = SMK.MAP[smkMap].$viewer;
      }
    }
    viewer.setBasemap(mapId);

    try {
      if (mapId === 'topography') {
        // turn on hillshade
        viewer.displayContext.layers.setItemVisible('bc-hillshade', true);
      } else {
        // turn off hillshade
        viewer.displayContext.layers.setItemVisible('bc-hillshade', false);
      }
    } catch (err) {
      console.error('hillshade failed to load on init');
    }
  }

  getBaseMap() {
    const SMK = window['SMK'];
    let viewer = null;
    for (const smkMap in SMK.MAP) {
      if (hasOwn(SMK.MAP, smkMap)) {
        viewer = SMK.MAP[smkMap].$viewer;
      }
    }
    return viewer?.currentBasemap;
  }

  httpGet(url: string, params?: any, headers?: any): Promise<any> {
    return this.capacitorService.isMobile.then((isMobile) => {
      if (isMobile) {
        // return this.http.get(url, params, headers)
        const options = {
          url,
          headers,
          params,
        };
        const resp = CapacitorHttp.get(options);
        console.log('CAPACTIORHTTP!!!!!!!!!');
        return resp;
      } else {
        const requestOptions = {
          params,
          headers,
        };
        const resp = this.httpClient.get(url, requestOptions).toPromise();
        return resp;
      }
    });
  }

}

const clone = (obj) => JSON.parse(JSON.stringify(obj));

/** Rendered from the live services, 560x160, JPEG to keep the Payload small. */
const basemapImageUrl = (id: string) => `/assets/images/basemaps/${id}.jpg`;

/** An ArcGIS vector tile basemap that SMK draws from the item's published style. */
const esriVectorBasemap = (id: string, title: string, order: number, itemId: string, url: string) => ({
  id,
  title,
  order,
  optionImageUrl: basemapImageUrl(id),
  type: 'esri-vector-tile',
  url,
  itemId,
});

/** The two basemaps SMK does not define. */
const APP_BASEMAPS = [
  // Esri's World Navigation Map, drawn from its item so it keeps up with Esri.
  esriVectorBasemap('navigation', 'Navigation', 102, '63c47b7177f946b49902c24129b87252',
    'https://basemaps.arcgis.com/arcgis/rest/services/World_Basemap_v2/VectorTileServer'),
  // GeoBC's standard BC Basemap, with hillshade, as published.
  esriVectorBasemap('bc-basemap', 'BC BaseMap', 105, 'bbe05270d3a642f5b62203d6c454f457',
    'https://tiles.arcgis.com/tiles/ubm4tcTYICKBpist/arcgis/rest/services/BC_BASEMAP_20240307/VectorTileServer'),
];

/** The picker's choices, in order. */
const basemapChoices = () => [
  'topography', 'navigation', 'imagery', 'night', 'bc-basemap',
];

/** A picture for each choice; the full definition for the two SMK lacks. */
const basemapConfig = () =>
  basemapChoices().map((id) => APP_BASEMAPS.find((b) => b.id === id) ?? { id, optionImageUrl: basemapImageUrl(id) });

const encodeUrl = (url, data) => {
  if (!data) {
    return url;
  }

  const params = Object.keys(data)
    .filter((k) => data[k])
    .map((k) => `${encodeURIComponent(k)}=${encodeURIComponent(data[k])}`)
    .join('&');

  if (/[?]\S+$/.test(url)) {
    return `${url}&${params}`;
  }

  if (/[?]$/.test(url)) {
    return `${url}${params}`;
  }

  return `${url}?${params}`;
};

const zoomToGeometry = (geom: any, zoomLevel: number | boolean = 12) => {
  getActiveMap().$viewer.panToFeature(geom, zoomLevel);
};
const zoomToProvince = () => {
  getActiveMap().$viewer.panToFeature({
    type: 'Feature',
    geometry: {
      type: 'Polygon',
      coordinates: [
        [
          [-139.05, 60.0],
          [-114.05, 60.0],
          [-114.05, 48.0],
          [-139.05, 48.0],
          [-139.05, 60.0],
        ],
      ],
    },
  });
};
