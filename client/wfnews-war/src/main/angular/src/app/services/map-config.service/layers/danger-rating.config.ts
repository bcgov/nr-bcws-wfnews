import { layerSettings } from '.';

export function DangerRatingLayerConfig(ls: layerSettings) {
  return [
    {
      type: 'wms',
      id: 'danger-rating',
      title: 'BC Wildfire Danger Rating',
      serviceUrl: ls.openmapsBaseUrl,
      layerName: 'pub:WHSE_LAND_AND_NATURAL_RESOURCE.PROT_DANGER_RATING_SP',
      styleName: '7734',
      isQueryable: true,
      titleAttribute: 'DANGER_RATING_DESC',
      geometryAttribute: 'SHAPE',
      attributes: [
        {
          name: 'DANGER_RATING_DESC',
          title: 'Danger Rating',
        },
      ],
    },
  ];
}
