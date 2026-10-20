import { boundsToExtent, coordsToExtent, highlightArea, zoomToCoords } from './preview-map';

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
    it('turns the Leaflet bounds order into an extent', () => {
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
