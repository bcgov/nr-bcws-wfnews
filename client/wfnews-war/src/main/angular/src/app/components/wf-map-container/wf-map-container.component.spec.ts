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
