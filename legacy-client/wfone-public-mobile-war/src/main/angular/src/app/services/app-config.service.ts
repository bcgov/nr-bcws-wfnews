import { Injectable } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { ApplicationConfig } from "../interfaces/application-config";
import { environment } from "../../environments/environment";

@Injectable({
    providedIn: 'root',
})
export class AppConfigService {
    private appConfig: ApplicationConfig;
    private configPromise: Promise<ApplicationConfig>

    constructor(
        private http: HttpClient
    ) {
        this.configPromise = this.http.get(environment.app_config_location).toPromise()
            .then((data: ApplicationConfig) => {
                this.appConfig = data;
                return data
            })
    }

    loadAppConfig(): Promise<ApplicationConfig> {
        return this.configPromise
    }

    getConfig(): ApplicationConfig {
        return this.appConfig;
    }

    getAppResourcesConfig(): AppResourcesConfig {
        return new AppResourcesConfig(this.appConfig.applicationResources)
    }
}

export class AppResourcesConfig {
    constructor(private resource: object) { }
    get arcGisBaseUrl(): string { return this.resource['arc-gis-base-url'] }
    get bansProhibitionsRssLocation(): string { return this.resource['bans-prohibitions-rss-location'] }
    get burnRegistrationPhone(): string { return this.resource['burn-registration-phone'] }
    get dataCatalogueUrl(): string { return this.resource['data-catalogue-url'] }
    get datasetArearestrictionsUrl(): string { return this.resource['dataset-arearestrictions-url'] }
    get datasetCurrentConditionsUrl(): string { return this.resource['dataset-current-conditions-url'] }
    get datasetDangerratingUrl(): string { return this.resource['dataset-dangerrating-url'] }
    get datasetDrivebcUrl(): string { return this.resource['dataset-drivebc-url'] }
    get datasetEvacordersUrl(): string { return this.resource['dataset-evacorders-url'] }
    get datasetFirecentresUrl(): string { return this.resource['dataset-firecentres-url'] }
    get datasetFirelocationsUrl(): string { return this.resource['dataset-firelocations-url'] }
    get datasetFireperimeterUrl(): string { return this.resource['dataset-fireperimeter-url'] }
    get datasetFiresmokeUrl(): string { return this.resource['dataset-firesmoke-url'] }
    get datasetRadarurpprecipr14Url(): string { return this.resource['dataset-radarurpprecipr14-url'] }
    get datasetRecsitesUrl(): string { return this.resource['dataset-recsites-url'] }
    get datasetProtectedLandsUrl(): string { return this.resource['dataset-protectedlandrestrictions-url'] }
    get drivebcBaseUrl(): string { return this.resource['drivebc-base-url'] }
    get fbProfileUrl(): string { return this.resource['fb-profile-url'] }
    get feedbackEmail(): string { return this.resource['feedback-email'] }
    get fireDangerRatingUrl(): string { return this.resource['fire-danger-rating-url'] }
    get fireInfoPhone(): string { return this.resource['fire-info-phone'] }
    get fireTrackingUrl(): string { return this.resource['fire-tracking-url'] }
    get fireWeatherUrl(): string { return this.resource['fire-weather-url'] }
    get hazardAssessmentUrl(): string { return this.resource['hazard-assessment-url'] }
    get notificationsApiUrl(): string { return this.resource['notifications-api-url'] }
    get openmapsBaseUrl(): string { return this.resource['openmaps-base-url'] }
    get prescribedBurningUrl(): string { return this.resource['prescribed-burning-url'] }
    get prohibitionsRestrictionAdvisories(): string { return this.resource['prohibitions-restriction-advisories'] }
    get reportAFireCell(): string { return this.resource['report-a-fire-cell'] }
    get reportAFirePhone(): string { return this.resource['report-a-fire-phone'] }
    get twitterFeedProfileName(): string { return this.resource['twitter-feed-profile-name'] }
    get twitterProfileUrl(): string { return this.resource['twitter-profile-url'] }
    get wfssPointidApi(): string { return this.resource['wfss-pointid-api'] }
    get wfssPointidApiKey(): string { return this.resource['wfss.pointid.api.key'] }
    get notificationsApiKey(): string { return this.resource['notifications.api.key'] }
    get announcementsUrl(): string { return this.resource['announcements-url'] }
    get fireReportApi(): string { return this.resource['fire-report-api'] }
    get apiKey(): string { return this.resource['api-key'] }
    get wfnewsUrl(): string { return this.resource['wfnews-api-url'] }
    get wfnewsApiKey(): string { return this.resource['wfnews-api-key'] }

}