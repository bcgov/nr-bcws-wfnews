import { AppResourcesConfig } from "../../app-config.service";

export function PrecipitationLayerConfig( res: AppResourcesConfig ) {
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

            "capabilitiesUrl":"https://geo.weather.gc.ca/geomet/?lang=E&service=WMS&request=GetCapabilities&layers=GDPS.ETA_RT&legend_format=image/png&feature_info_type=text/plain&request=GetCapabilities&service=WMS&version=1.3.0",
            "layerName": "GDPS.ETA_RT",
            "styleName": "PRECIPPRTMMH",

            "legend": {
                "title": " ",
                "url": "assets/images/precipitation-legend.png",
            }

        }
    ]
}