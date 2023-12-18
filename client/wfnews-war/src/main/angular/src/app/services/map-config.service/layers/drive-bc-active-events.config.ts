import { layerSettings } from '.';

export function DriveBCEventsLayerConfig(ls: layerSettings) {
  return [
    {
      type: 'wms',
      id: 'drive-bc-active-events',
      title: 'Drive BC Active Events',
      isQueryable: true,
      serviceUrl: ls.drivebcBaseUrl,
      layerName: 'op5:OP5_EVENT511_ACTIVE_V',
      titleAttribute: 'HEADLINE',
      geometryAttribute: 'GEOMETRY',
      popupTemplate:
        '<div class="smk-popup"><div class="popup-header"><mat-icon role="img" class="mat-icon notranslate material-icons mat-icon-no-color" aria-hidden="true" data-mat-icon-type="font">directions_car_filled</mat-icon><span class="title-label">Road Conditions</span></div><div class="popup-title">{{feature.properties["HEADLINE"]}}</div><div class="popup-attributes"><div class="label">Description:</div><div class="attribute">{{feature.properties["DESCRIPTION"]}}</div></div><div class="popup-attributes"><div class="label">Area:</div><div class="attribute">{{feature.properties["AREA"]}}</div></div><div class="popup-attributes"><div class="label">Created:</div><div class="attribute">{{new Date(feature.properties["CREATED_TIME"]).toISOString().slice(0, 10)}}</div></div><div class="popup-attributes"><div class="label">Severity:</div><div class="attribute">{{feature.properties["SEVERITY"]}}</div></div><div class="popup-attributes"><div class="label">Status:</div><div class="attribute attribute-red">{{feature.properties["STATUS"]}}</div></div><div class="popup-button-container"><a class="popup-button" target="_blank" rel="noopener" v-bind:href="`https://drivebc.ca/mobile/pub/events/id/${feature.properties[\'SOURCE_ID\']}.html`">Learn More</a></div></div>',
      attributes: [
        {
          name: 'SOURCE_ID',
          title: 'Source ID',
        },
        {
          name: 'HEADLINE',
          title: 'HEADLINE',
        },
        {
          name: 'DESCRIPTION',
          title: 'Description',
        },
        {
          name: 'CREATED_TIME',
          title: 'Created',
        },
        {
          name: 'SEVERITY',
          title: 'Severity',
        },
        {
          name: 'STATUS',
          title: 'Status',
        },
        {
          name: 'AREA',
          title: 'Area',
        },
      ],
    },
  ];
}
