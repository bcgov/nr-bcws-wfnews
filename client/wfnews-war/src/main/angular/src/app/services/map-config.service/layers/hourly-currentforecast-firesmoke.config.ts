import { layerSettings } from '.';

export function SmokeForecastLayerConfig(ls: layerSettings) {
  return [
    {
      type: 'image',
      id: 'hourly-currentforecast-firesmoke',
      title: 'Smoke Forecast, Hourly',
      opacity: 0.65,
      //https://firesmoke.ca/forecasts/BSC00CA12-01/current/images/hourly_202310290100.png
      baseUrl:
        'https://firesmoke.ca/forecasts/BSC00CA12-01/current/images/hourly_<%= timestamp %>.png',
      bounds: [
        [32.0, -160.0],
        [70.0, -52.0],
      ],
      legend: {
        title: ' ',
        url: 'assets/images/firesmoke-legend.png',
      },
    },
  ];
}
