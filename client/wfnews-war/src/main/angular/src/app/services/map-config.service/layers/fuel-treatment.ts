import { layerSettings } from '.';

export function FuelTreatmentLayerConfig(ls: layerSettings) {
  return [
    {
      type: 'wms',
      id: 'fuel-treatment',
      title: 'Fuel Treatments',
      serviceUrl: ls.openmapsBaseUrl,
      layerName: 'pub:WHSE_LAND_AND_NATURAL_RESOURCE.PROT_FUEL_TREATMENTS_SP',
      styleName: '7948',
      titleAttribute: 'PROJECT_ID',
      geometryAttribute: 'SHAPE',
      attributes: [
        {
          name: 'PROJECT_TYPE',
          title: 'Type',
        },
        {
          name: 'INTAKE_YEAR',
          title: 'Intake Year',
        },
        {
          name: 'LOCAL_GOVERNMENT',
          title: 'Local Government',
        },
      ],
    },
  ];
}
