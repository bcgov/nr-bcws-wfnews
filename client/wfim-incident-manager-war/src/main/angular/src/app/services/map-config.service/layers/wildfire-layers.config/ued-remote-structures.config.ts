export function UedRemoteStructuresLayerConfig() {
    return {
        "id": "ued-remote-structures",
        "title": "Remote Structures - UED",
        "attributes": [
            {
                "title": "Type",
                "name": "REMOTE_STRUCTURE_TYPE_DESC"
            },
            {
                "title": "Property Value",
                "value": "<%= $$.formatCAD($.PROPERTY_VALUE) || 'N/A' %>",
                "format": "HTML"
            }
        ],
        "layerName": "REMOTE_STRUCTURE_POINT_SVW"
    }
}