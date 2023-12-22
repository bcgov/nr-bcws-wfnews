import { layerSettings } from '.';

export function ForestServiceRoadsLayerConfig(ls: layerSettings) {
  return [
    {
      type: 'esri-feature',
      id: 'bc-fsr',
      title: 'Forest Service Roads',
      isQueryable: true,
      attribution: 'Copyright 117 DataBC, Government of British Columbia',
      serviceUrl:
        'https://services6.arcgis.com/ubm4tcTYICKBpist/ArcGIS/rest/services/FSR_Safety_Information_View/FeatureServer/0',
      opacity: 1,
      titleAttribute: 'LOCATION',
      popupTemplate:
        '<div class="smk-popup"><div class="popup-header"><mat-icon role="img" class="mat-icon notranslate material-icons mat-icon-no-color" aria-hidden="true" data-mat-icon-type="font">road</mat-icon><span class="title-label">Forest Service Road Safety Info</span></div><div class="popup-title">{{feature.properties["LOCATION"]}}</div><div class="popup-attributes"><div class="label">Type:</div><div class="attribute">{{feature.properties["ALERT_TYPE"]}}</div></div><div class="popup-attributes"><div class="label">Information:</div><div class="attribute">{{feature.properties["INFORMATION"]}}</div></div><div class="popup-button-container"><a class="popup-button" target="_blank" rel="noopener"v-bind:href="feature.properties[\'NOTICE\']">Learn More</a></div></div>',
    },
  ];
}
