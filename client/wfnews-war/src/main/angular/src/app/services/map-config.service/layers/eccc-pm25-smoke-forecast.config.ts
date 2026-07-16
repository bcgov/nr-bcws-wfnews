import { layerSettings } from '.';

export function SmokeForecastLayerConfig(ls: layerSettings) {
  return [
    {
      type: 'wms-time',
      id: 'eccc-pm25-smoke-forecast',
      title: 'Smoke Forecast, Hourly',
      isQueryable: false,
      opacity: 0.65,
      minScale: null,
      maxScale: null,
      titleAttribute: null,
      attributes: false,
      queries: null,
      tiled: false,
      version: '1.3.0',
      serviceUrl: 'https://geo.weather.gc.ca/geomet',
      layerName: 'RAQDPS.Sfc_PM2.5-WildfireSmokePlume',
      styleName: 'PM2.5_0to500ugm3_Dis',
      legend: {
        title: ' ',
        url: 'assets/images/eccc-smoke-legend.svg',
      },
    },
  ];
}
