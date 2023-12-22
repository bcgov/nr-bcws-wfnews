import { layerSettings } from '.';

export function BasemapLayerConfig(ls: layerSettings) {
  return [
    {
      type: 'esri-tiled',
      id: 'bc-hillshade',
      title: 'BC Hillshade',
      isQueryable: false,
      attribution: 'Copyright 117 DataBC, Government of British Columbia',
      serviceUrl:
        'https://tiles.arcgis.com/tiles/B6yKvIZqzuOr0jBR/arcgis/rest/services/Canada_Hillshade/MapServer',
      opacity: 1.0,
    },
  ];
}
