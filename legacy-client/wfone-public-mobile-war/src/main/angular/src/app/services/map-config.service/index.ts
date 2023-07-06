import { Injectable } from "@angular/core";
import { mapConfig, nearMeItemMapConfig, notificationDetailMapConfig, reportOfFireMapConfig } from "./map.config";
import { AppConfigService, AppResourcesConfig } from "../app-config.service";
import { ApplicationStateService } from "../application-state.service";
import { NearMeItem } from "../point-id.service";

@Injectable()
export class MapConfigService {
	constructor(
		private appConfig: AppConfigService,
    	private applicationStateService: ApplicationStateService
	) {}

	getMapConfig(): Promise<any> {
		var self = this

		return this.appConfig.loadAppConfig()
			.then( function () {
				return self.appConfig.getAppResourcesConfig()
			} )
			.then( function ( res: AppResourcesConfig ) {
				return mapConfig( self.applicationStateService, res )
			} )
	}

	getNotificationDetailMapConfig( movement: boolean, center?: number[], zoom?: number ): Promise<any> {
		var self = this

		return this.appConfig.loadAppConfig()
			.then( function () {
				return self.appConfig.getAppResourcesConfig()
			} )
			.then( function ( res: AppResourcesConfig ) {
				return notificationDetailMapConfig( self.applicationStateService, res, movement, center, zoom )
			} )
	}

	getNearMeItemMapConfig(  movement: boolean, nearMeItem: NearMeItem ): Promise<any> {
		var self = this

		return this.appConfig.loadAppConfig()
			.then( function () {
				return self.appConfig.getAppResourcesConfig()
			} )
			.then( function ( res: AppResourcesConfig ) {
				return nearMeItemMapConfig( self.applicationStateService, res, movement, nearMeItem )
			} )
	}

	getReportOfFireMapConfig( ): Promise<any> {
		var self = this

		return this.appConfig.loadAppConfig()
			.then( function () {
				return self.appConfig.getAppResourcesConfig()
			} )
			.then( function ( res: AppResourcesConfig ) {
				return reportOfFireMapConfig( self.applicationStateService, res )
			} )
	}
}
