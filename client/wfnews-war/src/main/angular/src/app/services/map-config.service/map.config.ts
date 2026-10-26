import { AppConfigService } from '@wf1/core-ui';
import { WfDevice } from '@wf1/wfcc-application-ui';
import { MapServices, MapServiceStatus } from '.';
import { LayerDisplayConfig } from './layer-display.config';
import { LayerConfig } from './layers';

const BC_EXTENT = [-139.1, 46.52, -114.06, 61.4];

// A fit rounds down to a whole zoom (zoomSnap is 1). On a phone this extent loses most
// of a level, and the tall screen fills from the Yukon to Mexico. So a narrow screen
// rounds up and trims the east and west edges instead.
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
    type: 'maplibre',
    device,
    location: bcLocation(),
    baseMap: 'topography',
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
      // WFNEWS shows the search and "No features found" in its own panel.
      showStatus: false,
      radius: 20,
      command: {
        attributeMode: false,
        clear: false,
        nearBy: false,
        zoom: true,
        custom: true,
      },
      internalLayer: {
        // No SMK teardrop pin on a picked point; the fire's own marker is already there.
        // A point style with no image and no colours draws nothing.
        'highlight-point': {
          style: { markerUrl: '', shadowUrl: '' },
        },
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
    type: 'maplibre',
    device,
    location: {
      extent: [-136.3, 49, -116, 60.2],
    },
    baseMap: 'topography',
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

/**
 * A small read-only map for the preview and detail panels. No toolbar: the
 * screen around it supplies the controls.
 */
export const previewMapConfig = (option: {
  extent?: number[];
  center?: number[];
  zoom?: number;
  baseMap?: string;
  layers?: any[];
  maxZoom?: number;
  /** The +/- control and a reset to the configured view. reset-view needs both. */
  zoomControl?: boolean;
  /** Wheel, double click (or double tap) and box zoom, for a map the user explores. */
  zoomGestures?: boolean;
  pan?: boolean;
} = {}) => ({
  viewer: {
    type: 'maplibre',
    location: previewLocation(option),
    baseMap: option.baseMap || 'topography',
    // A phone-wide box needs zoom 3.4 to fit BC; a floor of 4 cut the province off.
    minZoom: 3,
    maxZoom: option.maxZoom || 30,
  },
  tools: [
    { type: 'pan', enabled: option.pan !== false },
    // Most of these maps are a picture with a control, so the gestures are off by default.
    {
      type: 'zoom',
      enabled: !!option.zoomControl || !!option.zoomGestures,
      control: !!option.zoomControl,
      mouseWheel: !!option.zoomGestures,
      doubleClick: !!option.zoomGestures,
      box: !!option.zoomGestures,
    },
    { type: 'reset-view', enabled: !!option.zoomControl },
    { type: 'baseMaps', enabled: false },
    { type: 'scale', enabled: false },
    { type: 'search', enabled: false },
    { type: 'layers', enabled: false },
    { type: 'identify', enabled: false },
    // SMK turns it on by default, so a click dropped a pin and an address popup.
    { type: 'location', enabled: false },
    { type: 'bespoke', instance: 'full-extent', enabled: false },
    { type: 'measure', enabled: false },
  ],
  layers: option.layers || [],
});

/** An extent wins over a centre, and reset-view returns to whichever is set. */
function previewLocation(option: { extent?: number[]; center?: number[]; zoom?: number }) {
  if (option.extent) {
    return { extent: option.extent };
  }
  if (option.center) {
    return { center: option.center, zoom: option.zoom ?? 9 };
  }
  return { extent: [-139, 48.3, -114, 60.2] };
}

export const reportOfFireOfflineMapConfig = (
  mapServices: MapServices,
  serviceStatus: MapServiceStatus,
  device: WfDevice,
  appConfigService: AppConfigService,
) => ({
  viewer: {
    type: 'maplibre',
    device,
    location: {
      extent: [-136.3, 49, -116, 60.2],
    },
    baseMap: 'topography',
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
