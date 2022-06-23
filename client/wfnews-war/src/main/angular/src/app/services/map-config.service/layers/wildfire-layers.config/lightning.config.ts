export function LightningLayerConfig() {
    return {
        "id": "lightning",
        "title": "Lightning",
        "titleFormat": "<%= $.POLARITY?'🞣':'⭘' %> <%= $$.formatTime($$.parseMilliseconds($.STROKE_TIMESTAMP_MSEC)) %>",
        "attributes": [
            {
                "title": "Time",
                "value": "<%= $$.formatLocalTime($$.parseMilliseconds($.STROKE_TIMESTAMP_MSEC)) %>"
            },
            {
                "title": "Location",
                "value": "<%= $$.formatLatLon( $.LATITUDE, $.LONGITUDE ) %>"
            },
            {
                "title": "Polarity",
                "value": "<%= $.POLARITY?'🞣 Positive':'⭘ Negative' %>"
            },
            {
                "title": "Current",
                "value": "<%= $$.formatUnit($.KILOAMPERES)%>",
                "format": "HTML"
            }
        ],
        "type": "wms-time-cql",
        "temporalAttribute": {
            "name": "STROKE_TIMESTAMP_SEC",
            "unit": "seconds"
        },
        "isQueryable": true,
        "layerName": "LIGHTNING",
        "geometryAttribute": "GEOM"
    }
}
