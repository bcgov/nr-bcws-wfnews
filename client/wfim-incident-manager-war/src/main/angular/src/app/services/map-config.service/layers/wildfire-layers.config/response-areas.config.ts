export function ResponseAreasLayerConfig() {
    return {
        "id": "response-areas",
        "title": "Priority Response Areas",
        "minScale": 4500000,
        "attributes": [
            {
                "title": "Response Area",
                "value": "<%= $.Response_Area %> (<%= $.Response_Area_Code %>)"
            },
            {
                "title": "RSWAP",
                "name": "RSWAP"
            },
            {
                "title": "Fire Zone",
                "name": "Fire_Zone"
            },
            {
                "title": "Fire Centre",
                "name": "Fire_Centre"
            }
        ],
        "type": "wms",
        "isQueryable": true,
        "layerName": "FO_RESPONSE_AREAS",
        "geometryAttribute": "SHAPE"
    }
}