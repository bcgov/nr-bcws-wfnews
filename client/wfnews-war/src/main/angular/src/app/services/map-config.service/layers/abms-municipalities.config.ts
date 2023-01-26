import { layerSettings } from '.';

export function AbmsMunicipalitiesLayerConfig(ls: layerSettings) {
    return [
        {
            type: 'wms',
            id: 'abms-municipalities',
            title: 'Municipalities',
            serviceUrl: ls.openmapsBaseUrl,
            layerName: 'pub:WHSE_LEGAL_ADMIN_BOUNDARIES.ABMS_MUNICIPALITIES_SP',
            styleName: '410',
            titleAttribute: 'ADMIN_AREA_NAME',
            geometryAttribute: 'SHAPE',
            attributes: [
              {
                name: 'ADMIN_AREA_NAME',
                title: 'Admin Area Name'
              },
              {
                name: 'ADMIN_AREA_BOUNDARY_TYPE',
                title: 'Type'
              },
              {
                name: 'ADMIN_AREA_GROUP_NAME',
                title: 'Group'
              },
              {
                name: 'WEBSITE_URL',
                title: 'URL'
              },
              {
                name: 'IMAGE_URL',
                title: 'Image'
              }
            ],
            legend: {
              title: ' ',
              url: '/assets/images/legend_municipalities.png',
              width: 20,
              height: 20
            },
        }
    ];
}
