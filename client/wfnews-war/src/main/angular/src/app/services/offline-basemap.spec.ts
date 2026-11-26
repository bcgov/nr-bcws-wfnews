import {
  OFFLINE_BASEMAP_ID,
  OFFLINE_BASEMAP_SOURCE_ID,
  OFFLINE_GLYPHS_PATH,
  OFFLINE_PMTILES_PATH,
  offlineBasemapConfig,
  QueryRangePmtilesSource,
  registerOfflineBasemapProtocol,
  resetOfflineBasemapProtocolForTests,
} from './offline-basemap';

describe('offlineBasemapConfig', () => {
  it('builds an SMK vector-tile basemap with OSM attribution and local glyphs', () => {
    const cfg = offlineBasemapConfig('https://localhost');

    expect(cfg.id).toBe(OFFLINE_BASEMAP_ID);
    expect(cfg.type).toBe('vector-tile');
    expect(cfg.internal).toBe(true);
    expect(cfg.sourceId).toBe(OFFLINE_BASEMAP_SOURCE_ID);
    expect(cfg.tiles).toEqual([`pmtiles://https://localhost${OFFLINE_PMTILES_PATH}/{z}/{x}/{y}`]);
    expect(cfg.option).toEqual({ minZoom: 0, maxZoom: 12 });
    expect(cfg.glyphs).toBe(`https://localhost${OFFLINE_GLYPHS_PATH}`);
    expect(cfg.attribution).toContain('openstreetmap.org');
  });

  it('strips background, dropped source layers, and sprite icon keys from Protomaps layers', () => {
    const cfg = offlineBasemapConfig('https://localhost');
    const layers: any[] = cfg.layers;

    expect(layers.length).toBeGreaterThan(0);
    for (const layer of layers) {
      expect(layer.id).toMatch(/^offline-/);
      expect(layer.type).not.toBe('background');
      expect(['landuse', 'buildings', 'pois']).not.toContain(layer['source-layer']);
      for (const k of Object.keys(layer.layout || {})) {
        expect(k.startsWith('icon-')).toBe(false);
      }
      for (const k of Object.keys(layer.paint || {})) {
        expect(k.startsWith('icon-')).toBe(false);
      }
    }
  });
});

describe('registerOfflineBasemapProtocol', () => {
  let savedMaplibre: any;

  beforeEach(() => {
    savedMaplibre = window['maplibregl'];
    resetOfflineBasemapProtocolForTests();
  });

  afterEach(() => {
    window['maplibregl'] = savedMaplibre;
    resetOfflineBasemapProtocolForTests();
  });

  it('registers the pmtiles protocol once on maplibregl', () => {
    const addProtocol = jasmine.createSpy('addProtocol');
    window['maplibregl'] = { addProtocol };

    registerOfflineBasemapProtocol('https://localhost', 'web');
    registerOfflineBasemapProtocol('https://localhost', 'web');

    expect(addProtocol).toHaveBeenCalledTimes(1);
    expect(addProtocol).toHaveBeenCalledWith('pmtiles', jasmine.any(Function));
  });

  it('registers the pmtiles protocol on android', () => {
    const addProtocol = jasmine.createSpy('addProtocol');
    window['maplibregl'] = { addProtocol };

    registerOfflineBasemapProtocol('https://localhost', 'android');

    expect(addProtocol).toHaveBeenCalledTimes(1);
    expect(addProtocol).toHaveBeenCalledWith('pmtiles', jasmine.any(Function));
  });
});

describe('QueryRangePmtilesSource', () => {
  it('returns the base archive URL from getKey without query parameters', () => {
    const source = new QueryRangePmtilesSource(`https://localhost${OFFLINE_PMTILES_PATH}`);
    expect(source.getKey()).toBe(`https://localhost${OFFLINE_PMTILES_PATH}`);
  });

  it('fetches byte ranges using ?start=&end= query parameters without a Range header', async () => {
    const bytes = new Uint8Array([1, 2, 3, 4]).buffer;
    const fetchSpy = spyOn(window, 'fetch').and.returnValue(
      Promise.resolve(new Response(bytes, { status: 200 })),
    );
    const source = new QueryRangePmtilesSource(`https://localhost${OFFLINE_PMTILES_PATH}`);
    const controller = new AbortController();

    const result = await source.getBytes(100, 50, controller.signal);

    expect(fetchSpy).toHaveBeenCalledWith(
      `https://localhost${OFFLINE_PMTILES_PATH}?start=100&end=149`,
      { signal: controller.signal },
    );
    expect(result.data.byteLength).toBe(4);
  });

  it('throws when the slice request returns a non-OK status', async () => {
    spyOn(window, 'fetch').and.returnValue(
      Promise.resolve(new Response('', { status: 416 })),
    );
    const source = new QueryRangePmtilesSource(`https://localhost${OFFLINE_PMTILES_PATH}`);

    try {
      await source.getBytes(0, 16);
      fail('expected QueryRangePmtilesSource.getBytes to reject');
    } catch (err: any) {
      expect(err?.message).toMatch(/HTTP 416/);
    }
  });
});
