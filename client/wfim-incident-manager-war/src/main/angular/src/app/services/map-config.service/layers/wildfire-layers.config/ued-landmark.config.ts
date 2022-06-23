export function UedLandmarkLayerConfig() {
    return {
        "id": "ued-landmark",
        "title": "Landmark - UED",
        "attributes": [
            {
                "title": "Type",
                "value": "<%= $.LANDMARK_CATEGORY_DESC %> - <%= $.LANDMARK_TYPE_DESC %>"
            }
        ],
        "layerName": "LANDMARK_POINT_SVW"
    }
}