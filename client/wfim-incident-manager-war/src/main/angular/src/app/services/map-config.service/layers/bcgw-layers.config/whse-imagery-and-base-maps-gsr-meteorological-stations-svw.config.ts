export function WhseImageryAndBaseMapsGsrMeteorologicalStationsSvwLayerConfig() {
    return {
        "id": "whse-imagery-and-base-maps-gsr-meteorological-stations-svw",
        "title": "Meteorological Station",
        "type": "wms",
        "isQueryable": true,
        "layerName": "GBA_METEOROLOGICAL_LOCS_SP",
        // "minScale": 9000000,
        "titleAttribute": "STATION_NAME",
        "geometryAttribute": "SHAPE",
        "attributes": [
            {
                "title": "Name",
                "name": "STATION_NAME"
            },
            {
                "title": "Location",                
                "value": "<%= $$.formatLatLon( $.LATITUDE, $.LONGITUDE ) %>"
            },
            {
                "title": "Elevation",
                "value": "<%= $$.formatUnit( $.ELEVATION, 'm' ) %> (<%= $$.formatUnit( $$.convertUnit( $.ELEVATION, 'm', 'ft' ), 'ft' ) %>)",
                // "name": "ELEVATION",
                "format": "HTML"
            },
            {
                "title": "Description",
                "name": "STATION_DESC"
            },
            {
                "title": "Agency",
                "name": "AGENCY"
            },
            {
                "title": "Network",
                "name": "NETWORK"
            },
            {
                "title": "Active",
                "name": "ACTIVE_IND"
            },
            {
                "title": "Active Dates",                
                "value": "<%= $$.formatLocalDate( $$.parseYyyyMmDd( $.DATE_ACTIVE ) ) || 'Unknown' %> - <%= $$.formatLocalDate( $$.parseYyyyMmDd( $.DATE_INACTIVE ) ) || 'Present' %>"
            },
            {
                "title": "Source",
                "name": "SOURCE_CODE"
            },
            {
                "title": "Climate",
                "name": "CLIMATE_IND"
            },
            {
                "title": "Parameters",
                "name": "PARAMETERS_MEASURED"
            },
            {
                "title": "Website 1",
                "name": "WEBSITE_URL_SECONDARY"
            },
            {
                "title": "Website 2",
                "name": "WEBSITE_URL_SECONDARY"
            },
            {
                "title": "WMO ID",
                "name": "WMO_ID"
            },
            {
                "title": "Location ID",
                "name": "METEOROLOGICAL_LOCATION_ID"
            },
            {
                "title": "Native ID",
                "name": "NATIVE_ID"
            },
            {
                "title": "Object ID",
                "name": "OBJECTID"
            }
        ]
    }
}
