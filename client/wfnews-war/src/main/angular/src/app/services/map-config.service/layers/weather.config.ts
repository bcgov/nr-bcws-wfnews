import { layerSettings } from ".";

export function WeatherLayerConfig(ls: layerSettings) {
    return [
        {
            "id": "radar-1km-rrai--radarurpprecipr14-linear",
            "type": "wms",
            "title": "Current Precipitation Radar",
            "isQueryable": false,
            "opacity": 0.65,
            "minScale": null,
            "maxScale": null,
            "titleAttribute": null,
            "attributes": false,
            "queries": null,
            "serviceUrl": "https://geo.weather.gc.ca/geomet",
            "layerName": "RADAR_1KM_RRAI",
            "styleName": "",
            "legend": {
                "title": " ",
                "url": "assets/images/radar-1km-rrai--radarurpprecipr14-linear-legend.png"
            }
        },
        {
            "id": "current-conditions--default",
            "type": "wms",
            "title": "Current Weather Conditions",
            "isQueryable": false,
            "opacity": 0.65,
            "minScale": null,
            "maxScale": null,
            "titleAttribute": null,
            "attributes": false,
            "queries": null,
            "serviceUrl": "https://geo.weather.gc.ca/geomet",
            "layerName": "CURRENT_CONDITIONS",
            "styleName": "default"
        }
    ]
}