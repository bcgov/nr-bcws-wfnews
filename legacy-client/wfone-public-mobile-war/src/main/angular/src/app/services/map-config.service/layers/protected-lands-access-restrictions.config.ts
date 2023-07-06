import { AppResourcesConfig } from "../../app-config.service";

export function ProtectedLandsAccessRestrictionsLayerConfig(res: AppResourcesConfig) {
  return [
    {
      "type": "wms",
      "id": "protected-lands-access-restrictions",
      "title": "Protected Lands Access Restrictions",
      "serviceUrl": res.openmapsBaseUrl,
      // "serviceUrl": "https://delivery.openmaps.gov.bc.ca/geo/pub/ows",
      // "#serviceUrl": "https://openmaps.gov.bc.ca/geo/pub/ows",
      "layerName": "pub:WHSE_PARKS.PA_PRTCTD_LND_RSTRCTNS_SV",
      "styleName": "",
      "opacity": 0.65,
      "titleAttribute": "PROTECTED_LANDS_NAME",
      "attributes": [
        {
          "name": "PROTECTED_LANDS_NAME",
          "title": "Protected Lands Name"
        },
        {
          "name": "ACCESS_STATUS",
          "title": "Access Status"
        },
        {
          "name": "ACCESS_DETAILS",
          "title": "Access Details"
        },
        {
          "name": "FACILITIES_CAMPFIRES_IND",
          "title": "Facilities - Campfire Indicator"
        },
        {
          "name": "CAMPFIRE_BAN_IND",
          "title": "Campfire Ban"
        },
        {
          "title": "Access Effective Date",
          "value": "<%= this.asDate( 'ACCESS_STATUS_EFFECTIVE_DATE' ) %>"
        },
        {
          "name": "ACCESS_STATUS_RESCINDED_DATE",
          "title": "Access Rescinded Date"
        },
      ],
      "where": "EVENT_TYPE = 'Wildfire'",
      "geometryAttribute": "SHAPE",
      "popupTemplate": "@wf-feature"
    }
  ]
}