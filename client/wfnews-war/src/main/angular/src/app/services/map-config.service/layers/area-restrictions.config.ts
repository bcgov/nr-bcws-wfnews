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
        '<div class="smk-popup"><div class="popup-header"><span class="popup-header-icon map-signs"></span><span class="title-label">Area Restrictions</span></div><div class="popup-title">{{feature.properties["NAME"]}}</div><div class="popup-attributes"><div class="label">Date Active:</div><div class="attribute">{{new Date(feature.properties["ACCESS_STATUS_EFFECTIVE_DATE"]).toISOString().slice(0, 10)}}</div></div><div class="popup-attributes"><div class="label">Fire Centre:</div><div class="attribute">{{feature.properties["FIRE_CENTRE_NAME"]}}</div></div><div class="popup-button-container"><a class="popup-button" target="_blank" rel="noopener" v-if="feature.properties[\'BULLETIN_URL\']" v-bind:href="feature.properties[\'BULLETIN_URL\']">Learn More</a></div></div>',
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
