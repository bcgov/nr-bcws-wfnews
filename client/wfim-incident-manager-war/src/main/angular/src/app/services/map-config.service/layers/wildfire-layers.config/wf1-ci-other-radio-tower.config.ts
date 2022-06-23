export function Wf1CiOtherRadioTowerLayerConfig() {
    return {
        "id": "wf1-ci-other-radio-tower",
        "title": "Radio Tower - Other",
        "titleAttribute": "TOWER_NAME",
        "attributes": [
            {
                "title": "Agency",
                "name": "AGENCY_NAME"
            },
            {
                "title": "Name",
                "name": "TOWER_NAME"
            },
            {
                "title": "Loction Name",
                "name": "TOWER_LOCATION"
            },
            {
                "title": "Location",
                "value": "<%= $$.formatLatLon($.LATITUDE, $.LONGITUDE) %>"
            },
            {
                "title": "Elevation",
                "name": "ELEVATION"
            },
            {
                "title": "Service Type",
                "name": "SERVICE_TYPE"
            },
            {
                "title": "Description",
                "name": "DESCRIPTION"
            },
            {
                "title": "Last Updated",
                "value": "<%= $$.formatLocalDate($$.parseIsoDateTime($.UPDATE_DATE)) %>"
            }
        ],
        "type": "wms",
        "isQueryable": true,
        "layerName": "WF1_CI_OTHER_RADIO_TOWER",
        "geometryAttribute": "SHAPE"
    }
}