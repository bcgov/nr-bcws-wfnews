import { isAndroidViaNavigator } from '@app/utils';
import { AppConfigService } from '@wf1/core-ui';
import { WfDevice } from '@wf1/wfcc-application-ui';
import { MapServices, MapServiceStatus } from '.';
import { LayerDisplayConfig } from './layer-display.config';
import { LayerConfig } from './layers';

const BC_EXTENT = [-136.3, 49, -116, 60.2];

// Leaflet fits an extent at a whole zoom level and rounds down (zoomSnap is 1). BC is
// 20.3 degrees wide, which needs zoom 4.93 in a phone's width, so the fit settles for 4
// and gives up most of a level of scale. A phone screen is tall, and that spare height
// then fills with everything from the Yukon down to Mexico.
//
// Round up instead, but only where the rounding costs that much: on a narrow screen there
// is height to spare, so trimming a little from the east and west edges of the province
// is the cheaper of the two. A wide screen already lands on a sensible level, and a named
// zoom there would push the view back out, so it keeps the plain fit.
const NARROW_VIEWPORT_MAX_WIDTH = 600;

const bcLocation = () => {
  const width = typeof window === 'undefined' ? 0 : window.innerWidth;
  if (!width || width > NARROW_VIEWPORT_MAX_WIDTH) {
    return { extent: BC_EXTENT };
  }
  const lonSpan = BC_EXTENT[2] - BC_EXTENT[0];
  // The zoom at which BC's width exactly fills the viewport, rounded up to a whole level.
  const zoom = Math.ceil(Math.log2((360 * width) / (256 * lonSpan)));
  // extent sets the centre, and the viewer applies zoom after it.
  return { extent: BC_EXTENT, zoom };
};

export const mapConfig = (
  mapServices: MapServices,
  serviceStatus: MapServiceStatus,
  device: WfDevice,
  appConfigService: AppConfigService
) => ({
  viewer: {
    type: 'leaflet',
    device,
    location: bcLocation(),
    baseMap: isAndroidViaNavigator() ? 'openstreetmap' : 'navigation',
    minZoom: 4,
    maxZoom: 30,
  },
  tools: [
    {
      type: 'location',
      enabled: false,
    },
    {
      type: 'layers',
      enabled: true,
      showTitle: false,
      position: 'shortcut-menu',
      glyph: {
        visible: 'check_box',
        hidden: 'check_box_outline_blank',
      },
      command: {
        allVisibility: false,
        filter: false,
        legend: false,
      },
      legend: true,
      order: 2,
      display: LayerDisplayConfig(mapServices),
    },
    {
      type: 'identify',
      title: 'Learn More',
      enabled: true,
      showTitle: false,
      showWidget: false,
      showPanel: false,
      radius: 20,
      command: {
        attributeMode: false,
        clear: false,
        nearBy: false,
        zoom: true,
        custom: true,
      },
      internalLayer: {
        'search-area': {
          style: {
            stroke: false,
            fill: true,
            fillColor: '#548ADB',
            fillOpacity: 0.3,
          },
        },
        'search-border-1': {
          style: {
            strokeWidth: 1,
            strokeColor: '#548ADB',
            strokeOpacity: 1,
            strokeCap: 'butt',
          },
        },
        'search-border-2': {
          style: {
            strokeWidth: 1,
            strokeColor: '#548ADB',
            strokeOpacity: 1,
            strokeCap: 'butt',
          },
        },
        location: {
          title: 'Identify Location',
          style: {
            markerUrl: null,
          },
          legend: {},
        },
        'edit-search-area': {
          style: {
            strokeWidth: 3,
            strokeColor: 'red',
            strokeOpacity: 1,
          },
        },
      },
    },
    {
      type: 'pan',
      enabled: true,
    },
    {
      type: 'zoom',
      enabled: true,
      mouseWheel: true,
      doubleClick: true,
      box: true,
      control: true,
    },
    {
      type: 'baseMaps',
      enabled: true,
      showTitle: false,
      showPanel: true,
      position: 'shortcut-menu',
      mapStyle: {
        width: '60px',
        height: '100px',
      },
      order: 3,
    },
    {
      type: 'time-dimension',
      enabled: true,
      timeDimensionOptions: {},
    },
    {
      type: 'scale',
      enabled: 'desktop',
      showZoom: true,
      order: 2,
    },
    {
      type: 'coordinate',
      enabled: 'desktop',
      order: 3,
      format: 'DDM',
    },
    {
      type: 'measure',
      enabled: 'desktop',
      unit: 'kilometers',
      position: 'actionbar',
      order: 5,
    },
    {
      type: 'search',
      enabled: false,
    },
  ],
  layers: LayerConfig(mapServices, serviceStatus, appConfigService),
});

export const reportOfFireMapConfig = (
  mapServices: MapServices,
  serviceStatus: MapServiceStatus,
  device: WfDevice,
  appConfigService: AppConfigService,
) => ({
  viewer: {
    type: 'leaflet',
    device,
    location: {
      extent: [-136.3, 49, -116, 60.2],
    },
    baseMap: 'imagery',
    minZoom: 4,
  },
  tools: [
    {
      type: 'pan',
      enabled: true,
    },
    {
      type: 'zoom',
      enabled: true,
      mouseWheel: true,
      doubleClick: true,
      box: true,
      control: true,
    },
    {
      type: 'baseMaps',
      enabled: false,
    },
    {
      type: 'search',
      enabled: false,
    },
    {
      type: 'search-location',
      enabled: false,
    },
    {
      type: 'markup',
      enabled: false,
    },
    {
      type: 'location',
      enabled: false,
    },
    {
      type: 'scale',
      enabled: false,
    },
    {
      type: 'bespoke',
      instance: 'full-screen',
      title: 'Full Screen',
      position: 'toolbar',
      enabled: false,
      order: 1,
      icon: 'open_in_full',
    },
  ],
});

export const reportOfFireOfflineMapConfig = (
  mapServices: MapServices,
  serviceStatus: MapServiceStatus,
  device: WfDevice,
  appConfigService: AppConfigService,
) => ({
  viewer: {
    type: 'leaflet',
    device,
    location: {
      extent: [-136.3, 49, -116, 60.2],
    },
    baseMap: 'imagery',
    zoomControl: false,
    doubleClickZoom: false,
    boxZoom: false,
    trackResize: false,
    scrollWheelZoom: false,
  },
  tools: [
    {
      type: 'pan',
      enabled: true,
    },
    {
      type: 'baseMaps',
      enabled: false,
    },
    {
      type: 'search',
      enabled: false,
    },
    {
      type: 'search-location',
      enabled: false,
    },
    {
      type: 'markup',
      enabled: false,
    },
    {
      type: 'location',
      enabled: false,
    },
    {
      type: 'scale',
      enabled: false,
    },
    {
      type: 'bespoke',
      instance: 'full-screen',
      title: 'Full Screen',
      position: 'toolbar',
      enabled: false,
      order: 1,
      icon: 'open_in_full',
    },
  ],
});
