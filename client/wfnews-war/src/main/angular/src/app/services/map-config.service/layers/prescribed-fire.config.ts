import { layerSettings } from ".";

export function PrescribedFireLayerConfig(ls: layerSettings) {
    return [
        {
            "type": "esri-feature",
            "id": "prescribed-fire",
            "title": "BC Wildfire Prescribed Fire",
            "isQueryable": true,
            "attribution": "Copyright 117 DataBC, Government of British Columbia",
            "serviceUrl": "https://services6.arcgis.com/ubm4tcTYICKBpist/ArcGIS/rest/services/British_Columbia_Prescribed_Fire/FeatureServer/0",
            "where": "",
            "popupTemplate": "@wf-feature",
            "titleAttribute": "Fire_Zone",
            "attributes": [
                {
                    "name": "Fire_Centre",
                    "title": "Fire Centre"
                },
                {
                    "name": "Fire_Zone",
                    "title": "Fire Zone"
                },
                {
                    "name": "ManagementObjective",
                    "title": "Management Objective"
                },
                {
                    "name": "Status",
                    "title": "Status"
                },
                {
                    "title": "More Information",
                    "value": "See Here",
                    "format": "asLink(this.feature.properties.URL)"
                }
            ]
        }
    ]
}