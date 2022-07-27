import { Injectable } from "@angular/core";
import { mapConfig } from "./map.config";
import { AppConfigService } from "@wf1/core-ui";
import { WfDevice } from "@wf1/wfcc-application-ui";

export interface MapServiceStatus {
    useSecure: boolean
    token?: string
}

export type MapServices = {
    [service: string]: string
}

@Injectable()
export class MapConfigService {
	constructor(
		private appConfig: AppConfigService
	) {}

	getMapConfig(): Promise<any> {
        let status: MapServiceStatus = {
            useSecure: true,
            token: null,
        }

		return this.appConfig.loadAppConfig().then( ( config ) => {
			return mapConfig( this.appConfig.getConfig()[ 'mapServices' ], status, 'desktop' )
		} )
	}
}
