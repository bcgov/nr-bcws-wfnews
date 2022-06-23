export function ClientAssetLinesLayerConfig() {
    return {
        "id": "client-asset-lines",
        "title": "Client Asset Lines",
        "attributes": [
            // ...attributeSets["client-assets"]
        ],
        "type": "wms",
        "isQueryable": true,
        "layerName": "CLT_CLIENT_ASSETS_LINES",
        "geometryAttribute": "SHAPE"
    }
}