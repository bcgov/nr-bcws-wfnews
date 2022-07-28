import { layerSettings } from ".";

export function FireCentresLayerConfig(ls: layerSettings) {
    return [
        {
            "type": "esri-tiled",
            "id": "bc-fire-centres",
            "title": "BC Wildfire Fire Centres",
            "isQueryable": false,
            "attribution": "Copyright 117 DataBC, Government of British Columbia",
            "serviceUrl": "https://tiles.arcgis.com/tiles/ubm4tcTYICKBpist/arcgis/rest/services/BCWS_FireCenterBdys2/MapServer",
            "opacity": 1,
            "popupTemplate": "@wf-feature"
        }
    ]
}