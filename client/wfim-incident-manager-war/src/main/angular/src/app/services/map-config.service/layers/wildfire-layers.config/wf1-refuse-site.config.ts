export function Wf1RefuseSiteLayerConfig() {
    return {
        "id": "wf1-refuse-site",
        "title": "Refuse Site",
        "minScale": 1500000,
        "titleFormat": "<%= $.Company %>",
        "attributes": [
            {
                "title": "Company",
                "value": "<%= $.Company %>"
            },
            {
                "title": "Issue Date",
                "value": "<%= $$.formatLocalDate($$.parseIsoDateTime($.Issue_Date)) %>"
            },
            {
                "title": "Location",
                "value": "<%= $$.formatLatLon( $.Latitude, $.Longitide ) %>"
            },
            {
                "title": "Waste Type",
                "value": "<%= $.Waste_Type %>"
            },
            {
                "title": "State",
                "value": "<%= $.State %>"
            },
            {
                "title": "Primary BCENICID",
                "value": "<%= $.Primary_BCENICID %>"
            },           
            {
                "title": "Secondary BCENICID",
                "value": "<%= $.Secondary_BCENICID %>"
            },
            {
                "title": "WDR Schedule",
                "value": "<%= $.WDR_Schedule_One_or_Two %>"
            },
            {
                "title": "Facility Address",
                "value": "<%= $.Facility_Address %>"
            },
            {
                "title": "Facility Operator",
                "value": "<%= $.Facility_Operator %>"
            },
            {
                "title": "Facility Operator Phone",
                "value": "<%= $.Facility_Operator_Phone %>"
            },
            {
                "title": "Facility Operator Email",
                "value": "<%= $.Facility_Operator_Email %>"
            },
            {
                "title": "Legal Land Description",
                "value": "<%= $.Legal_Land_Description %>"
            }

        ],
        "type": "wms",
        "isQueryable": true,
        "layerName": "WF1_REFUSE_SITE",
        "geometryAttribute": "SHAPE"
    }
}