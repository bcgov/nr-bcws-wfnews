export function UedHelipadLayerConfig() {
    return {
        "id": "ued-helipad",
        "title": "Helipad - UED",
        "attributes": [
            {
                "title": "Fuel On Site",
                "value": "<%= $$.formatIndicator($$.parseIndicator($.FUEL_ONSITE_IND)) || 'N/A'  %>"
            },
        ],
        "layerName": "HELIPAD_POINT_SVW"
    }
}