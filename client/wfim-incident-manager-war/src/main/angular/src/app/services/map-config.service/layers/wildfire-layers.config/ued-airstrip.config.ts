export function UedAirstripLayerConfig() {
    return {
        "id": "ued-airstrip",
        "title": "Airstrip - UED",
        "attributes": [
            {
                "title": "Fuel On Site",
                "value": "<%= $$.formatIndicator($$.parseIndicator($.FUEL_ONSITE_IND)) %>"
            },
            {
                "title": "Elevation",
                "value": "<%= $$.formatMultipleUnits($.AIRSTRIP_ELEVATION, 'm', 'm', 'ft') || 'N/A'  %>",
                "format": "HTML"
            },
            {
                "title": "Length",
                "value": "<%= $$.formatMultipleUnits($.AIRSTRIP_LENGTH, 'm', 'm', 'ft') || 'N/A'  %>",
                "format": "HTML"
            },
            {
                "title": "Surface",
                "name": "AIRSTRIP_SURFACE_DESC"
            },
        ],
        "layerName": "AIRSTRIP_POINT_SVW"
    }
}