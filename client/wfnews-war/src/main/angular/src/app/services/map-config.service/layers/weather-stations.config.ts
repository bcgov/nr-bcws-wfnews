import { layerSettings } from ".";

export function WeatherStationsLayerConfig(ls: layerSettings) {
    return [
        {
            "type": "wms",
            "id": "weather-stations",
            "title": "BC Wildfire Active Weather Stations",
            "isVisible": true,
            "isQueryable": false,
            "isDisplayed": false,
            "opacity": 1,
            "minScale": null,
            "maxScale": null,
            "titleAttribute": "STATION_NAME",
            "attributes": [
                // {
                //     "id": "weather-stations-id",
                //     "name": "WEATHER_STATIONS_ID",
                //     "title": "WEATHER STATIONS ID",
                //     "visible": false
                // },
                // {
                //     "id": "station-code",
                //     "name": "STATION_CODE",
                //     "title": "STATION CODE",
                //     "visible": false
                // },
                {
                    "id": "station-name",
                    "name": "STATION_NAME",
                    "title": "STATION NAME",
                    "visible": true
                },
                // {
                //     "id": "station-acronym",
                //     "name": "STATION_ACRONYM",
                //     "title": "STATION ACRONYM",
                //     "visible": true
                // },
                // {
                //     "id": "latitude",
                //     "name": "LATITUDE",
                //     "title": "LATITUDE",
                //     "visible": false
                // },
                // {
                //     "id": "longitude",
                //     "name": "LONGITUDE",
                //     "title": "LONGITUDE",
                //     "visible": false
                // },
                // {
                //     "id": "elevation",
                //     "name": "ELEVATION",
                //     "title": "ELEVATION",
                //     "visible": true
                // },
                // {
                //     "id": "install-date",
                //     "name": "INSTALL_DATE",
                //     "title": "INSTALL DATE",
                //     "visible": true
                // },
                // {
                //     "id": "shape",
                //     "name": "SHAPE",
                //     "title": "SHAPE",
                //     "visible": false
                // },
                // {
                //     "id": "objectid",
                //     "name": "OBJECTID",
                //     "title": "OBJECTID",
                //     "visible": false
                // },
                // {
                //     "id": "se-anno-cad-data",
                //     "name": "SE_ANNO_CAD_DATA",
                //     "title": "SE ANNO CAD DATA",
                //     "visible": false
                // },


                {
                    "name": "temp",
                    "title": "Temperature",
                    // "value": "<%= this.feature.properties.tenp %><span class=\"unit\">&deg;C</span>"
                    "format": "asUnit( '°C' )"
                    // <span class="value">{{ currentCondition.temp }}<span class="unit">&deg;C</span></span>
                },
                {
                    "name": "relativeHumidity",
                    "title": "Relative Humidity",
                    "format": "asUnit( '%' )"
                    // <span class="value">{{ currentCondition.relativeHumidity }}<span class="unit">%</span></span>
                },
                {
                    "name": "windSpeed",
                    "title": "Wind Speed",
                    "format": "asUnit( 'km/h' )"
                    // <span class="value">{{ currentCondition.windSpeed }}<span class="unit">km/h</span></span>
                },
                {
                    "name": "windDirection",
                    "title": "Wind Direction",
                    "format": "asUnit( '°' )"
                    // <span class="value">{{ currentCondition.windDirection }}<span class="unit">&deg;</span></span>
                },
                {
                    "name": "precipitation",
                    "title": "Precipitation",
                    "format": "asUnit( 'mm' )"
                    // <span class="value">{{ currentCondition.precipitation }}<span class="unit">mm</span></span>
                },
                {
                    "name": "fineFuelMoistureCode",
                    "title": "Fine Fuel Moisture Code",
                    // <span class="value">{{ currentCondition.fineFuelMoistureCode }}</span>
                },
                {
                    "name": "initialSpreadIndex",
                    "title": "Initial Spread Index",
                    // <span class="value">{{ currentCondition.initialSpreadIndex }}</span>
                },
                {
                    "name": "fireWeatherIndex",
                    "title": "Fire Weather Index",
                    // <span class="value">{{ currentCondition.fireWeatherIndex }}</span>
                },
                {
                    "title": "Recorded",
                    "name": "recorded"
                    // <span class="value">{{ currentConditionTime() }}</span>
                }
            ],
            "queries": null,
            "serviceUrl": ls.openmapsBaseUrl,
            "layerName": "pub:WHSE_LAND_AND_NATURAL_RESOURCE.PROT_WEATHER_STATIONS_SP",
            "styleName": "4881",
            "geometryAttribute": "SHAPE",
            "#popupTemplate": "@wf-feature",
            "popupTemplate": "@wf-weather-station-feature",
            "foo": "it works!"
        }
    ]
}