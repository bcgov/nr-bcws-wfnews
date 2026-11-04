import { of, throwError } from 'rxjs';
import { EventFeatureService, sqlText } from './event-feature.service';

describe('EventFeatureService', () => {
  const feature = (attributes: any) => ({ attributes, geometry: { rings: [[[0, 0]]] }, centroid: { x: 0, y: 0 } });
  let agol: any;
  let http: any;
  let service: EventFeatureService;

  beforeEach(() => {
    agol = jasmine.createSpyObj('AGOLService', [
      'getBansAndProhibitionsById', 'getAreaRestrictions', 'getEvacOrdersByParam',
    ]);
    http = jasmine.createSpyObj('HttpClient', ['get']);
    const appConfig = { getConfig: () => ({ mapServices: { openmapsBaseUrl: 'https://databc/ows' } }) };
    service = new EventFeatureService(agol, http, appConfig as any);
  });

  it('downloads a ban once for the page text and its map', async () => {
    agol.getBansAndProhibitionsById.and.returnValue(of({ features: [feature({ PROT_BAP_SYSID: 2 })] }));

    const [first, second] = await Promise.all([service.getBan('2'), service.getBan('2')]);

    expect(agol.getBansAndProhibitionsById).toHaveBeenCalledTimes(1);
    expect(first).toBe(second);
    expect(agol.getBansAndProhibitionsById.calls.mostRecent().args[1]).toEqual(
      jasmine.objectContaining({ returnGeometry: true, returnCentroid: true }),
    );
  });

  it('asks again after a failure', async () => {
    agol.getBansAndProhibitionsById.and.returnValue(throwError(() => new Error('offline')));
    const failed = await service.getBan('2').then(() => false, () => true);
    expect(failed).toBe(true);

    agol.getBansAndProhibitionsById.and.returnValue(of({ features: [feature({})] }));
    expect(await service.getBan('2')).not.toBeNull();
    expect(agol.getBansAndProhibitionsById).toHaveBeenCalledTimes(2);
  });

  it('answers null when nothing matched', async () => {
    http.get.and.returnValue(of({ features: [] }));
    expect(await service.getDangerRating('7')).toBeNull();
  });

  it('reads the danger rating from DataBC, the source of the identify list', async () => {
    const square = [[[-122, 55], [-121, 55], [-121, 56], [-122, 56], [-122, 55]]];
    http.get.and.returnValue(of({
      features: [{ type: 'Feature', properties: { PROT_DR_SYSID: 35, DANGER_RATING_DESC: 'High' }, geometry: { type: 'Polygon', coordinates: square } }],
    }));

    const rating = await service.getDangerRating('35');

    const url = new URL(http.get.calls.mostRecent().args[0]);
    expect(url.origin + url.pathname).toBe('https://databc/ows');
    expect(url.searchParams.get('typename')).toBe('pub:WHSE_LAND_AND_NATURAL_RESOURCE.PROT_DANGER_RATING_SP');
    expect(url.searchParams.get('cql_filter')).toBe('PROT_DR_SYSID=35');
    expect(rating.attributes.DANGER_RATING_DESC).toBe('High');
    expect(rating.geometry.rings).toEqual(square);
    expect(rating.centroid.x).toBeGreaterThan(-122);
    expect(rating.centroid.x).toBeLessThan(-121);
    expect(rating.centroid.y).toBeGreaterThan(55);
    expect(rating.centroid.y).toBeLessThan(56);
  });

  it('gives every ring of a MultiPolygon danger rating', async () => {
    const a = [[0, 0], [1, 0], [1, 1], [0, 0]];
    const b = [[5, 5], [6, 5], [6, 6], [5, 5]];
    http.get.and.returnValue(of({
      features: [{ type: 'Feature', properties: {}, geometry: { type: 'MultiPolygon', coordinates: [[a], [b]] } }],
    }));
    expect((await service.getDangerRating('1')).geometry.rings).toEqual([a, b]);
  });

  it('asks for a danger rating only by a number', async () => {
    expect(await service.getDangerRating("1' OR '1'='1")).toBeNull();
    expect(await service.getDangerRating('1 OR 1=1')).toBeNull();
    expect(http.get).not.toHaveBeenCalled();
  });

  it('quotes a name with an apostrophe', async () => {
    agol.getAreaRestrictions.and.returnValue(of({ features: [feature({})] }));
    await service.getAreaRestriction({ name: "O'Keefe Creek" });
    expect(agol.getAreaRestrictions.calls.mostRecent().args[0]).toBe("NAME='O''Keefe Creek'");
    expect(sqlText("a'b'c")).toBe("a''b''c");
  });

  it('looks an area restriction up by id when it has no name', async () => {
    agol.getAreaRestrictions.and.returnValue(of({ features: [feature({})] }));
    await service.getAreaRestriction({ id: '12' });
    expect(agol.getAreaRestrictions.calls.mostRecent().args[0]).toBe("PROT_RA_SYSID='12'");
  });

  it('picks the evacuation by its event number', async () => {
    agol.getEvacOrdersByParam.and.returnValue(of({
      features: [feature({ EVENT_NUMBER: 'K1' }), feature({ EVENT_NUMBER: 'K2' })],
    }));
    const evac = await service.getEvacuation({ id: '0', eventNumber: 'K2' });
    expect(evac.attributes.EVENT_NUMBER).toBe('K2');
    expect(agol.getEvacOrdersByParam.calls.mostRecent().args[0]).toBe("EMRG_OAA_SYSID='0'");
  });

  it('quotes an id from a link', async () => {
    agol.getAreaRestrictions.and.returnValue(of({ features: [] }));
    agol.getEvacOrdersByParam.and.returnValue(of({ features: [] }));
    const id = "1' OR '1'='1";

    await service.getAreaRestriction({ id });
    await service.getEvacuation({ id, eventNumber: 'K1' });

    const quoted = "'1'' OR ''1''=''1'";
    expect(agol.getAreaRestrictions.calls.mostRecent().args[0]).toBe(`PROT_RA_SYSID=${quoted}`);
    expect(agol.getEvacOrdersByParam.calls.mostRecent().args[0]).toBe(`EMRG_OAA_SYSID=${quoted}`);
  });

  it('asks for a ban only by a number', async () => {
    agol.getBansAndProhibitionsById.and.returnValue(of({ features: [feature({})] }));

    expect(await service.getBan('2 OR 1=1')).toBeNull();
    expect(agol.getBansAndProhibitionsById).not.toHaveBeenCalled();
  });

  it('drops the answers too old to use', async () => {
    let now = 0;
    spyOn(Date, 'now').and.callFake(() => now);
    agol.getBansAndProhibitionsById.and.returnValue(of({ features: [feature({})] }));
    http.get.and.returnValue(of({ features: [] }));

    await service.getBan('2');
    now = 60 * 1000;
    await service.getDangerRating('7');

    expect([...(service as any).answers.keys()]).toEqual(['danger-rating:7']);
  });
});
