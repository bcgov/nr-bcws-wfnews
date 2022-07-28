import { layerSettings } from ".";

export function BansAndProhibitionsLayerConfig(ls: layerSettings) {
    return [
        {
            "type": "wms",
            "id": "bans-and-prohibitions",
            "title": "BC Wildfire Bans and Prohibitions",
            "serviceUrl": ls.openmapsBaseUrl,
            // "serviceUrl": "https://delivery.openmaps.gov.bc.ca/geo/pub/ows",
            // "#serviceUrl": "https://openmaps.gov.bc.ca/geo/pub/ows",
            "layerName": "pub:WHSE_LAND_AND_NATURAL_RESOURCE.PROT_BANS_AND_PROHIBITIONS_SP",
            "styleName": "7733",
            "opacity": 0.2,
            "titleAttribute": "ACCESS_PROHIBITION_DESCRIPTION",
            "geometryAttribute": "SHAPE",
            "popupTemplate": "@wf-feature",
            "attributes": [
                {
                    "name": "FIRE_CENTRE_NAME",
                    "title": "Fire Centre"
                },
                {
                    //   "name": "ACCESS_STATUS_EFFECTIVE_DATE",
                    "title": "Date Active",
                    "value": "<%= this.asDate( 'ACCESS_STATUS_EFFECTIVE_DATE' ) %>"
                    //   "format": "asLocalDate"
                },
                {
                    "name": "TYPE",
                    "title": "Type"
                },
                {
                    "name": "ACCESS_PROHIBITION_DESCRIPTION",
                    "title": "Comments"
                },
                {
                    "title": "More Information",
                    "value": "See Here",
                    "format": "asLink(this.feature.properties.BULLETIN_URL)"
                }
            ]
        },

        {
            "type": "wms",
            "id": "bans-and-prohibitions-highlight",
            "title": "BC Wildfire Bans and Prohibitions",
            "serviceUrl": ls.openmapsBaseUrl,
            // "serviceUrl": "https://delivery.openmaps.gov.bc.ca/geo/pub/ows",
            // "#serviceUrl": "https://openmaps.gov.bc.ca/geo/pub/ows",
            "layerName": "pub:WHSE_LAND_AND_NATURAL_RESOURCE.PROT_BANS_AND_PROHIBITIONS_SP",
            "opacity": 0.8,
            "sld": `@${window.location.protocol}//${window.location.host}/assets/js/smk/bans-and-prohibitions-highlight.sld`
        }

    ]
}