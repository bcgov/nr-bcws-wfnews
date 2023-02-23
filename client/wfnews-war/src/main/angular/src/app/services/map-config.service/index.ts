import { Injectable } from '@angular/core';
import { mapConfig } from './map.config';
import { AppConfigService } from '@wf1/core-ui';

export interface MapServiceStatus {
    useSecure: boolean;
    token?: string;
}

export interface MapServices {
    [service: string]: string;
};

@Injectable()
export class MapConfigService {
	constructor(
		private appConfig: AppConfigService
	) {}

	getMapConfig(): Promise<any> {
        const status: MapServiceStatus = {
            useSecure: true,
            token: null,
        };

		return this.appConfig.loadAppConfig().then( ( config ) => mapConfig( this.appConfig.getConfig()[ 'mapServices' ], status, 'desktop', this.appConfig ) );
	}
}
