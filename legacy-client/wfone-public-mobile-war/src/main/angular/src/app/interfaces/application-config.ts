export interface PollingConfig {
  [prop: string]: number;
}

export interface ApplicationPollingConfig {
  [prop: string]: PollingConfig;
}

export interface PagingConfig {
  [prop: string]: number;
}

export interface Application {
  acronym: string;
  version: string;
  baseUrl: string;
  environment: string;
  buildNumber?: string;
  polling: ApplicationPollingConfig;
  maxListPageSize: PagingConfig;
}

export interface IndividualAppConfig {
  url: string;
  authentication?: string;
  user?: string;
  password?: string;
  themeHash?: string;
  scriptsHash?: string;
}

export interface ExternalAppConfig {
  [prop: string]: IndividualAppConfig;
}

export interface CauseCodeConfig {
    [prop: string]: IndividualAppConfig;
}

export interface RestConfig {
  [prop: string]: string;
}

export interface WebADE {
  oauth2Url: string;
}

export class ApplicationConfig {
  application: Application;
  externalAppConfig: ExternalAppConfig;
  rest: RestConfig;
  webade: WebADE;
  mapConfig: any;
  causeCodeConfig: CauseCodeConfig;
  applicationResources: any;
}
