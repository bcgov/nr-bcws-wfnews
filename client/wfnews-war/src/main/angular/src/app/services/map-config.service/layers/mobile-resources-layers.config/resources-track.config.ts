export function ResourcesTrackLayerConfig() {
    return {
        "id": "resource-track",
        "type": "resource-tracks",
        "title": "Track",
        "titleFormat": "<%= $.parameter.Call_Sign %> <%= $$.formatLocalTime($$.parseIsoDateTime($.time_stamp)) %>",
        "attributes": [
            {
                "title": "Agency",
                "value": "<%= $.parameter.Agency %>"
            },
            {
                "title": "Call Sign",
                "value": "<%= parameter.Call_Sign %>"
            },
            {
                "title": "Function",
                "value": "<%= parameter.OperationalFunction %>"
            },
            {
                "title": "Registration",
                "value": "<%= $.registration %>"
            },
            {
                "title": "Location",
                "value": "<%= $$.formatLatLon($.latitude, $.longitude) %>"
            },
            {
                "title": "Speed",
                "value": "<%= $$.formatUnit($.speed,'kn') %>",
                "format": "HTML"
            },
            {
                "title": "Heading",
                "value": "<%= $$.formatAngle($.heading) %>",
                "format": "HTML"
            },
            {
                "title": "Altitude",
                "value": "<%= $$.formatUnit($.altitude,'ft') %>",
                "format": "HTML"
            },
            {
                "title": "Position Timestamp",
                "value": "<%= $$.formatLocalTime($$.parseIsoDateTime($.time_stamp)) %>"
            },
            {
                "title": "Position Source",
                "name": "source"
            }
        ],
        "temporalAttribute":{
            "name": "TIME_STAMP",
            "unit": "iso-8601"
        },
        "isQueryable": false,
        "layerName": "wf:Position_svw"
    }
}
