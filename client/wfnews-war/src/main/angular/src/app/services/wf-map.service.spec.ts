import { WFMapService } from './wf-map.service';

function fakeSmk(baseMap: string) {
  return {
    viewer: { baseMap },
    $viewer: { setBasemap: jasmine.createSpy('setBasemap') },
  };
}

describe('WFMapService basemap id', () => {
  let savedSmk: any;
  let service: WFMapService;

  beforeEach(() => {
    savedSmk = window['SMK'];
    service = new WFMapService(null, null, null);
  });

  afterEach(() => {
    window['SMK'] = savedSmk;
  });

  it("answers the Config's basemap before any change", () => {
    window['SMK'] = { MAP: { 1: fakeSmk('topography') } };

    expect(service.getBaseMap()).toBe('topography');
  });

  it('answers the new id at once, before the basemap loads', () => {
    const smk = fakeSmk('topography');
    window['SMK'] = { MAP: { 1: smk } };

    service.setBaseMap('imagery');

    expect(smk.$viewer.setBasemap).toHaveBeenCalledWith('imagery');
    expect(service.getBaseMap()).toBe('imagery');
  });

  it('keeps the id for each map, and answers for the last map', () => {
    const first = fakeSmk('topography');
    window['SMK'] = { MAP: { 1: first } };
    service.setBaseMap('imagery');

    window['SMK'] = { MAP: { 1: first, 2: fakeSmk('navigation') } };

    expect(service.getBaseMap()).toBe('navigation');
  });

  it('answers nothing when there is no map', () => {
    window['SMK'] = { MAP: {} };

    expect(service.getBaseMap()).toBeFalsy();
  });
});
