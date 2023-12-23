import { layerSettings } from '.';

export function AreaRestrictionsLayerConfig(ls: layerSettings) {
  return [
    {
      type: 'wms',
      id: 'area-restrictions',
      title: 'BC Wildfire Area Restrictions',
      serviceUrl: ls.openmapsBaseUrl,
      layerName: 'pub:WHSE_LAND_AND_NATURAL_RESOURCE.PROT_RESTRICTED_AREAS_SP',
      styleName: '7735',
      titleAttribute: 'NAME',
      geometryAttribute: 'SHAPE',
      popupTemplate:
        '<div class="smk-popup"><div class="popup-header"><mat-icon role="img" class="mat-icon notranslate mat-primary" aria-hidden="true" ng-reflect-svg-icon="map-signs" data-mat-icon-type="svg" data-mat-icon-name="map-signs"><svg style="color: #1a5a96" width="100%" height="100%" viewBox="0 0 1792 1792" xmlns="http://www.w3.org/2000/svg" fit="" preserveAspectRatio="xMidYMid meet" focusable="false"><path d="M1745 297q10 10 10 23t-10 23l-141 141q-28 28-68 28h-1344q-26 0-45-19t-19-45v-256q0-26 19-45t45-19h576v-64q0-26 19-45t45-19h128q26 0 45 19t19 45v64h512q40 0 68 28zm-977 919h256v512q0 26-19 45t-45 19h-128q-26 0-45-19t-19-45v-512zm832-448q26 0 45 19t19 45v256q0 26-19 45t-45 19h-1344q-40 0-68-28l-141-141q-10-10-10-23t10-23l141-141q28-28 68-28h512v-192h256v192h576z"></path></svg></mat-icon><span class="title-label">Area Restrictions</span></div><div class="popup-title">{{feature.properties["NAME"]}}</div><div class="popup-attributes"><div class="label">Date Active:</div><div class="attribute">{{new Date(feature.properties["ACCESS_STATUS_EFFECTIVE_DATE"]).toISOString().slice(0, 10)}}</div></div><div class="popup-attributes"><div class="label">Fire Centre:</div><div class="attribute">{{feature.properties["FIRE_CENTRE_NAME"]}}</div></div><div class="popup-button-container"><a class="popup-button" target="_blank" rel="noopener" v-if="feature.properties[\'BULLETIN_URL\']" v-bind:href="feature.properties[\'BULLETIN_URL\']">Learn More</a></div></div>',
      attributes: [
        {
          name: 'NAME',
          title: 'Name',
        },
        {
          name: 'ACCESS_STATUS_EFFECTIVE_DATE',
          title: 'Date Active',
        },
        {
          name: 'FIRE_CENTRE_NAME',
          title: 'Fire Centre',
        },
        {
          name: 'BULLETIN_URL',
          title: 'More Information',
        },
      ],
    },
    {
      type: 'wms',
      id: 'area-restrictions-highlight',
      title: 'BC Wildfire Area Restrictions',
      serviceUrl: ls.openmapsBaseUrl,
      layerName: 'pub:WHSE_LAND_AND_NATURAL_RESOURCE.PROT_RESTRICTED_AREAS_SP',
      opacity: 0.8,
      sld: `@${window.location.protocol}//${window.location.host}/assets/js/smk/area-restrictions-highlight.sld`,
    },
  ];
}
