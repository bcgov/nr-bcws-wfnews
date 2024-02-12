import { AppConfigService } from '@wf1/core-ui';
import { MapServices, MapServiceStatus } from '..';
import { AbmsMunicipalitiesLayerConfig } from './abms-municipalities.config';
import { AbmsRegionalDistrictsLayerConfig } from './abms-regional-districts.config';
import { ActiveWildfiresLayerConfig } from './active-wildfires.config';
import { ActiveWildfiresHeatmapLayerConfig } from './active-wildfires.heatmap.config';
import { AreaRestrictionsLayerConfig } from './area-restrictions.config';
import { BansAndProhibitionsLayerConfig } from './bans-and-prohibitions.config';
import { FireCentresLayerConfig } from './bc-fire-centres.config';
import { ProtectedLandsAccessRestrictionsLayerConfig } from './bc-parks-closures.config';
import { WildfiresInactiveLayerConfig } from './bcws-activefires-publicview-inactive.config';
import { CLABIndianReservesLayerConfig } from './clab-indian-reserves.config';
import { ClosedRecreationSitesLayerConfig } from './closed-recreation-sites.config';
import { DangerRatingLayerConfig } from './danger-rating.config';
import { DriveBCEventsLayerConfig } from './drive-bc-active-events.config';
import { EvacuationOrdersLayerConfig } from './evacuation-orders-and-alerts-wms.config';
import { FirePerimetersLayerConfig } from './fire-perimeters.config';
import { FntTreatyLandLayerConfig } from './fnt-treaty-land.config';
import { ForestServiceRoadsLayerConfig } from './fsr-safety.config';
import { SmokeForecastLayerConfig } from './hourly-currentforecast-firesmoke.config';
import { PrecipitationLayerConfig } from './precipitation.config';
import { WeatherStationsLayerConfig } from './weather-stations.config';
import { WeatherLayerConfig } from './weather.config';
import { BasemapLayerConfig } from './basemap.config';
//import { FuelTreatmentLayerConfig } from './fuel-treatment';
//import { PrescribedFireLayerConfig } from './prescribed-fire.config';

export interface layerSettings {
  openmapsBaseUrl: string;
  drivebcBaseUrl: string;
  wfnewsUrl: string;
  evacOrdersURL: string;
}
export function LayerConfig(
  mapServices: MapServices,
  serviceStatus: MapServiceStatus,
  appConfigService: AppConfigService,
) {
  const ls: layerSettings = {
    openmapsBaseUrl: mapServices['openmapsBaseUrl'],
    drivebcBaseUrl: mapServices['drivebcBaseUrl'],
    wfnewsUrl: mapServices['wfnews'],
    evacOrdersURL: appConfigService.getConfig().externalAppConfig['AGOLevacOrders'].toString()
  };

  return [
    ...ActiveWildfiresLayerConfig(
      ls,
      appConfigService.getConfig().application['wfnewsApiKey'],
    ),
    ...AreaRestrictionsLayerConfig(ls),
    ...BansAndProhibitionsLayerConfig(ls),
    ...FireCentresLayerConfig(ls),
    ...WildfiresInactiveLayerConfig(ls),
    ...ClosedRecreationSitesLayerConfig(ls),
    ...DangerRatingLayerConfig(ls),
    ...DriveBCEventsLayerConfig(ls),
    ...EvacuationOrdersLayerConfig(ls),
    ...FirePerimetersLayerConfig(ls),
    ...SmokeForecastLayerConfig(ls),
    // ...PrescribedFireLayerConfig( ls ),
    ...WeatherLayerConfig(ls),
    ...WeatherStationsLayerConfig(ls),
    ...PrecipitationLayerConfig(ls),
    ...ForestServiceRoadsLayerConfig(ls),
    ...ActiveWildfiresHeatmapLayerConfig(ls),
    ...CLABIndianReservesLayerConfig(ls),
    ...FntTreatyLandLayerConfig(ls),
    ...AbmsMunicipalitiesLayerConfig(ls),
    ...AbmsRegionalDistrictsLayerConfig(ls),
    ...ProtectedLandsAccessRestrictionsLayerConfig(ls),
    ...BasemapLayerConfig(ls),
    // ...FuelTreatmentLayerConfig(ls),
  ];
}
