import { layerSettings } from '.';

export function ProtectedLandsAccessRestrictionsLayerConfig(res: layerSettings) {
  return [
    {
      type: "wms",
      id: "protected-lands-access-restrictions",
      title: "Protected Lands Access Restrictions",
      serviceUrl: res.openmapsBaseUrl,
      layerName: "pub:WHSE_PARKS.PA_PRTCTD_LND_RSTRCTNS_SV",
      styleName: "",
      opacity: 0.65,
      titleAttribute: "PROTECTED_LANDS_NAME",
      attributes: [
        {
          "name": "PROTECTED_LANDS_NAME",
          "title": "Protected Lands Name"
        }
      ],
      where: "EVENT_TYPE = 'Wildfire'",
      geometryAttribute: "SHAPE",
      popupTemplate: '<div class="smk-popup"><div class="popup-header"><span class="title-label" style="margin-left: 0px !important;">Protected Lands Access Restrictions</span></div><div class="popup-title" style="margin-top: 15px;">{{feature.properties["PROTECTED_LANDS_NAME"]}}</div><div class="popup-attributes"><div class="label">Access Status:</div><div class="attribute">{{feature.properties["ACCESS_STATUS"]}}</div></div><div class="popup-attributes"><div class="label">Access Details:</div><div class="attribute">{{feature.properties["ACCESS_DETAILS"]}}</div></div><div class="popup-attributes"><div class="label">Campfires:</div><div class="attribute">{{feature.properties["FACILITIES_CAMPFIRES_IND"]}}</div></div><div class="popup-attributes"><div class="label">Campfire Ban:</div><div class="attribute">{{feature.properties["CAMPFIRE_BAN_IND"]}}</div></div><div class="popup-attributes"><div class="label">Effective Date:</div><div class="attribute">{{feature.properties["ACCESS_STATUS_EFFECTIVE_DATE"] ? feature.properties["ACCESS_STATUS_EFFECTIVE_DATE"].slice(0, -1) : ""}}</div></div><div class="popup-attributes"><div class="label">Rescinded Date:</div><div class="attribute">{{feature.properties["ACCESS_STATUS_RESCINDED_DATE"] ? feature.properties["ACCESS_STATUS_RESCINDED_DATE"].slice(0, -1) : ""}}</div></div></div>'
    }
  ]
}
