import { ActiveWildfiresLayerConfig } from './active-wildfires.config';
import { AreaRestrictionsLayerConfig } from './area-restrictions.config';
import { BansAndProhibitionsLayerConfig } from './bans-and-prohibitions.config';
import { FireCentresLayerConfig } from './bc-fire-centres.config';
import { WildfiresInactiveLayerConfig } from './bcws-activefires-publicview-inactive.config';
import { ClosedRecreationSitesLayerConfig } from './closed-recreation-sites.config';
import { DangerRatingLayerConfig } from './danger-rating.config';
import { DriveBCEventsLayerConfig } from './drive-bc-active-events.config';
import { FirePerimetersLayerConfig } from './fire-perimeters.config';
import { WeatherLayerConfig } from './weather.config';
import { EvacuationOrdersLayerConfig } from './evacuation-orders-and-alerts-wms.config';
import { SmokeForecastLayerConfig } from './hourly-currentforecast-firesmoke.config';
import { WeatherStationsLayerConfig } from './weather-stations.config';
import { PrecipitationLayerConfig } from './precipitation.config';
import { ForestServiceRoadsLayerConfig } from './fsr-safety.config';
import { CLABIndianReservesLayerConfig } from './clab-indian-reserves.config';
import { FntTreatyLandLayerConfig } from './fnt-treaty-land.config';
import { AbmsMunicipalitiesLayerConfig } from './abms-municipalities.config';
import { AbmsRegionalDistrictsLayerConfig } from './abms-regional-districts.config';
import { MapServices, MapServiceStatus } from '..';
import { ActiveWildfiresHeatmapLayerConfig } from './active-wildfires.heatmap.config';
import { AppConfigService } from '@wf1/core-ui';
import { ProtectedLandsAccessRestrictionsLayerConfig } from './bc-parks-closures.config';

export interface layerSettings {
    openmapsBaseUrl: string;
    drivebcBaseUrl: string;
    wfnewsUrl: string;

};
export function LayerConfig( mapServices: MapServices, serviceStatus: MapServiceStatus, appConfigService: AppConfigService ) {
    const ls: layerSettings = {
        openmapsBaseUrl: mapServices[ 'openmapsBaseUrl' ],
        drivebcBaseUrl: mapServices[ 'drivebcBaseUrl' ],
        wfnewsUrl: mapServices[ 'wfnews' ]
    };

	return [
		...ActiveWildfiresLayerConfig( ls, appConfigService.getConfig().application['wfnewsApiKey'] ),
		...AreaRestrictionsLayerConfig( ls ),
		...BansAndProhibitionsLayerConfig( ls ),
		...FireCentresLayerConfig( ls ),
		...WildfiresInactiveLayerConfig( ls ),
		...ClosedRecreationSitesLayerConfig( ls ),
		...DangerRatingLayerConfig( ls ),
		...DriveBCEventsLayerConfig( ls ),
		...EvacuationOrdersLayerConfig( ls ),
		...FirePerimetersLayerConfig( ls ),
		...SmokeForecastLayerConfig( ls ),
    // Hiding temporarily as the dataset is reconfigured
    // ...PrescribedFireLayerConfig( ls ),
		...WeatherLayerConfig( ls ),
    ...WeatherStationsLayerConfig( ls ),
    ...PrecipitationLayerConfig( ls ),
    ...ForestServiceRoadsLayerConfig( ls ),
    ...ActiveWildfiresHeatmapLayerConfig( ls ),
    ...CLABIndianReservesLayerConfig( ls ),
    ...FntTreatyLandLayerConfig( ls ),
    ...AbmsMunicipalitiesLayerConfig( ls ),
    ...AbmsRegionalDistrictsLayerConfig( ls ),
    ...ProtectedLandsAccessRestrictionsLayerConfig( ls )
	];
}
