import { of, throwError } from 'rxjs';
import { EventFeatureService, sqlText } from './event-feature.service';

describe('EventFeatureService', () => {
  const feature = (attributes: any) => ({ attributes, geometry: { rings: [[[0, 0]]] }, centroid: { x: 0, y: 0 } });
  let agol: any;
  let service: EventFeatureService;

  beforeEach(() => {
    agol = jasmine.createSpyObj('AGOLService', [
      'getBansAndProhibitionsById', 'getAreaRestrictions', 'getDangerRatings', 'getEvacOrdersByParam',
    ]);
    service = new EventFeatureService(agol);
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
    agol.getDangerRatings.and.returnValue(of({ features: [] }));
    expect(await service.getDangerRating('7')).toBeNull();
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
    agol.getDangerRatings.and.returnValue(of({ features: [] }));
    agol.getEvacOrdersByParam.and.returnValue(of({ features: [] }));
    const id = "1' OR '1'='1";

    await service.getAreaRestriction({ id });
    await service.getDangerRating(id);
    await service.getEvacuation({ id, eventNumber: 'K1' });

    const quoted = "'1'' OR ''1''=''1'";
    expect(agol.getAreaRestrictions.calls.mostRecent().args[0]).toBe(`PROT_RA_SYSID=${quoted}`);
    expect(agol.getDangerRatings.calls.mostRecent().args[0]).toBe(`PROT_DR_SYSID =${quoted}`);
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
    agol.getDangerRatings.and.returnValue(of({ features: [] }));

    await service.getBan('2');
    now = 60 * 1000;
    await service.getDangerRating('7');

    expect([...(service as any).answers.keys()]).toEqual(["danger-rating:PROT_DR_SYSID ='7'"]);
  });
});
