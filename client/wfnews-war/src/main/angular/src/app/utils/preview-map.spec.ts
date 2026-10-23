import {
  boundsToExtent, coordsToExtent, extentToParam, flashArea, highlightArea, padExtent, paramToExtent, pingPoint, polygonRings,
  ringsToExtent,
  zoomToCoords,
} from './preview-map';

/** A ring near Kamloops, in the AGOL and GeoJSON order: [longitude, latitude]. */
const RING = [
  [-120.5, 50.5],
  [-120.0, 50.5],
  [-120.0, 51.0],
  [-120.5, 51.0],
  [-120.5, 50.5],
];

describe('preview-map', () => {
  describe('boundsToExtent', () => {
    it('turns latitude-first bounds into an extent', () => {
      expect(boundsToExtent([[50.5, -120.5], [51.0, -120.0]])).toEqual([
        -120.5, 50.5, -120.0, 51.0,
      ]);
    });

    it('answers undefined for bad input', () => {
      expect(boundsToExtent(null)).toBeUndefined();
      expect(boundsToExtent([[1, 2]])).toBeUndefined();
      expect(boundsToExtent([[NaN, 2], [3, 4]])).toBeUndefined();
    });
  });

  describe('coordsToExtent', () => {
    it('answers [west, south, east, north]', () => {
      expect(coordsToExtent(RING)).toEqual([-120.5, 50.5, -120.0, 51.0]);
    });

    it('needs no convex hull, so two points are enough', () => {
      expect(coordsToExtent([[-120.5, 50.5], [-120.0, 51.0]])).toEqual([
        -120.5, 50.5, -120.0, 51.0,
      ]);
    });

    it('answers undefined for no coordinates', () => {
      expect(coordsToExtent([])).toBeUndefined();
      expect(coordsToExtent(null)).toBeUndefined();
    });
  });

  describe('ringsToExtent', () => {
    it('takes the box of every ring', () => {
      expect(ringsToExtent([RING, [[-121, 50], [-120.8, 50.2]]])).toEqual([-121, 50, -120.0, 51.0]);
    });

    it('answers undefined for no rings', () => {
      expect(ringsToExtent(undefined)).toBeUndefined();
    });
  });

  describe('polygonRings', () => {
    const island = [[-121, 50], [-120.8, 50], [-120.8, 50.2], [-121, 50]];

    it('gives the rings of a Polygon', () => {
      expect(polygonRings({ type: 'Polygon', coordinates: [RING] })).toEqual([RING]);
    });

    it('gives the rings of every part of a MultiPolygon', () => {
      const rings = polygonRings({ type: 'MultiPolygon', coordinates: [[RING], [island]] });
      expect(rings).toEqual([RING, island]);
      expect(coordsToExtent(rings.flat())).toEqual([-121, 50, -120.0, 51.0]);
    });

    it('answers undefined for a point or no geometry', () => {
      expect(polygonRings({ type: 'Point', coordinates: [-120, 50] })).toBeUndefined();
      expect(polygonRings(undefined)).toBeUndefined();
    });
  });

  describe('extent query param', () => {
    it('makes the round trip', () => {
      const extent = [-120.5, 50.5, -120.0, 51.0];
      expect(paramToExtent(extentToParam(extent))).toEqual(extent);
    });

    it('answers undefined for no extent', () => {
      expect(extentToParam(undefined)).toBeUndefined();
      expect(paramToExtent(undefined)).toBeUndefined();
    });

    it('refuses a box that is not one', () => {
      expect(paramToExtent('1,2,3')).toBeUndefined();
      expect(paramToExtent('a,2,3,4')).toBeUndefined();
      expect(paramToExtent('-120,51,-120.5,50.5')).toBeUndefined();
    });
  });

  describe('padExtent', () => {
    it('adds the ratio of the width and the height to each side', () => {
      expect(padExtent([-122, 50, -120, 54], 0.25)).toEqual([-122.5, 49, -119.5, 55]);
    });
  });

  describe('zoomToCoords', () => {
    it('sends the extent to the viewer', () => {
      const setView = jasmine.createSpy('setView');
      zoomToCoords({ $viewer: { setView } }, RING);
      expect(setView).toHaveBeenCalledWith({
        extent: [-120.5, 50.5, -120.0, 51.0],
      });
    });

    it('moves nothing when there is no extent', () => {
      const setView = jasmine.createSpy('setView');
      zoomToCoords({ $viewer: { setView } }, []);
      expect(setView).not.toHaveBeenCalled();
    });
  });

  describe('Zoom to effects', () => {
    let moveEnd: () => void;
    let moving: boolean;
    let showFeature: jasmine.Spy;
    let smk: any;
    const drawn = (acetate: string) =>
      showFeature.calls.allArgs().filter(([name, geometry]) => name === acetate && geometry).length;

    beforeEach(() => {
      jasmine.clock().install();
      moving = false;
      showFeature = jasmine.createSpy('showFeature');
      smk = {
        showFeature,
        $viewer: { map: { isMoving: () => moving, once: (_: string, fn: () => void) => (moveEnd = fn) } },
      };
    });

    afterEach(() => jasmine.clock().uninstall());

    it('rings a place, then clears the ring', () => {
      pingPoint(smk, -120, 50);
      const [, geometry, option] = showFeature.calls.mostRecent().args;
      expect(geometry.coordinates).toEqual([-120, 50]);
      expect(option.htmlMarker().classList).toContain('marker-ping');

      jasmine.clock().tick(3600);
      expect(showFeature.calls.mostRecent().args).toEqual(['zoom-ping']);
    });

    it('waits for the zoom to land', () => {
      moving = true;
      pingPoint(smk, -120, 50);
      expect(drawn('zoom-ping')).toBe(0);
      moveEnd();
      expect(drawn('zoom-ping')).toBe(1);
    });

    it('lets a newer press replace one still waiting', () => {
      moving = true;
      pingPoint(smk, -120, 50);
      const first = moveEnd;
      pingPoint(smk, -121, 51);
      first();
      expect(drawn('zoom-ping')).toBe(0);
      moveEnd();
      expect(showFeature.calls.mostRecent().args[1].coordinates).toEqual([-121, 51]);
    });

    it('glows round an area under the outline, then clears it', () => {
      spyOn(window, 'requestAnimationFrame').and.callFake((fn: FrameRequestCallback) =>
        setTimeout(() => fn(performance.now()), 16) as any);
      const opacities: number[] = [];
      const moved: string[][] = [];
      Object.assign(smk.$viewer.map, {
        getLayer: () => ({}),
        setPaintProperty: (layer: string, name: string, value: number) =>
          layer.endsWith('-outline') && name === 'line-opacity' && opacities.push(value),
        moveLayer: (...args: string[]) => moved.push(args),
      });
      const now = spyOn(performance, 'now').and.returnValue(0);

      flashArea(smk, [RING]);
      expect(drawn('zoom-flash')).toBe(1);
      expect(moved).toContain(['smk-acetate-zoom-flash-outline', 'smk-acetate-area-highlight-outline']);

      // The top of the first pulse.
      now.and.returnValue(600);
      jasmine.clock().tick(16);
      now.and.returnValue(3600);
      jasmine.clock().tick(16);
      expect(Math.max(...opacities)).toBeGreaterThan(0.5);
      expect(showFeature.calls.mostRecent().args).toEqual(['zoom-flash']);
    });

    it('drops zigzags too small to see at the zoom', () => {
      // A saw-tooth edge with a tooth every 0.001 degrees.
      const saw = Array.from({ length: 501 }, (_, i) => [-121 + i * 0.002, 50 + (i % 2) * 0.001]);
      const jagged = [...saw, [-120, 51], [-121, 51], saw[0]];
      smk.$viewer.map.getZoom = () => 7;

      flashArea(smk, [jagged]);
      const ring = showFeature.calls.mostRecent().args[1].features[0].geometry.coordinates[0];
      expect(ring.length).toBeLessThan(10);
      expect(ring[0]).toEqual(ring[ring.length - 1]);
    });

    it('keeps the corners of a straight-edged area', () => {
      const square = [[-120, 50], [-119, 50], [-119, 51], [-120, 51], [-120, 50]];
      smk.$viewer.map.getZoom = () => 11;

      flashArea(smk, [square]);
      expect(showFeature.calls.mostRecent().args[1].features[0].geometry.coordinates[0]).toEqual(square);
    });

    it('does nothing without a map or an area', () => {
      expect(() => pingPoint(null, -120, 50)).not.toThrow();
      flashArea(smk, []);
      expect(showFeature).not.toHaveBeenCalled();
    });
  });

  describe('highlightArea', () => {
    it('draws every ring into the one acetate, in the GeoJSON order', () => {
      const showFeature = jasmine.createSpy('showFeature');
      highlightArea({ showFeature }, [RING]);

      const [acetate, geometry, option] = showFeature.calls.mostRecent().args;
      expect(showFeature).toHaveBeenCalledTimes(1);
      expect(acetate).toBe('area-highlight');
      expect(geometry.features.length).toBe(1);
      expect(geometry.features[0].geometry.type).toBe('Polygon');
      // No swap: the AGOL ring is already [longitude, latitude].
      expect(geometry.features[0].geometry.coordinates[0]).toEqual(RING);
      expect(option.paint['fill-color']).toBe('white');
    });

    it('clears the acetate when there are no rings', () => {
      const showFeature = jasmine.createSpy('showFeature');
      highlightArea({ showFeature });
      expect(showFeature).toHaveBeenCalledWith('area-highlight');
    });

    it('does nothing without a map', () => {
      expect(() => highlightArea(null, [RING])).not.toThrow();
    });
  });
});
