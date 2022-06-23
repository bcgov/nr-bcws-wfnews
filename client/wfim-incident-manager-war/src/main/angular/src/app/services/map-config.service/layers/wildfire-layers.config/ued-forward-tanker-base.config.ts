export function UedForwardTankerBaseLayerConfig() {
    return {
        "id": "ued-forward-tanker-base",
        "title": "Forward Tanker Base - UED",
        "attributes": [
            {
                "title": "Elevation",
                "value": "<%= $$.formatMultipleUnits($.FRWRD_TANKERBASE_ELEV, 'm', 'm', 'ft') || 'N/A' %>",
                "format": "HTML"
            },
            {
                "title": "Variation",
                "value": "<%= $.FRWRD_TANKERBASE_VARIAT || 'N/A' %>"
            }
        ],

        "layerName": "FORWARD_TANKER_BASE_POINT_SVW"
    }
}