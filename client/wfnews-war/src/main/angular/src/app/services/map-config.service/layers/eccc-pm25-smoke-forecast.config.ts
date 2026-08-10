import { layerSettings } from '.';

export function SmokeForecastLayerConfig(ls: layerSettings) {
  return [
    {
      type: 'wms-time',
      id: 'eccc-pm25-smoke-forecast',
      title: 'Smoke Forecast, Hourly',
      attribution: 'Environment and Climate Change Canada (ECCC)',
      isQueryable: false,
      opacity: 0.8,
      minScale: null,
      maxScale: null,
      titleAttribute: null,
      attributes: false,
      queries: null,
      tiled: false,
      version: '1.3.0',
      format: 'image/png',
      serviceUrl: 'https://geo.weather.gc.ca/geomet',
      layerName: 'RAQDPS.Sfc_PM2.5-WildfireSmokePlume',
      styleName: 'PM2.5_1e-9to2.5e-7kgm3_RedGrey',
      legend: {
        title: ' ',
        url: 'assets/images/eccc-smoke-legend.svg',
      },
    },
  ];
}
