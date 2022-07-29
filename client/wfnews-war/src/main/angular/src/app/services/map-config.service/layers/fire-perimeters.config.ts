import { layerSettings } from ".";

export function FirePerimetersLayerConfig(ls: layerSettings) {
    return [
        {
            "type": "esri-feature",
            "id": "fire-perimeters",
            "title": "BC Wildfire Fire Perimeters",
            "attribution": "Copyright 117 DataBC, Government of British Columbia",
            "serviceUrl": "https://services6.arcgis.com/ubm4tcTYICKBpist/arcgis/rest/services/BCWS_FirePerimeters_PublicView/FeatureServer/0",
            "where": "FIRE_STATUS <> 'Out'",
            "opacity": 1,
            "attributes": [
                {
                    "name": "FIRE_NUMBER",
                    "title": "Fire Perimeter Number"
                },
                {
                    //   "name": "TRACK_DATE",
                    "title": "Track Date",
                    "value": "<%= this.asDate( 'TRACK_DATE' ) %>"
                    //   "format": "asLocalDate"
                },
                {
                    "name": "FIRE_STATUS",
                    "title": "Stage of Control"
                },
                {
                    "name": "FIRE_OF_NOTE_NAME",
                    "title": "Fire of Note Information",
                    "format": "asLink(this.feature.properties.FIRE_OF_NOTE_URL)"
                }
            ],
            "popupTemplate": "@wf-feature",
            "titleAttribute": "FIRE_NUMBER"
        }
    ]
}