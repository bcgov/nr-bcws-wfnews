export function UedFuelCacheLayerConfig() {
    return {
        "id": "ued-fuel-cache",
        "title": "Fuel Cache - UED",
        "attributes": [
            {
                "title": "Type",
                "value": "<%= $.FUEL_CACHE_TYPE_DESC %> - <%= $.FUEL_TYPE_DESC %>"
            },
            {
                "title": "Owner",
                "name": "FUEL_CACHE_OWNER_DESC"
            },
            {
                "title": "Full",
                "value": "<%= $$.formatUnit($.FULL_BARRELS_COUNT, 'barrels') || 'N/A' %>",
                "format": "HTML"
            },
            {
                "title": "Partial",
                "value": "<%= $$.formatUnit($.PARTIAL_BARRELS_COUNT, 'barrels') || 'N/A' %>",
                "format": "HTML"
            },
            {
                "title": "Empty",
                "value": "<%= $$.formatUnit($.EMPTY_BARRELS_COUNT, 'barrels') || 'N/A' %>",
                "format": "HTML"
            }
        ],
        "layerName": "FUEL_CACHE_POINT_SVW"
    }
}