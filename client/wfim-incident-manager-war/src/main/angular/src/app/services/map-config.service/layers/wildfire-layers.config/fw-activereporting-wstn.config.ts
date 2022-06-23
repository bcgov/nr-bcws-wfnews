export function FwActivereportingWstnLayerConfig() {
    return {
        "id": "fw-activereporting-wstn",
        "title": "Weather Station - Active",
        "titleAttribute": "STATION_NAME",
        "attributes": [
            {
                "title": "Morecast",
                "action": "morecast-open"
            },
            {
                "title": "Name",
                "name": "STATION_NAME"
            },
            {
                "title": "Location",
                "value": "<%= $$.formatLatLon( $.LATITUDE, $.LONGITUDE ) %>"
            },
            {
                "title": "Station Acronym",
                "name": "STATION_ACRONYM"
            },
            {
                "title": "Station Code",
                "name": "STATION_CODE"
            },
            {
                "title": "Elevation",
                "name": "ELEVATION"
            },
            {
                "title": "Install Date",
                "value": "<%= $$.formatLocalDate($$.parseIsoDateTime($.INSTALL_DATE)) %>"
            }
        ],
        "type": "wms",
        "isQueryable": true,
        "layerName": "FW_ACTIVEREPORTING_WSTN_SVW"
    }
}