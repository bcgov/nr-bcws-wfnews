import { layerSettings } from ".";

export function PrecipitationLayerConfig( ls: layerSettings ) {
	return [
        {
            "type": "wms-time",
            "id": "precipitation",
            "title": "Precipitation Forecast, Hourly",
            "isQueryable": false,
            "opacity": 0.65,
            "minScale": null,
            "maxScale": null,
            "titleAttribute": null,
            "attributes": false,
            "queries": null,
            "tiled": false,
            "version": "1.3.0",
            "serviceUrl":"https://geo.weather.gc.ca/geomet",

            "layerName": "GDPS.ETA_RT",
            "styleName": "PRECIPPRTMMH",

            "legend": {
                "title": " ",
                "url": "assets/images/precipitation-legend.png",
            }

        }
    ]
}