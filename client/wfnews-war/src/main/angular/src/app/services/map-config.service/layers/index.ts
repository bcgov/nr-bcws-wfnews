// import { AppResourcesConfig } from "../../app-config.service";
import { ActiveWildfiresLayerConfig } from "./active-wildfires.config";
import { AreaRestrictionsLayerConfig } from "./area-restrictions.config";
import { BansAndProhibitionsLayerConfig } from "./bans-and-prohibitions.config";
import { FireCentresLayerConfig } from "./bc-fire-centres.config";
import { WildfiresInactiveLayerConfig } from "./bcws-activefires-publicview-inactive.config";
import { ClosedRecreationSitesLayerConfig } from "./closed-recreation-sites.config";
import { DangerRatingLayerConfig } from "./danger-rating.config";
import { DriveBCEventsLayerConfig } from "./drive-bc-active-events.config";
import { FirePerimetersLayerConfig } from "./fire-perimeters.config";
import { WeatherLayerConfig } from "./weather.config";
import { EvacuationOrdersLayerConfig } from "./evacuation-orders-and-alerts-wms.config";
import { SmokeForecastLayerConfig } from "./hourly-currentforecast-firesmoke.config";
import { PrescribedFireLayerConfig } from "./prescribed-fire.config";
// import { NearMeItem } from "../../point-id.service";
import { WeatherStationsLayerConfig } from "./weather-stations.config";
import { PrecipitationLayerConfig } from "./precipitation.config";
import { MapServices, MapServiceStatus } from "..";

export type layerSettings = {
    openmapsBaseUrl: string
    drivebcBaseUrl: string

}
export function LayerConfig( mapServices: MapServices, serviceStatus: MapServiceStatus ) {
    let ls: layerSettings = {
        openmapsBaseUrl: mapServices[ 'openmapsBaseUrl' ],
        drivebcBaseUrl: mapServices[ 'drivebcBaseUrl' ]
    }

	return [
		...ActiveWildfiresLayerConfig( ls ),
		...AreaRestrictionsLayerConfig( ls ),
		...BansAndProhibitionsLayerConfig( ls ),
		...FireCentresLayerConfig( ls ),
		...WildfiresInactiveLayerConfig( ls ),
		...ClosedRecreationSitesLayerConfig( ls ),
		...DangerRatingLayerConfig( ls ),
		...DriveBCEventsLayerConfig( ls ),
		...EvacuationOrdersLayerConfig( ls ),
		...FirePerimetersLayerConfig( ls ),
		// ...SmokeForecastLayerConfig( ls ),
		...PrescribedFireLayerConfig( ls ),
		// ...WeatherLayerConfig( ls ),
        // ...WeatherStationsLayerConfig( ls ),
        // ...PrecipitationLayerConfig( ls )
	]
}

// export function notificationDetailLayerConfig( res: AppResourcesConfig ) {
// 	return [
// 		...ActiveWildfiresLayerConfig( res ),
// 		...FireCentresLayerConfig( res ),
// 	]
// }

// export function nearMeItemLayerConfig( res: AppResourcesConfig, nearMeItem: NearMeItem ) {
//     let highlighted = []

//     if ( nearMeItem.key )
//         switch ( nearMeItem.type ) {
//         case 'BANS_AND_PROHIBITIONS':
//             highlighted = BansAndProhibitionsLayerConfig( res )
//             highlighted[ 1 ][ 'where' ] = `PROT_BAP_SYSID=${ nearMeItem.key }`
//             break

//         case 'EVACUATION_ORDERS':
//             highlighted = EvacuationOrdersLayerConfig( res )
//             highlighted[ 1 ][ 'where' ] = `EMRG_OAA_SYSID=${ nearMeItem.key }`
//             break

//         case 'AREA_RESTRICTIONS':
//             highlighted = AreaRestrictionsLayerConfig( res )
//             highlighted[ 1 ][ 'where' ] = `PROT_RA_SYSID=${ nearMeItem.key }`
//             break
//         }

//     return [
// 		...ActiveWildfiresLayerConfig( res ),
// 		...FireCentresLayerConfig( res ),
//         ...highlighted
// 	]
// }
