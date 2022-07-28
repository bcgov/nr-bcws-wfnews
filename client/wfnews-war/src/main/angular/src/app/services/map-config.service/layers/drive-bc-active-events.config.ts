import { layerSettings } from ".";

export function DriveBCEventsLayerConfig(ls: layerSettings) {
    return [
        {
            "type": "wms",
            "id": "drive-bc-active-events",
            "title": "Drive BC Active Events",
            "isQueryable": true,
            "serviceUrl": ls.drivebcBaseUrl,
            "layerName": "op5:OP5_EVENT511_ACTIVE_V",
            "popupTemplate": "@wf-feature",
            "titleAttribute": "HEADLINE",
            "geometryAttribute": "GEOMETRY",
            "attributes": [
                {
                    "name": "HEADLINE",
                    "title": "HEADLINE"
                },
                {
                    "name": "DESCRIPTION",
                    "title": "Description"
                },
                {
                    "name": "CREATED_TIME",
                    "title": "Created"
                },
                {
                    "name": "SEVERITY",
                    "title": "Severity"
                },
                {
                    "name": "STATUS",
                    "title": "Status"
                },
                {
                    "name": "AREA",
                    "title": "Area"
                }
            ]
        }
    ]
}