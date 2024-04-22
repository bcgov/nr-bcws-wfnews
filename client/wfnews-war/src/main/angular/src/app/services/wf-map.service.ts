import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { CapacitorService } from '@app/services/capacitor-service';
import { getActiveMap, isAndroidViaNavigator } from '@app/utils';
import { CapacitorHttp } from '@capacitor/core';
import { AppConfigService } from '@wf1/core-ui';
import * as esriVector from 'esri-leaflet-vector';
import * as satelliteStyle from '../../assets/data/vector-basemap-imagery.json';
import * as navStyle from '../../assets/data/vector-basemap-navigation.json';
import * as nightStyle from '../../assets/data/vector-basemap-night.json';
import * as topoStyle from '../../assets/data/vector-basemap-topo.json';

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

  changeBasemapCacheToken() {
    changeCacheToken();
  }

  createSMK(option: any) {
    const SMK = window['SMK'];
    const mapService = this;

    return this.patch()
      .then(() => {
        try {
          option.config.push({
            // viewer: {
            //     baseMap: baseMapIds[ 0 ]
            // },
            tools: [
              {
                type: 'baseMaps',
                choices: baseMapIds,
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
            ],
          });

          SMK.HANDLER.set(
            'BespokeTool--full-extent',
            'triggered',
            (smk, tool) => {
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
      const mapService = this;
      const include = window['include'];
      const SMK = window['SMK'];

      if (!this.patchPromise) {
        this.patchPromise = Promise.resolve()
          .then(() => {
            console.log('start patching SMK');

            // Create a DIV for a temporary map.
            // This map is used to ensure that SMK is completely loaded before monkey-patching
            const temp = document.createElement('div');
            temp.style.display = 'none';
            temp.style.visibility = 'hidden';
            temp.style.position = 'absolute';
            temp.style.left = '-5000px';
            temp.style.top = '-5000px';
            temp.style.right = '-4000px';
            temp.style.bottom = '-4000px';
            document.body.appendChild(temp);

            return SMK.INIT({
              id: 999,
              containerSel: temp,
              baseUrl: mapService.smkBaseUrl,
              config: 'show-tool=bespoke',
            }).then((smk) => {
              const option2x = {
                tileSize: 512,
                zoomOffset: -1,
              };

              const topographicOption = {
                maxNativeZoom: 20,
                maxZoom: 30,
              };

              mapService.defineEsriVectorLayer('topography', 'BC Topography', [
                {
                  id: 'topography',
                  type: 'vector',
                  url: 'https://tiles.arcgis.com/tiles/B6yKvIZqzuOr0jBR/arcgis/rest/services/Canada_Topographic/VectorTileServer',
                  style: () => topoStyle,
                },
              ]);

              mapService.defineEsriVectorLayer('navigation', 'Navigation', [
                {
                  id: 'navigation',
                  type: 'vector',
                  url: 'https://tiles.arcgis.com/tiles/B6yKvIZqzuOr0jBR/arcgis/rest/services/Canada_Topographic/VectorTileServer',
                  style: () => navStyle,
                },
              ]);

              mapService.defineEsriVectorLayer('imagery', 'Imagery', [
                {
                  id: 'imagery',
                  type: 'vector',
                  url: 'https://tiles.arcgis.com/tiles/B6yKvIZqzuOr0jBR/arcgis/rest/services/Canada_Topographic/VectorTileServer',
                  style: () => satelliteStyle,
                },
                { id: 'Imagery', type: 'tile', url: null, style: null },
              ]);

              mapService.defineEsriVectorLayer('night', 'Night', [
                {
                  id: 'night',
                  type: 'vector',
                  url: 'https://tiles.arcgis.com/tiles/B6yKvIZqzuOr0jBR/arcgis/rest/services/Canada_Topographic/VectorTileServer',
                  style: () => nightStyle,
                },
              ]);

              mapService.defineEsriVectorLayer('bc-basemap', 'BC BaseMap', [
                {
                  id: 'bc-basemap',
                  type: 'vector',
                  url: 'https://tiles.arcgis.com/tiles/ubm4tcTYICKBpist/arcgis/rest/services/BC_BASEMAP/VectorTileServer',
                  style: (style) => style,
                },
              ]);

              if (isAndroidViaNavigator()) {
                defineOpenStreetMapLayer();
              }

              smk.destroy();
              temp.parentElement.removeChild(temp);
            });
          })
          .then(() => {
            // add a component to Vue global used by SMK
            const vue = window['Vue'];
            return include('component').then(() => {
              const f = vue.component('wf-feature', {
                template: '#wf-feature-template',
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

              vue.component('wf-weather-station-feature', {
                template: '#wf-weather-station-feature-template',
                extends: f,
                computed: {
                  content() {
                    return {
                      create: this.feature.properties.createContent,
                    };
                  },
                },
              });

              vue.component('wf-incident-feature', {
                template: '#wf-incident-feature-template',
                extends: f,
                computed: {
                  content() {
                    return {
                      create: this.feature.properties.createContent,
                    };
                  },
                },
              });
            });
          })
          .then(() => {
            include.tag(
              'plugin-wfim-util',
              // { loader: "group", tags: [
              {
                loader: 'script',
                url: './assets/js/smk/plugin-wfnews/util.js',
              },
              // ] }
            );

            include.tag('layer-incidents', {
              loader: 'group',
              tags: [
                {
                  loader: 'script',
                  url: './assets/js/smk/plugin-wfnews/layer/layer-incidents.js',
                },
              ],
            });

            include.tag('layer-incidents-leaflet', {
              loader: 'group',
              tags: [
                {
                  loader: 'script',
                  url: './assets/js/smk/plugin-wfnews/viewer-leaflet/layer/layer-incidents-leaflet.js',
                },
              ],
            });

            include.tag('util-date', {
              loader: 'group',
              tags: [
                {
                  loader: 'script',
                  url: './assets/js/smk/plugin-wfnews/lib/date.js',
                },
              ],
            });
            include.tag('layer-wms-time-cql', {
              loader: 'group',
              tags: [
                {
                  loader: 'script',
                  url: './assets/js/smk/plugin-wfnews/layer/layer-wms-time-cql.js',
                },
              ],
            });
            include.tag('layer-wms-time-cql-leaflet', {
              loader: 'group',
              tags: [
                {
                  loader: 'script',
                  url: './assets/js/smk/plugin-wfnews/viewer-leaflet/layer/layer-wms-time-cql-leaflet.js',
                },
              ],
            });

            include.tag('leaflet-extensions', {
              loader: 'group',
              tags: [
                {
                  loader: 'script',
                  url: './assets/js/smk/plugin-wfnews/viewer-leaflet/lib/layer-crosshairs.js',
                },
              ],
            });

            include.tag('layer-image', {
              loader: 'group',
              tags: [
                {
                  loader: 'script',
                  url: './assets/js/smk/plugin-time-dimension/layer/layer-image.js',
                },
              ],
            });

            include.tag('layer-image-leaflet', {
              loader: 'group',
              tags: [
                {
                  loader: 'script',
                  url: './assets/js/smk/plugin-time-dimension/viewer-leaflet/layer/layer-image-leaflet.js',
                },
              ],
            });

            include.tag('layer-wms-time', {
              loader: 'group',
              tags: [
                {
                  loader: 'script',
                  url: './assets/js/smk/plugin-time-dimension/layer/layer-wms-time.js',
                },
              ],
            });

            include.tag('layer-wms-time-leaflet', {
              loader: 'group',
              tags: [
                {
                  loader: 'script',
                  url: './assets/js/smk/plugin-time-dimension/viewer-leaflet/layer/layer-wms-time-leaflet.js',
                },
              ],
            });

            include.tag('tool-time-dimension', {
              loader: 'group',
              tags: [
                {
                  loader: 'script',
                  url: './assets/js/smk/plugin-time-dimension/tool/time-dimension/tool-time-dimension.js',
                },
              ],
            });

            include.tag('tool-time-dimension-leaflet', {
              loader: 'sequence',
              tags: [
                {
                  loader: 'style',
                  url: 'https://cdn.jsdelivr.net/npm/leaflet-timedimension@1.1.1/dist/leaflet.timedimension.control.min.css',
                },
                {
                  loader: 'script',
                  url: 'https://cdn.jsdelivr.net/npm/iso8601-js-period@0.2.1/iso8601.min.js',
                },
                {
                  loader: 'script',
                  url: 'https://cdn.jsdelivr.net/npm/leaflet-timedimension@1.1.1/dist/leaflet.timedimension.min.js',
                },
                {
                  loader: 'script',
                  url: './assets/js/smk/plugin-time-dimension/viewer-leaflet/tool/time-dimension/lib/time-dimension-layer-image-overlay.js',
                },
                {
                  loader: 'script',
                  url: './assets/js/smk/plugin-time-dimension/viewer-leaflet/tool/time-dimension/tool-time-dimension-leaflet.js',
                },
              ],
            });

            return include(
              'leaflet-extensions',
              'layer-incidents-leaflet',
              'layer-wms-time-cql-leaflet',
              'layer-image-leaflet',
              'layer-wms-time-leaflet',
            )
              .then(() => {
                console.log('custom smk layers loaded');
              })
              .catch((error) => {
                console.error(
                  'Error occurred while loading custom SMK layers:',
                  error,
                );
                throw error;
              });
          })
          .then(() => {
            SMK.TYPE.Viewer.leaflet.prototype.mapResized = () => {
              const prototype = SMK.TYPE.Viewer.leaflet.prototype;
              setTimeout(() => {
                prototype.map.invalidateSize({ animate: false });
              }, 0);
            };

            const oldInit = SMK.TYPE.Viewer.leaflet.prototype.initialize;
            SMK.TYPE.Viewer.leaflet.prototype.initialize = function(smk) {
              // Call the existing initializer
              oldInit.apply(this, arguments);

              // Set the maximum bounds that can be panned to.
              const L = window['L'];
              const maxBounds = L.latLngBounds([
                L.latLng(90, -180),
                L.latLng(0, -90),
              ]);
              this.map.setMaxBounds(maxBounds);
            };

            SMK.TYPE.Viewer.leaflet.prototype.panToFeature = function(
              feature,
              zoomIn,
            ) {
              const turf = window['turf'];
              const L = window['L'];

              let bounds;
              let maxZoom;
              switch (turf.getType(feature)) {
                case 'Point':
                  const ll = L.latLng(
                    feature.geometry.coordinates[1],
                    feature.geometry.coordinates[0],
                  );
                  bounds = L.latLngBounds([ll, ll]);
                  maxZoom = 16;
                  break;

                default:
                  const bbox = turf.bbox(feature);
                  bounds = L.latLngBounds(
                    [bbox[1], bbox[0]],
                    [bbox[3], bbox[2]],
                  );
              }
              if (!bounds) {
                return;
              }

              const padding = this.getPanelPadding();

              if (!zoomIn) {
                maxZoom = this.map.getZoom();
              } else if (zoomIn === true) {
                // maxZoom = null
              } else {
                maxZoom = parseFloat(zoomIn);
              }

              this.map.fitBounds(bounds, {
                paddingTopLeft: padding.topLeft,
                paddingBottomRight: padding.bottomRight,
                maxZoom,
                animate: true,
              });
            };

            SMK.TYPE.Viewer.leaflet.prototype.cancelIdentify = false;
            SMK.TYPE.Viewer.leaflet.prototype.identifyState = null;
            const origIdentifyFeatures =
              SMK.TYPE.Viewer.leaflet.prototype.identifyFeatures;
            SMK.TYPE.Viewer.leaflet.prototype.identifyFeatures = function(
              location,
              area,
            ) {
              const vw = this;
              (
                document
                  .getElementsByClassName('smk-sidepanel')
                  .item(0) as HTMLElement
              ).style.removeProperty('width');
              if (mapService.identifyCallback) {
                mapService.identifyCallback(location, area);
              }

              return Promise.resolve()
                .then(() => origIdentifyFeatures.call(vw, location, area))
                .then(() => {
                  if (mapService.identifyDoneCallback) {
                    mapService.identifyDoneCallback(location, area);
                  }
                })
                .catch((err) => {
                  console.error(err);
                });
            };

            SMK.TYPE.Layer['wms'].prototype.canMergeWith = function(other) {
              return (
                this.config.combiningClass &&
                this.config.combiningClass === other.config.combiningClass
              );
            };
            SMK.TYPE.Layer['wms']['leaflet'].prototype.canMergeWith = function(
              other,
            ) {
              return (
                this.config.combiningClass &&
                this.config.combiningClass === other.config.combiningClass
              );
            };

            SMK.TYPE.Layer['wms']['leaflet'].prototype.getFeaturesInArea =
              function(area, view, option) {
                const prototype = SMK.TYPE.Layer['wms']['leaflet'].prototype;

                let extraFilter = this.config.where || '';
                if (extraFilter) {
                  extraFilter = ' AND ' + extraFilter;
                }

                const polygon =
                  'SRID=4326;POLYGON ((' +
                  area.geometry.coordinates[0]
                    .map((c) => c.join(' '))
                    .join(',') +
                  '))';

                const data = {
                  service: 'WFS',
                  version: '1.1.0',
                  request: 'GetFeature',
                  srsName: 'EPSG:4326',
                  typename: this.config.layerName,
                  outputformat: 'application/json',
                  cql_filter:
                    'INTERSECTS(' +
                    (this.config.geometryAttribute || 'GEOMETRY') +
                    ',' +
                    polygon +
                    ')' +
                    extraFilter,
                };

                return mapService
                  .httpGet(this.config.serviceUrl, data)
                  .then((response: any) => {
                    console.log('parse ok');
                    if (response.data) {
                      // from capacitor http
                      response = response.data;
                    }
                    if (!response) {
                      throw new Error('no features');
                    }
                    if (!response.features || response.features.length === 0) {
                      throw new Error('no features');
                    }
                    console.log('feature count', response.features.length);

                    return response.features.map((f, i) => {
                      if (this.config.titleAttribute) {
                        f.title = f.properties[this.config.titleAttribute];
                      } else {
                        f.title = 'Feature #' + (i + 1);
                      }

                      return f;
                    });
                  })
                  .then((features) => {
                    console.log('features returned', features.length);
                    return features;
                  });
              };

            SMK.TYPE.Layer['wms-time-cql']['leaflet'].prototype.initLegends =
              SMK.TYPE.Layer['wms']['leaflet'].prototype.initLegends =
              () => {
                const J = window['jQuery'];
                const prototype = SMK.TYPE.Layer['wms']['leaflet'].prototype;

                const url =
                  prototype.config.serviceUrl +
                  '?' +
                  J.param({
                    SERVICE: 'WMS',
                    VERSION: '1.1.1',
                    REQUEST: 'getlegendgraphic',
                    FORMAT: 'image/png',
                    TRANSPARENT: 'true',
                    LAYER: prototype.config.layerName,
                    STYLE: prototype.config.styleName,
                  });

                return fetch(url, {
                  method: 'GET',
                  headers: prototype.config.header,
                  mode: 'cors',
                })
                  .then((res) => res.blob())
                  .then(
                    (blob) =>
                      new Promise((res, rej) => {
                        try {
                          const reader = new FileReader();
                          reader.onload = () => res(reader.result);
                          reader.readAsDataURL(blob);
                        } catch (e) {
                          rej(e);
                        }
                      }),
                  )
                  .then(
                    (dataUrl: string) =>
                      new Promise((res, rej) => {
                        try {
                          const img = new Image();
                          img.onload = () =>
                            res([
                              {
                                url: dataUrl,
                                width: img.width,
                                height: img.height,
                                ...prototype.config.legend,
                              },
                            ]);
                          img.onerror = (ev) => rej(ev);
                          img.src = dataUrl;
                        } catch (e) {
                          rej(e);
                        }
                      }),
                  )
                  .catch((e) => {
                    console.warn(e);
                  });
              };
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
      if (Object.hasOwn(SMK.MAP, smkMap)) {
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
      if (Object.hasOwn(SMK.MAP, smkMap)) {
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

  defineEsriVectorLayer(
    id: string,
    title: string,
    baseMaps: {
      id: string;
      url: string;
      style: any;
      type: string;
      option?: { [key: string]: any };
    }[],
  ) {
    order += 1;
    baseMapIds.push(id);
    window['SMK'].TYPE.Viewer.prototype.basemap[id] = {
      title,
      order,
      create() {
        const L = window['L'];
        /*L.esri = {
          ...esriLeaflet,
          Vector: {
            ...esriVector
          }
        };*/
        return baseMaps.map((bm) => {
          const opts = clone({ ...bm.option, wfnewsId: id });
          opts.cacheToken = () => baseMapCacheToken;

          if (bm.type === 'vector') {
            opts.renderer = L.canvas({ padding: 0.5 });
            const layer = esriVector.vectorTileLayer(bm.url, {
              style: bm.style,
              opts,
              renderer: L.canvas({ padding: 0.5 })
            });

            layer.bringToBack = () => {
              layer._zIndex = 0;

              try {
                const SMK = window['SMK'];
                let viewer = null;
                for (const smkMap in SMK.MAP) {
                  if (Object.hasOwn(SMK.MAP, smkMap)) {
                    viewer = SMK.MAP[smkMap].$viewer;
                  }
                }

                if (id === 'topography') {
                  // turn on hillshade
                  viewer.displayContext.layers.setItemVisible('bc-hillshade', true);
                } else {
                  // turn off hillshade
                  viewer.displayContext.layers.setItemVisible('bc-hillshade', false);
                }
              } catch (err) {
                console.error('hillshade failed to load on init');
              }

              return this;
            };

            layer._zIndex = 0;
            layer._leaflet_id = id;
            layer.id = id;

            baseMapLayers.push(bm);

            return layer;
          } else {
            const orig = clone(L.esri.BasemapLayer.TILES[bm.id].options);
            const bmly = window['L'].esri.basemapLayer(bm.id, opts);
            L.esri.BasemapLayer.TILES[bm.id].options = { ...orig, wfnewsId: id };

            baseMapLayers.push(bmly);

            return bmly;
          }
        });
      },
    };
  }
}

const clone = (obj) => JSON.parse(JSON.stringify(obj));

let order = 100;
const baseMapIds = [];
let baseMapCacheToken;
const baseMapLayers = [];

const defineEsriBasemap = (
  id: string,
  title: string,
  baseMaps: { id: string; option?: { [key: string]: any } }[],
) => {
  order += 1;
  baseMapIds.push(id);
  window['SMK'].TYPE.Viewer.prototype.basemap[id] = {
    title,
    order,
    create() {
      return baseMaps.map((bm) => {
        const L = window['L'];

        const orig = clone(L.esri.BasemapLayer.TILES[bm.id].options);
        const bmly = window['L'].esri.basemapLayer(
          bm.id,
          clone({ ...bm.option, wfnewsId: id }),
        );
        L.esri.BasemapLayer.TILES[bm.id].options = { ...orig, wfnewsId: id };
        return bmly;
      });
    },
  };
};

const changeCacheToken = () => {
  baseMapCacheToken = Math.trunc(Math.random() * 1e10);
};

const defineWmsBasemap = (
  id,
  title: string,
  baseMaps: { url: string; option?: { [key: string]: any } }[],
) => {
  order += 1;
  baseMapIds.push(id);
  window['SMK'].TYPE.Viewer.prototype.basemap[id] = {
    title,
    order,
    create() {
      return baseMaps.map((bm) => {
        const L = window['L'];
        return L.tileLayer(bm.url, bm.option);
      });
    }
  };
};

const defineOpenStreetMapLayer = () => {
  const L = window['L'];
  const osm = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19,
    attribution: 'Map data &copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a>'
  });
  order += 1;
  baseMapIds.push('openstreetmap');
  window['SMK'].TYPE.Viewer.prototype.basemap['openstreetmap'] = {
    title: 'OpenStreetMap',
    order,
    create() {
      return [osm];
    }
  };
};

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
