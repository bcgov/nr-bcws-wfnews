import { layerSettings } from ".";

export function SmokeForecastLayerConfig(ls: layerSettings) {
    return [
        {
            "type": "image",
            "id": "hourly-currentforecast-firesmoke",
            "title": "Smoke Forecast, Hourly",
            "opacity": 1.0,
            "baseUrl": "https://firesmoke.ca/forecasts/current/images/hourly_<%= timestamp %>.png",
            "bounds": [[32.0, -160.0], [70.0, -52.0]],
            "legend": {
                "title": " ",
                "url": "assets/images/firesmoke-legend.png"
            }
        }
    ]
}