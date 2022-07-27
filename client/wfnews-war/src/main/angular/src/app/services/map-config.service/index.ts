import { Injectable } from "@angular/core";
import { mapConfig } from "./map.config";
import { AppConfigService } from "@wf1/core-ui";
import { WfDevice } from "@wf1/wfcc-application-ui";

export interface MapServiceStatus {
    useSecure: boolean
    token?: string
}

@Injectable()
export class MapConfigService {
	constructor(
		private appConfig: AppConfigService
	) {}

	getMapConfig( status: MapServiceStatus, device: WfDevice ): Promise<any> {
		return this.appConfig.loadAppConfig().then( ( config ) => {
			return mapConfig( this.appConfig.getConfig().mapServiceConfig.layerSettings, status, device )
		} )
	}
}
