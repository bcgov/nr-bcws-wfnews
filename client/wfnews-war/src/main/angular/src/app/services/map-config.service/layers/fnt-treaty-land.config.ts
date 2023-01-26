import { layerSettings } from '.';

export function FntTreatyLandLayerConfig(ls: layerSettings) {
    return [
        {
            type: 'wms',
            id: 'fnt-treaty-land',
            title: 'First Nations Treaty Land',
            serviceUrl: ls.openmapsBaseUrl,
            layerName: 'pub:WHSE_LEGAL_ADMIN_BOUNDARIES.FNT_TREATY_LAND_SP',
            styleName: '6214',
            titleAttribute: 'FIRST_NATION_NAME',
            geometryAttribute: 'GEOMETRY',
            attributes: [
              {
                name: 'TREATY',
                title: 'Treaty'
              },
              {
                name: 'FIRST_NATION_NAME',
                title: 'First Nation Name'
              },
              {
                name: 'COMMENTS',
                title: 'Comments'
              }
            ],
            legend: {
              title: ' ',
              url: '/assets/images/legend_treaty_land.png',
              width: 20,
              height: 20
            },
        }
    ];
}
