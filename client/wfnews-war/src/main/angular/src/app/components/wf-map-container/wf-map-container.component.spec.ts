import { fakeAsync, flushMicrotasks, tick } from '@angular/core/testing';
import { WFMapContainerComponent } from './wf-map-container.component';

/** A stand-in SMK map that keeps its handlers, so a test can fire the events. */
function fakeSmk(featureSet: any = {}) {
  const viewerHandlers: Record<string, Function[]> = {};
  const mapHandlers: Record<string, Function[]> = {};
  const on = (handlers, name) => (fn) => (handlers[name] ??= []).push(fn);
  return {
    fire: (name: string, ev: any) => viewerHandlers[name]?.forEach((fn) => fn(ev)),
    zoomEnd: (ev: any) => mapHandlers.zoomend?.slice().forEach((fn) => fn(ev)),
    destroy: () => {},
    $viewer: {
      startedIdentify: on(viewerHandlers, 'startedIdentify'),
      finishedIdentify: on(viewerHandlers, 'finishedIdentify'),
      identified: { featureSet },
      map: {
        on: (name, fn) => on(mapHandlers, name)(fn),
        off: (name, fn) => {
          mapHandlers[name] = (mapHandlers[name] || []).filter((h) => h !== fn);
        },
      },
    },
  };
}

function container(smk: any) {
  const zone = {
    inside: false,
    run(fn: () => any) {
      zone.inside = true;
      try {
        return fn();
      } finally {
        zone.inside = false;
      }
    },
  };
  const wfMap = { createSMK: () => Promise.resolve(smk) } as any;
  const pointId = { loadStationWeather: jasmine.createSpy('loadStationWeather') } as any;
  const component = new WFMapContainerComponent(wfMap, pointId, { get: () => zone } as any);
  component.mapContainer = { nativeElement: document.createElement('div') };
  component.mapConfig = [{}];

  const states: any[] = [];
  const results: any[] = [];
  component.identifyState.subscribe((s) => states.push(s));
  component.selectIncidents.subscribe((r) => results.push({ r, inZone: zone.inside }));
  return { component, pointId, states, results };
}

const AT = { location: { latitude: 50.7, longitude: -120.3 } };

describe('WFMapContainerComponent identify', () => {
  it('shows "searching" when an identify starts at a point', fakeAsync(() => {
    const smk = fakeSmk();
    const { component, states } = container(smk);
    component.initMap();
    flushMicrotasks();

    smk.fire('startedIdentify', AT);
    smk.fire('startedIdentify', {});

    expect(states).toEqual(['searching']);
  }));

  it('sends the results inside the Angular zone after 500 ms', fakeAsync(() => {
    const featureSet = { a: { layerId: 'active-wildfires' } };
    const smk = fakeSmk(featureSet);
    const { component, results } = container(smk);
    component.initMap();
    flushMicrotasks();

    smk.fire('finishedIdentify', AT);
    tick(499);
    expect(results).toEqual([]);
    tick(1);

    expect(results).toEqual([{ r: featureSet, inZone: true }]);
  }));

  it('ignores the finish of a clear, which has no location', fakeAsync(() => {
    const smk = fakeSmk({ a: {} });
    const { component, results } = container(smk);
    component.initMap();
    flushMicrotasks();

    smk.fire('finishedIdentify', {});
    tick(500);

    expect(results).toEqual([]);
  }));

  it('starts the weather for each weather station found', fakeAsync(() => {
    const station = { layerId: 'weather-stations' };
    const smk = fakeSmk({ a: station, b: { layerId: 'active-wildfires' } });
    const { component, pointId } = container(smk);
    component.initMap();
    flushMicrotasks();

    smk.fire('finishedIdentify', AT);
    tick(500);

    expect(pointId.loadStationWeather.calls.allArgs()).toEqual([[station]]);
  }));

  it('drops the results when the user zooms before they show', fakeAsync(() => {
    const smk = fakeSmk({ a: {} });
    const { component, states, results } = container(smk);
    component.initMap();
    flushMicrotasks();

    smk.fire('finishedIdentify', AT);
    smk.zoomEnd({ originalEvent: {} });
    tick(500);

    expect(results).toEqual([]);
    expect(states).toEqual([null]);
  }));

  it("keeps the results through SMK's own zoom, which has no originalEvent", fakeAsync(() => {
    const smk = fakeSmk({ a: {} });
    const { component, results } = container(smk);
    component.initMap();
    flushMicrotasks();

    smk.fire('finishedIdentify', AT);
    smk.zoomEnd({});
    tick(500);

    expect(results.length).toBe(1);
  }));

  it('gives each map only its own results', fakeAsync(() => {
    const smkA = fakeSmk({ a: {} });
    const smkB = fakeSmk({ b: {} });
    const mapA = container(smkA);
    const mapB = container(smkB);
    mapA.component.initMap();
    mapB.component.initMap();
    flushMicrotasks();

    smkA.fire('finishedIdentify', AT);
    tick(500);

    expect(mapA.results.map((x) => x.r)).toEqual([{ a: {} }]);
    expect(mapB.results).toEqual([]);
  }));
});

const station = (code: number, name: string, lon: number, lat: number) => ({
  type: 'Feature',
  geometry: { type: 'Point', coordinates: [lon, lat] },
  properties: { STATION_CODE: code, STATION_NAME: name },
});
const NADINA = station(179, 'NADINA', -126.9278167, 53.942483);
const MCBRIDE = station(180, 'MCBRIDE LAKE', -127.3994167, 54.074733);
const MORICE_LAKE = { location: { map: { latitude: 53.9, longitude: -127.3 } } };

