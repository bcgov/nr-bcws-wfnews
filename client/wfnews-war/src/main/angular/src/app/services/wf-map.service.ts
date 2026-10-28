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
  private patchPromise: Promise<any>;
  // The MapLibre viewer does not keep its basemap id.
  private baseMapIds = new WeakMap<object, string>();
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
          }).then((smk) => {
            smk.$viewer.startedIdentify(() => {
              const sidepanel = document
                .getElementsByClassName('smk-sidepanel')
                .item(0) as HTMLElement;
              sidepanel?.style.removeProperty('width');
            });
            smk.$viewer.changedBaseMap(({ baseMap }) => {
              mapService.baseMapIds.set(smk.$viewer, baseMap);
            });
            return smk;
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
    const smk = this.lastSmk();
    smk.$viewer.setBasemap(mapId);
    // At once, so the picker shows the choice before the basemap loads.
    this.baseMapIds.set(smk.$viewer, mapId);
  }

  /** The id of the basemap showing on the last map. */
  getBaseMap(): string | undefined {
    const smk = this.lastSmk();
    return smk && (this.baseMapIds.get(smk.$viewer) ?? smk.viewer?.baseMap);
  }

  private lastSmk() {
    const SMK = window['SMK'];
    let smk = null;
    for (const smkMap in SMK.MAP) {
      if (hasOwn(SMK.MAP, smkMap)) {
        smk = SMK.MAP[smkMap];
      }
    }
    return smk;
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

/**
 * Rendered from the live services, all over Kamloops (-119.5, 50.7) at zoom 5.4, where each basemap
 * looks different. 528x160 is 2x the panel's 264x80; JPEG keeps the Payload small.
 */
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

const ESRI_WORLD_VECTOR_URL = 'https://basemaps.arcgis.com/arcgis/rest/services/World_Basemap_v2/VectorTileServer';

/** The basemaps SMK lacks, or defines differently from WFNEWS. */
const APP_BASEMAPS = [
  // WFPREV's Topographic, so both apps show the same Terrain. A composite stacks bottom first.
  {
    id: 'topography',
    title: 'Terrain',
    order: 101,
    optionImageUrl: basemapImageUrl('topography'),
    type: 'composite',
    layers: ['terrain-hillshade', 'terrain-vector'],
  },
  {
    id: 'terrain-hillshade',
    internal: true,
    type: 'esri-tiled-map',
    url: 'https://services.arcgisonline.com/arcgis/rest/services/Elevation/World_Hillshade/MapServer',
    // Above 16 the service answers "Map data not yet available", which covers the map.
    // SMK 1.0 stopped here too; MapLibre enlarges the zoom 16 tiles instead.
    option: { maxNativeZoom: 16 },
  },
  {
    ...esriVectorBasemap('terrain-vector', 'Terrain', 101, '7dc6cea0b1764a1f9af2e679f642f0f5', ESRI_WORLD_VECTOR_URL),
    internal: true,
  },
  // Satellite keeps its zoom 19 limit: deeper, more of BC answers "Map data not yet available".
  { id: '--imagery-v2-tiles', option: { maxNativeZoom: 19, maxZoom: 30 } },
  // Esri's World Navigation Map, drawn from its item so it keeps up with Esri.
  esriVectorBasemap('navigation', 'Navigation', 102, '63c47b7177f946b49902c24129b87252', ESRI_WORLD_VECTOR_URL),
  // GeoBC's standard BC Basemap, with hillshade, as published.
  esriVectorBasemap('bc-basemap', 'BC BaseMap', 105, 'bbe05270d3a642f5b62203d6c454f457',
    'https://tiles.arcgis.com/tiles/ubm4tcTYICKBpist/arcgis/rest/services/BC_BASEMAP_20240307/VectorTileServer'),
];

/** The picker's choices, in order. */
const basemapChoices = () => [
  'topography', 'navigation', 'imagery-v2', 'night', 'bc-basemap',
];

/** WFNEWS-2401: the names the mobile picker shows. */
const BASEMAP_TITLES = {
  topography: 'Terrain',
  navigation: 'Navigation',
  'imagery-v2': 'Satellite',
  night: 'Dark',
  'bc-basemap': 'BC Basemap',
};

/** A picture and a name for each choice; the full definition where SMK's will not do. */
const basemapConfig = () => [
  ...basemapChoices().map((id, i) => ({
    ...(APP_BASEMAPS.find((b) => b.id === id) ?? { id, optionImageUrl: basemapImageUrl(id) }),
    title: BASEMAP_TITLES[id],
    // The picker sorts by order, so this keeps the choices' order.
    order: 100 + i,
  })),
  // The parts of a composite, which are not choices.
  ...APP_BASEMAPS.filter((b) => !basemapChoices().includes(b.id)),
];

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
