import { layerSettings } from '.';

export function WeatherStationsLayerConfig(ls: layerSettings) {
    return [
        {
            type: 'wms',
            id: 'weather-stations',
            title: 'BC Wildfire Active Weather Stations',
            isVisible: true,
            isQueryable: false,
            isDisplayed: false,
            opacity: 1,
            minScale: null,
            maxScale: null,
            titleAttribute: 'STATION_NAME',
            attributes: [
                {
                    id: 'station-name',
                    name: 'STATION_NAME',
                    title: 'STATION NAME',
                    visible: true
                },
                {
                    name: 'temp',
                    title: 'Temperature',
                    format: 'asUnit( \'°C\' )'
                },
                {
                    name: 'relativeHumidity',
                    title: 'Relative Humidity',
                    format: 'asUnit( \'%\' )'
                },
                {
                    name: 'windSpeed',
                    title: 'Wind Speed',
                    format: 'asUnit( \'km/h\' )'
                },
                {
                    name: 'windDirection',
                    title: 'Wind Direction',
                    format: 'asUnit( \'°\' )'
                },
                {
                    name: 'precipitation',
                    title: 'Precipitation',
                    format: 'asUnit( \'mm\' )'
                },
                {
                    name: 'fineFuelMoistureCode',
                    title: 'Fine Fuel Moisture Code'
                },
                {
                    name: 'initialSpreadIndex',
                    title: 'Initial Spread Index'
                },
                {
                    name: 'fireWeatherIndex',
                    title: 'Fire Weather Index'
                },
                {
                    title: 'Recorded',
                    name: 'recorded'
                }
            ],
            queries: null,
            serviceUrl: ls.openmapsBaseUrl,
            layerName: 'pub:WHSE_LAND_AND_NATURAL_RESOURCE.PROT_WEATHER_STATIONS_SP',
            styleName: '4881',
            geometryAttribute: 'SHAPE',
            popupTemplate: '@wf-weather-station-feature',
            legend: {
              title: ' ',
              url: ''
            },
            style:{
              strokeWidth:"1",
              strokeStyle:"1",
              strokeColor:"#FFFFFF00",
              strokeOpacity:"0",
              fillColor:"#FFFFFF00",
              fillOpacity:"0",
              fill: false
            }
        }
    ];
}
