import { LayerServiceConfig, LayerSettings } from '@wf1/core-ui';
import { MapServiceStatus } from '..';
import { BcgwLayersConfig } from "./bcgw-layers.config";
import { FireReportLayersConfig } from "./fire-report-layers.config";
import { MobileResourcesLayersConfig } from './mobile-resources-layers.config';
import { WildfireLayersConfig } from "./wildfire-layers.config";

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
        ...FireReportLayersConfig(c),
        ...BcgwLayersConfig(c),
        ...WildfireLayersConfig(c),
        ...MobileResourcesLayersConfig(c)
    ]
}
