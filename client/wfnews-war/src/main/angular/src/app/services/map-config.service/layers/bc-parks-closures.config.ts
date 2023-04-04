import { layerSettings } from '.';

export function ProtectedLandsAccessRestrictionsLayerConfig(res: layerSettings) {
  return [
    {
      "type": "wms",
      "id": "protected-lands-access-restrictions",
      "title": "Protected Lands Access Restrictions",
      "serviceUrl": res.openmapsBaseUrl,
      "layerName": "pub:WHSE_PARKS.PA_PRTCTD_LND_RSTRCTNS_SV",
      "styleName": "",
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