let urlCount = 0;

/** A map with the weather station layer. Each one has its own URL, so no test reuses a list. */
function stationSmk(featureSet: any = {}, visible = true) {
  const smk: any = fakeSmk(featureSet);
  urlCount += 1;
  smk.$viewer.layerId = {
    'weather-stations': { config: { serviceUrl: `https://maps.test/${urlCount}`, layerName: 'pub:STATIONS' } },
  };
  smk.$viewer.isDisplayContextItemVisible = (id) => visible && id === 'weather-stations';
  smk.$viewer.identified.add = (layerId, features) =>
    features.forEach((f) => {
      f.layerId = layerId;
      featureSet[`${layerId}.${f.properties.STATION_CODE}`] = f;
    });
  return smk;
}

function stationResponse(delayMs = 0) {
  const body = { ok: true, json: () => Promise.resolve({ features: [NADINA, MCBRIDE] }) };
  return new Promise((resolve) => setTimeout(() => resolve(body), delayMs));
}

describe('WFMapContainerComponent nearest weather station', () => {
  it('adds the nearest station when none is under the click', fakeAsync(() => {
    const fetchSpy = spyOn(window, 'fetch').and.returnValue(stationResponse() as any);
    const smk = stationSmk({ a: { layerId: 'active-wildfires' } });
    const { component, pointId, results } = container(smk);
    component.initMap();
    flushMicrotasks();

    smk.fire('startedIdentify', MORICE_LAKE);
    smk.fire('finishedIdentify', MORICE_LAKE);
    tick(500);

    const added = results[0].r['weather-stations.180'];
    expect(added.title).toBe('MCBRIDE LAKE');
    expect(added._identifyPoint).toEqual(MORICE_LAKE.location.map);
    expect(pointId.loadStationWeather).toHaveBeenCalledWith(added);
    expect(fetchSpy.calls.count()).toBe(1);
    expect(fetchSpy.calls.argsFor(0)[0]).toContain('request=GetFeature&srsName=EPSG%3A4326&typename=pub%3ASTATIONS');
  }));

  it('keeps the station that the identify found', fakeAsync(() => {
    spyOn(window, 'fetch').and.returnValue(stationResponse() as any);
    const smk = stationSmk({ a: { layerId: 'weather-stations' } });
    const { component, results } = container(smk);
    component.initMap();
    flushMicrotasks();

    smk.fire('startedIdentify', MORICE_LAKE);
    smk.fire('finishedIdentify', MORICE_LAKE);
    tick(500);

    expect(Object.keys(results[0].r)).toEqual(['a']);
  }));

  it('adds no station when the layer is off', fakeAsync(() => {
    spyOn(window, 'fetch').and.returnValue(stationResponse() as any);
    const smk = stationSmk({}, false);
    const { component, results } = container(smk);
    component.initMap();
    flushMicrotasks();

    smk.fire('startedIdentify', MORICE_LAKE);
    smk.fire('finishedIdentify', MORICE_LAKE);
    tick(500);

    expect(Object.keys(results[0].r)).toEqual([]);
  }));

  it('sends the results without a station that comes too late, and does not add it after', fakeAsync(() => {
    spyOn(window, 'fetch').and.returnValue(stationResponse(2000) as any);
    const featureSet = {};
    const smk = stationSmk(featureSet);
    const { component, results } = container(smk);
    component.initMap();
    flushMicrotasks();

    smk.fire('startedIdentify', MORICE_LAKE);
    smk.fire('finishedIdentify', MORICE_LAKE);
    tick(999);
    expect(results).toEqual([]);
    tick(1);
    expect(results.length).toBe(1);

    tick(1000);
    expect(Object.keys(featureSet)).toEqual([]);
    expect(results.length).toBe(1);
  }));

  it('does not add an old station to the results of a new identify', fakeAsync(() => {
    spyOn(window, 'fetch').and.returnValue(stationResponse(300) as any);
    const featureSet = {};
    const smk = stationSmk(featureSet);
    const { component } = container(smk);
    component.initMap();
    flushMicrotasks();

    smk.fire('startedIdentify', MORICE_LAKE);
    smk.fire('finishedIdentify', MORICE_LAKE);
    smk.fire('startedIdentify', MORICE_LAKE);
    tick(300);

    expect(Object.keys(featureSet)).toEqual([]);
    tick(700);
  }));

  it('tries the list again after a failed request', fakeAsync(() => {
    let calls = 0;
    const fetchSpy = spyOn(window, 'fetch').and.callFake(() =>
      (++calls === 1 ? Promise.reject(new Error('offline')) : stationResponse()) as any,
    );
    const smk = stationSmk();
    const { component, results } = container(smk);
    component.initMap();
    flushMicrotasks();

    smk.fire('startedIdentify', MORICE_LAKE);
    smk.fire('finishedIdentify', MORICE_LAKE);
    tick(500);
    expect(Object.keys(results[0].r)).toEqual([]);

    smk.fire('startedIdentify', MORICE_LAKE);
    smk.fire('finishedIdentify', MORICE_LAKE);
    tick(500);

    expect(fetchSpy.calls.count()).toBe(2);
    expect(Object.keys(results[1].r)).toEqual(['weather-stations.180']);
  }));
});
