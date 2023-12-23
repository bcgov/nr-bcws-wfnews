import { layerSettings } from '.';

export function EvacuationOrdersLayerConfig(ls: layerSettings) {
  return [
    {
      type: 'wms',
      id: 'evacuation-orders-and-alerts-wms',
      title: 'Evacuation Orders and Alerts',
      serviceUrl: ls.openmapsBaseUrl,
      layerName:
        'pub:WHSE_HUMAN_CULTURAL_ECONOMIC.EMRG_ORDER_AND_ALERT_AREAS_SP',
      styleName: '6885',
      isQueryable: true,
      where: 'ORDER_ALERT_STATUS <> \'All Clear\' and EVENT_TYPE = \'Fire\'',
      opacity: 0.65,
      titleAttribute: 'EVENT_NAME',
      popupTemplate:
        '<div class="smk-popup"><div class="popup-header"><mat-icon role="img" class="mat-icon notranslate material-icons mat-icon-no-color" aria-hidden="true" data-mat-icon-type="font">error</mat-icon><span class="title-label">Evacuation Orders and Alerts</span></div><div class="popup-title">{{feature.properties["EVENT_NAME"]}}</div><div class="popup-attributes"><div class="label">Date Active:</div><div class="attribute">{{new Date(feature.properties["DATE_MODIFIED"]).toISOString().slice(0, 10)}}</div></div><div class="popup-attributes"><div class="label">Agency:</div><div class="attribute">{{feature.properties["ISSUING_AGENCY"]}}</div></div><div class="popup-attributes"><div class="label">Status:</div><div class="attribute attribute-red">{{feature.properties["ORDER_ALERT_STATUS"]}}</div></div><div class="popup-button-container"><a class="popup-button" target="_blank" rel="noopener" v-if="feature.properties[\'BULLETIN_URL\']" v-bind:href="feature.properties[\'BULLETIN_URL\']">Learn More</a></div></div>',
      geometryAttribute: 'SHAPE',
      attributes: [
        {
          name: 'EVENT_NAME',
          title: 'Name',
        },
        {
          name: 'EVENT_TYPE',
          title: 'Type',
        },
        {
          name: 'DATE_MODIFIED',
          title: 'Date',
        },
        {
          name: 'ISSUING_AGENCY',
          title: 'Issuing Agency',
        },
        {
          name: 'ORDER_ALERT_STATUS',
          title: 'Status',
        },
      ],
      legend: {
        clipHeight: 60,
      },
    },
    {
      type: 'wms',
      id: 'evacuation-orders-and-alerts-wms-highlight',
      title: 'Evacuation Orders and Alerts',
      serviceUrl: ls.openmapsBaseUrl,
      layerName:
        'pub:WHSE_HUMAN_CULTURAL_ECONOMIC.EMRG_ORDER_AND_ALERT_AREAS_SP',
      opacity: 0.8,
      sld: `@${window.location.protocol}//${window.location.host}/assets/js/smk/evacuation-orders-and-alerts-wms-highlight.sld`,
    },
  ];
}
