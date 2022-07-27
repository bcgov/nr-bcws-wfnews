import { LayerServiceConfig, LayerSettings } from '@wf1/core-ui';
import { MapServiceStatus } from '..';

export interface LayerConfig {
    layerServices: {
        wildfire: LayerServiceConfig
        bcgw: LayerServiceConfig
        mobileResource: LayerServiceConfig
    },
    token?: string
}

export function LayerConfig(layerSettings: LayerSettings, serviceStatus: MapServiceStatus) {
    // var attributeSets = {
    //     "ued-start": [],
    //     "ued-end": [],
    //     "client-assets": [],
    //     "resources": []
    // }

    let suffix = serviceStatus.useSecure ? '-secured' : ''

    let c: LayerConfig = {
        layerServices: {
            bcgw: layerSettings.layerServices[ 'bcgw' + suffix ],
            wildfire: layerSettings.layerServices[ 'wildfire' + suffix ],
            mobileResource: layerSettings.layerServices[ 'mobileResource' + suffix ]
        },
        token: serviceStatus.token
    }

    return [
    ]
}
