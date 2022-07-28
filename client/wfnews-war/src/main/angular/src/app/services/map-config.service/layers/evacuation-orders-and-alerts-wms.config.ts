import { layerSettings } from ".";

export function EvacuationOrdersLayerConfig(ls: layerSettings) {
    return [
        {
            "type": "wms",
            "id": "evacuation-orders-and-alerts-wms",
            "title": "Fire Evacuation Orders and Alerts",
            "serviceUrl": ls.openmapsBaseUrl,
            // "serviceUrl": "https://delivery.openmaps.gov.bc.ca/geo/pub/ows",
            // "#serviceUrl": "https://openmaps.gov.bc.ca/geo/pub/ows",
            "layerName": "pub:WHSE_HUMAN_CULTURAL_ECONOMIC.EMRG_ORDER_AND_ALERT_AREAS_SP",
            "styleName": "6885",
            "isQueryable": true,

            "where": "ORDER_ALERT_STATUS <> 'All Clear' and EVENT_TYPE = 'Fire'",
            "opacity": 0.25,

            "popupTemplate": "@wf-feature",
            "titleAttribute": "EVENT_NAME",
            "geometryAttribute": "SHAPE",
            "attributes": [
                {
                    "name": "EVENT_NAME",
                    "title": "Name"
                },
                {
                    "name": "EVENT_TYPE",
                    "title": "Type"
                },
                {
                    //   "name": "DATE_MODIFIED",
                    "title": "Date",
                    "value": "<%= this.asDate( 'DATE_MODIFIED' ) %>"
                    //   "format": "asLocalDate"
                },
                {
                    "name": "ISSUING_AGENCY",
                    "title": "Issuing Agency"
                },
                {
                    "name": "ORDER_ALERT_STATUS",
                    "title": "Status"
                }
            ],
            "legend": {
                "clipHeight": 60
            }
        },

        {
            "type": "wms",
            "id": "evacuation-orders-and-alerts-wms-highlight",
            "title": "Fire Evacuation Orders and Alerts",
            "serviceUrl": ls.openmapsBaseUrl,
            // "serviceUrl": "https://delivery.openmaps.gov.bc.ca/geo/pub/ows",
            // "#serviceUrl": "https://openmaps.gov.bc.ca/geo/pub/ows",
            "layerName": "pub:WHSE_HUMAN_CULTURAL_ECONOMIC.EMRG_ORDER_AND_ALERT_AREAS_SP",
            "opacity": 0.8,
            "sld": `@${window.location.protocol}//${window.location.host}/assets/js/smk/evacuation-orders-and-alerts-wms-highlight.sld`
        }

    ]
}