export function ClientAssetPolygonsLayerConfig() {
    return {
        "id": "client-asset-polygons",
        "title": "Client Asset Polygons",
        "attributes": [
            // ...attributeSets["client-assets"]
        ],
        "type": "wms",
        "isQueryable": true,
        "layerName": "CLT_CLIENT_ASSETS_POLYGONS",
        "geometryAttribute": "SHAPE"
    }
}