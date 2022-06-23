import { LayerConfig } from '..';
import { IncidentLayerConfig } from './incident.config';
import { NrofLayerConfig } from './nrof.config';
import { RofLayerConfig } from './rof.config';

export function FireReportLayersConfig(layerConfig: LayerConfig) {
    return [
        ...IncidentLayerConfig(),
        ...RofLayerConfig(),
        ...NrofLayerConfig(),
    ]
}
