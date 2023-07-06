import { AppResourcesConfig } from "../../app-config.service";
import { ActiveWildfiresUnderControlLayerConfig } from "./active-wildfires-under-control.config";
import { AreaRestrictionsLayerConfig } from "./area-restrictions.config";
import { ProtectedLandsAccessRestrictionsLayerConfig } from "./protected-lands-access-restrictions.config"
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
import { NearMeItem } from "../../point-id.service";
import { WeatherStationsLayerConfig } from "./weather-stations.config";
import { RegionalDistrictsLayerConfig } from "./regional-districts";
import { PrecipitationLayerConfig } from "./precipitation.config";
import { ActiveWildfiresHoldingLayerConfig } from "./active-wildfires-holding.config";
import { ActiveWildfiresOutOfControlLayerConfig } from "./active-wildfires-out-of-control.config";
import { ActiveWildfiresOfNoteLayerConfig } from "./active-wildfires-fire-of-note.config";

export function LayerConfig(res: AppResourcesConfig) {
	return [
		...ActiveWildfiresUnderControlLayerConfig(res),
		...ActiveWildfiresHoldingLayerConfig(res),
		...ActiveWildfiresOutOfControlLayerConfig(res),
		...ActiveWildfiresOfNoteLayerConfig(res),
		...AreaRestrictionsLayerConfig(res),
		...ProtectedLandsAccessRestrictionsLayerConfig(res),
		...BansAndProhibitionsLayerConfig(res),
		...FireCentresLayerConfig(res),
		...WildfiresInactiveLayerConfig(res),
		...ClosedRecreationSitesLayerConfig(res),
		...DangerRatingLayerConfig(res),
		...DriveBCEventsLayerConfig(res),
		...EvacuationOrdersLayerConfig(res),
		...FirePerimetersLayerConfig(res),
		...SmokeForecastLayerConfig(res),
		...PrescribedFireLayerConfig(res),
		...WeatherLayerConfig(res),
		...WeatherStationsLayerConfig(res),
		...RegionalDistrictsLayerConfig(res),
		...PrecipitationLayerConfig(res)
	]
}

export function notificationDetailLayerConfig(res: AppResourcesConfig) {
	return [
		...ActiveWildfiresUnderControlLayerConfig(res),
		...ActiveWildfiresHoldingLayerConfig(res),
		...ActiveWildfiresOutOfControlLayerConfig(res),
		...ActiveWildfiresOfNoteLayerConfig(res),
		...FireCentresLayerConfig(res),
	]
}

export function nearMeItemLayerConfig(res: AppResourcesConfig, nearMeItem: NearMeItem) {
	let highlighted = []

	if (nearMeItem.key)
		switch (nearMeItem.type) {
			case 'BANS_AND_PROHIBITIONS':
				highlighted = BansAndProhibitionsLayerConfig(res)
				highlighted[1]['where'] = `PROT_BAP_SYSID=${nearMeItem.key}`
				break

			case 'EVACUATION_ORDERS':
				highlighted = EvacuationOrdersLayerConfig(res)
				highlighted[1]['where'] = `EMRG_OAA_SYSID=${nearMeItem.key}`
				break

			case 'AREA_RESTRICTIONS':
				highlighted = AreaRestrictionsLayerConfig(res)
				highlighted[1]['where'] = `PROT_RA_SYSID=${nearMeItem.key}`
				break
		}

	return [
		...ActiveWildfiresUnderControlLayerConfig(res),
		...ActiveWildfiresHoldingLayerConfig(res),
		...ActiveWildfiresOutOfControlLayerConfig(res),
		...ActiveWildfiresOfNoteLayerConfig(res),
		...FireCentresLayerConfig(res),
		...highlighted
	]
}
