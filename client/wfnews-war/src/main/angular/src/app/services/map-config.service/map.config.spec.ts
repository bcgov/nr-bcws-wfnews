import { previewMapConfig, reportOfFireMapConfig } from './map.config';

const zoomTool = (option?: Parameters<typeof previewMapConfig>[0]) =>
  previewMapConfig(option).tools.find((tool: any) => tool.type === 'zoom') as any;

describe('previewMapConfig basemap', () => {
  it('starts on Terrain, as the main map does', () => {
    expect(previewMapConfig().viewer.baseMap).toBe('topography');
  });

  it('uses an explicit basemap when requested', () => {
    expect(previewMapConfig({ baseMap: 'offline' }).viewer.baseMap).toBe('offline');
  });
});

describe('reportOfFireMapConfig basemap', () => {
  it('defaults to Terrain and accepts offline basemap override', () => {
    expect(reportOfFireMapConfig(null, null, 'desktop', null).viewer.baseMap).toBe('topography');
    expect(reportOfFireMapConfig(null, null, 'desktop', null, 'offline').viewer.baseMap).toBe('offline');
  });
});

describe('previewMapConfig zoom', () => {
  it('has no zoom by default', () => {
    expect(zoomTool()).toEqual(jasmine.objectContaining({
      enabled: false, control: false, mouseWheel: false, doubleClick: false, box: false,
    }));
  });

  it('gives the +/- control alone for a picture with a control', () => {
    expect(zoomTool({ zoomControl: true })).toEqual(jasmine.objectContaining({
      enabled: true, control: true, mouseWheel: false, doubleClick: false, box: false,
    }));
  });

  it('gives the gestures with no buttons for a map the user explores', () => {
    expect(zoomTool({ zoomGestures: true })).toEqual(jasmine.objectContaining({
      enabled: true, control: false, mouseWheel: true, doubleClick: true, box: true,
    }));
  });
});
