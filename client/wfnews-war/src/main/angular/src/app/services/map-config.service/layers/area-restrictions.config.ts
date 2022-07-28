import { layerSettings } from ".";

export function AreaRestrictionsLayerConfig(ls: layerSettings) {
    return [
        {
            "type": "wms",
            "id": "area-restrictions",
            "title": "BC Wildfire Area Restrictions",
            "serviceUrl": ls.openmapsBaseUrl,
            // "serviceUrl": "https://delivery.openmaps.gov.bc.ca/geo/pub/ows",
            // "#serviceUrl": "https://openmaps.gov.bc.ca/geo/pub/ows",
            "layerName": "pub:WHSE_LAND_AND_NATURAL_RESOURCE.PROT_RESTRICTED_AREAS_SP",
            "styleName": "7735",
            "titleAttribute": "NAME",
            "geometryAttribute": "SHAPE",
            "popupTemplate": "@wf-feature",
            "attributes": [
                {
                    "name": "NAME",
                    "title": "Name"
                },
                {
                    //   "name": "ACCESS_STATUS_EFFECTIVE_DATE",
                    "title": "Date Active",
                    "value": "<%= this.asDate( 'ACCESS_STATUS_EFFECTIVE_DATE' ) %>"
                },
                {
                    "name": "FIRE_CENTRE_NAME",
                    "title": "Fire Centre"
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
            "id": "area-restrictions-highlight",
            "title": "BC Wildfire Area Restrictions",
            "serviceUrl": ls.openmapsBaseUrl,
            "layerName": "pub:WHSE_LAND_AND_NATURAL_RESOURCE.PROT_RESTRICTED_AREAS_SP",
            "opacity": 0.8,
            "sld": `@${window.location.protocol}//${window.location.host}/assets/js/smk/area-restrictions-highlight.sld`
        }
    ]
}