import { layerSettings } from '.';

export function FireCentresLayerConfig(ls: layerSettings) {
    return [
        {
            type: 'wms',
            id: 'bc-fire-centres',
            title: 'BC Wildfire Fire Centres',
            serviceUrl: ls.openmapsBaseUrl,
            layerName: 'pub:WHSE_LEGAL_ADMIN_BOUNDARIES.DRP_MOF_FIRE_CENTRES_SP',
            styleName: '3458',
            isQueryable: true,
            popupTemplate: '@wf-feature'
        }
    ];
}
