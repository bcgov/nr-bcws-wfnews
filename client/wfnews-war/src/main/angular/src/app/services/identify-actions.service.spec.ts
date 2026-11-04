import { of, throwError } from 'rxjs';
import { FOCUS_DURATION_MS, IdentifyActionsService, fitBoundsSnapped } from './identify-actions.service';

const RING = [
  [-120.5, 50.5],
  [-120.0, 50.5],
  [-120.0, 51.0],
  [-120.5, 51.0],
  [-120.5, 50.5],
];
const ISLAND = [[-121, 50], [-120.8, 50], [-120.8, 50.2], [-121, 50]];
const AGOL_RING = [[-123, 49], [-122.9, 49], [-122.9, 49.1], [-123, 49]];
const TAP = { longitude: '-120.2', latitude: '50.7' };

describe('IdentifyActionsService zoomTarget', () => {
  let agol: any;
  let service: IdentifyActionsService;

  beforeEach(() => {
    agol = jasmine.createSpyObj('AGOLService', ['getDangerRatings']);
    agol.getDangerRatings.and.returnValue(of({ features: [{ geometry: { rings: [AGOL_RING] } }] }));
    const mapConfig: any = { getMapConfig: () => Promise.resolve() };
    service = new IdentifyActionsService(null, agol, null, null, mapConfig);
  });

  it('goes to the fire when its Incident loaded', async () => {
    const item = { layerId: 'fire-perimeters', geometry: { type: 'Polygon', coordinates: [RING] } };

    expect(await service.zoomTarget(item, { longitude: '-121', latitude: '51' })).toEqual({ type: 'incident', point: [-121, 51] });
  });

  it('fits every part of a MultiPolygon Protected Land', async () => {
    const item = {
      layerId: 'protected-lands-access-restrictions',
      _identifyPoint: TAP,
      geometry: { type: 'MultiPolygon', coordinates: [[RING], [ISLAND]] },
    };

    expect(await service.zoomTarget(item)).toEqual({ type: 'area', rings: [RING, ISLAND] });
  });

  it('fits the identify area of a danger rating and does not ask AGOL', async () => {
    const item = { layerId: 'danger-rating', _identifyPoint: TAP, properties: { PROT_DR_SYSID: 122 }, geometry: { type: 'Polygon', coordinates: [RING] } };

    expect(await service.zoomTarget(item)).toEqual({ type: 'area', rings: [RING] });
    expect(agol.getDangerRatings).not.toHaveBeenCalled();
  });

  it('asks AGOL when the identify answer has no area', async () => {
    const item = { layerId: 'danger-rating', _identifyPoint: TAP, properties: { PROT_DR_SYSID: 122 } };

    expect(await service.zoomTarget(item)).toEqual({ type: 'area', rings: [AGOL_RING] });
  });

  it('goes to the tapped point when AGOL fails', async () => {
    spyOn(console, 'error');
    agol.getDangerRatings.and.returnValue(throwError(() => new Error('offline')));
    const item = { layerId: 'danger-rating', _identifyPoint: TAP, properties: { PROT_DR_SYSID: 122 } };

    expect(await service.zoomTarget(item)).toEqual({ type: 'point', point: [-120.2, 50.7] });
  });

  it('drops a pin on a road event', async () => {
    const item = { layerId: 'drive-bc-active-events', _identifyPoint: TAP, geometry: { type: 'Point', coordinates: [-119, 49.5] } };

    expect(await service.zoomTarget(item)).toEqual({ type: 'pin', point: [-119, 49.5] });
  });

  it('goes to the point of a result with no area, and nowhere without a point', async () => {
    const station = { layerId: 'weather-stations', geometry: { type: 'Point', coordinates: [-118, 50] } };

    expect(await service.zoomTarget(station)).toEqual({ type: 'point', point: [-118, 50] });
    expect(await service.zoomTarget({ layerId: 'weather-stations' })).toBeNull();
  });
});

describe('fitBoundsSnapped', () => {
  const BOUNDS = [[-121, 50], [-120, 51]];
  const OPTIONS = { padding: { top: 88, left: 32, right: 32, bottom: 446 }, duration: FOCUS_DURATION_MS };

  it('fits no further in than the rounded zoom, so MapLibre centres the box for that zoom', () => {
    const map = { cameraForBounds: jasmine.createSpy().and.returnValue({ zoom: 11 }), fitBounds: jasmine.createSpy() };
    fitBoundsSnapped(map, BOUNDS, OPTIONS);
    expect(map.cameraForBounds).toHaveBeenCalledWith(BOUNDS, OPTIONS);
    expect(map.fitBounds).toHaveBeenCalledWith(BOUNDS, { ...OPTIONS, maxZoom: 11 });
  });

  it('gives MapLibre the fit unchanged when the box cannot fit', () => {
    const map = { cameraForBounds: jasmine.createSpy().and.returnValue(undefined), fitBounds: jasmine.createSpy() };
    fitBoundsSnapped(map, BOUNDS, OPTIONS);
    expect(map.fitBounds).toHaveBeenCalledWith(BOUNDS, OPTIONS);
  });
});
