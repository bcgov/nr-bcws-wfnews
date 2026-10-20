import { previewMapConfig } from './map.config';

const zoomTool = (option?: Parameters<typeof previewMapConfig>[0]) =>
  previewMapConfig(option).tools.find((tool: any) => tool.type === 'zoom') as any;

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
