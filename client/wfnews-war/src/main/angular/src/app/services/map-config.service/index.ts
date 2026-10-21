import { Injectable } from '@angular/core';
import {
  mapConfig,
  reportOfFireMapConfig,
  reportOfFireOfflineMapConfig, previewMapConfig } from './map.config';
import { AppConfigService } from '@wf1/core-ui';

export interface MapServiceStatus {
  useSecure: boolean;
  token?: string;
}

export interface MapServices {
  [service: string]: string;
}

@Injectable()
export class MapConfigService {
  constructor(private appConfig: AppConfigService) {}

  getMapConfig(): Promise<any> {
    const status: MapServiceStatus = {
      useSecure: true,
      token: null,
    };

    return this.appConfig
      .loadAppConfig()
      .then((config) =>
        mapConfig(
          this.appConfig.getConfig()['mapServices'],
          status,
          'desktop',
          this.appConfig,
        ),
      );
  }

  /** A small read-only map for the preview and detail panels. */
  getPreviewMapConfig(option?: Parameters<typeof previewMapConfig>[0]): Promise<any> {
    // It needs nothing from the app config, so it does not fetch the config again.
    return Promise.resolve(previewMapConfig(option));
  }

  getReportOfFireMapConfig(): Promise<any> {
    const status: MapServiceStatus = {
      useSecure: true,
      token: null,
    };

    return this.appConfig
      .loadAppConfig()
      .then((config) =>
        reportOfFireMapConfig(
          this.appConfig.getConfig()['mapServices'],
          status,
          'desktop',
          this.appConfig,
        ),
      );
  }

  getReportOfFireOfflineMapConfig(): Promise<any> {
    const status: MapServiceStatus = {
      useSecure: true,
      token: null,
    };

    return this.appConfig
      .loadAppConfig()
      .then((config) =>
        reportOfFireOfflineMapConfig(
          this.appConfig.getConfig()['mapServices'],
          status,
          'desktop',
          this.appConfig,
        ),
      );
  }
}
