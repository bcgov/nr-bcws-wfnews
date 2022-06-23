export function ClientAssetPointsLayerConfig() {
    return {
        "id": "client-asset-points",
        "title": "Client Asset Points",
        "attributes": [
            // ...attributeSets["client-assets"]
        ],
        "type": "wms",
        "isQueryable": true,
        "layerName": "CLT_CLIENT_ASSETS_POINTS",
        "geometryAttribute": "SHAPE"
    }
}