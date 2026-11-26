import { Capacitor } from '@capacitor/core';
import { layers as protomapsLayers, namedFlavor } from '@protomaps/basemaps';
import { PMTiles, Protocol, RangeResponse, Source } from 'pmtiles';
import { environment } from '../../environments/environment';

export const OFFLINE_BASEMAP_ID = 'offline';
export const OFFLINE_BASEMAP_SOURCE_ID = 'smk-bm-offline';
export const OFFLINE_PMTILES_PATH = '/assets/offline-basemap/bc.pmtiles';
export const OFFLINE_GLYPHS_PATH = '/assets/offline-basemap/fonts/{fontstack}/{range}.pbf';
export const OSM_ATTRIBUTION =
  '<a href="https://www.openstreetmap.org/copyright" target="_blank">© OpenStreetMap contributors</a>';

const STRIPPED_SOURCE_LAYERS = new Set(['landuse', 'buildings', 'pois']);

let protocolRegistered = false;

/** True only in the mobile app build where bc.pmtiles and glyphs are bundled. */
export function isOfflineBasemapAvailable(): boolean {
  return Boolean(environment['offline_basemap']);
}

/**
 * PMTiles source that encodes byte ranges as query parameters instead of an HTTP `Range`
 * header so Android WebView (`shouldInterceptRequest`) can return `200 OK` slices without
 * Chromium re-applying the request `Range` to a `206` response (Chromium issue 40739128).
 */
export class QueryRangePmtilesSource implements Source {
  constructor(private readonly url: string) {}

  getKey(): string {
    return this.url;
  }

  async getBytes(offset: number, length: number, signal?: AbortSignal): Promise<RangeResponse> {
    const end = offset + length - 1;
    const resp = await fetch(`${this.url}?start=${offset}&end=${end}`, { signal });
    if (!resp.ok) {
      throw new Error(`HTTP ${resp.status} reading ${this.url}`);
    }
    return { data: await resp.arrayBuffer() };
  }
}

/** Registers the `pmtiles://` protocol handler with MapLibre once per app session. */
export function registerOfflineBasemapProtocol(
  origin = window.location.origin,
  platform = Capacitor.getPlatform(),
): void {
  if (protocolRegistered) {
    return;
  }
  const maplibregl = window['maplibregl'];
  if (!maplibregl?.addProtocol) {
    return;
  }

  const url = `${origin}${OFFLINE_PMTILES_PATH}`;
  const source: string | Source = platform === 'android' ? new QueryRangePmtilesSource(url) : url;
  const protocol = new Protocol();
  protocol.add(new PMTiles(source));
  maplibregl.addProtocol('pmtiles', protocol.tile);
  protocolRegistered = true;
}

/** Resets the registration guard; intended for unit tests. */
export function resetOfflineBasemapProtocolForTests(): void {
  protocolRegistered = false;
}

/**
 * Builds the Protomaps light MapLibre layers adapted for SMK's `vector-tile` basemap type
 * (no `background` layer, no stripped source layers, and no sprite `icon-*` references).
 */
export function offlineBasemapStyleLayers(): any[] {
  return protomapsLayers(OFFLINE_BASEMAP_SOURCE_ID, namedFlavor('light'), { lang: 'en' })
    .filter((layer: any) => {
      if (layer.type === 'background') {
        return false;
      }
      if (STRIPPED_SOURCE_LAYERS.has(layer['source-layer'])) {
        return false;
      }
      if (layer.layout?.['icon-image'] && !layer.layout?.['text-field']) {
        return false;
      }
      return true;
    })
    .map((layer: any) => {
      const cleaned: any = {
        ...layer,
        id: `offline-${layer.id}`,
      };
      if (layer.layout) {
        cleaned.layout = omitIconKeys(layer.layout);
      }
      if (layer.paint) {
        cleaned.paint = omitIconKeys(layer.paint);
      }
      return cleaned;
    });
}

/** Returns the SMK `vector-tile` basemap definition backed by the bundled `bc.pmtiles`. */
export function offlineBasemapConfig(origin = window.location.origin): Record<string, any> {
  return {
    id: OFFLINE_BASEMAP_ID,
    title: 'Offline',
    internal: true,
    type: 'vector-tile',
    sourceId: OFFLINE_BASEMAP_SOURCE_ID,
    tiles: [`pmtiles://${origin}${OFFLINE_PMTILES_PATH}/{z}/{x}/{y}`],
    option: { minZoom: 0, maxZoom: 12 },
    attribution: OSM_ATTRIBUTION,
    glyphs: `${origin}${OFFLINE_GLYPHS_PATH}`,
    layers: offlineBasemapStyleLayers(),
  };
}

function omitIconKeys(obj: Record<string, any>): Record<string, any> {
  const out: Record<string, any> = {};
  for (const [k, v] of Object.entries(obj)) {
    if (!k.startsWith('icon-')) {
      out[k] = v;
    }
  }
  return out;
}
