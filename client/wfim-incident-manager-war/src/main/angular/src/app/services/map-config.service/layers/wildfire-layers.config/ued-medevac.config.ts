export function UedMedevacLayerConfig() {
    return {
        "id": "ued-medevac",
        "title": "Medevac - UED",
        "attributes": [
            {
                "title": "Associated Facility",
                "name": "ASSOC_MEDICAL_FACILITY"
            },
            {
                "title": "Helipad On-site",
                "value": "<%= $$.formatIndicator($$.parseIndicator($.HELIPAD_ONSITE_IND)) || 'N/A'  %>"
            },
        ],
        "layerName": "MEDEVAC_POINT_SVW"
    }
}