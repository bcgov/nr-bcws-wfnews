import { layerSettings } from '.';

export function CLABIndianReservesLayerConfig(ls: layerSettings) {
  return [
    {
      type: 'wms',
      id: 'clab-indian-reserves',
      title: 'Indian Reserve',
      serviceUrl: ls.openmapsBaseUrl,
      layerName: 'pub:WHSE_ADMIN_BOUNDARIES.CLAB_INDIAN_RESERVES',
      styleName: '375',
      titleAttribute: 'ENGLISH_NAME',
      geometryAttribute: 'GEOMETRY',
      attributes: [
        {
          name: 'ENGLISH_NAME',
          title: 'English Name',
        },
        {
          name: 'FRENCH_NAME',
          title: 'French Name',
        },
      ],
    },
  ];
}
