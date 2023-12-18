import { HttpClient } from '@angular/common/http';
import { Injector } from '@angular/core';
import { AppConfigService } from '@wf1/core-ui';

export function codeTableAndUserPrefFnInit(
  appConfig: AppConfigService,
  http: HttpClient,
  injector: Injector,
): () => Promise<any> {
  return () => appConfig.loadAppConfig().catch((e) => {
      console.warn('Failed initializing app', e);
    });
}

export function getEndpointUrl(baseUrl: string, endpoint: string): string {
  const result = '';
  if (baseUrl && baseUrl.length > 0 && endpoint && endpoint.length > 0) {
    return baseUrl.endsWith('/')
      ? `${baseUrl}${endpoint}`
      : `${baseUrl}/${endpoint}`;
  } else if (baseUrl && baseUrl.length > 0) {
    return baseUrl;
  } else if (endpoint && endpoint.length > 0) {
    return endpoint;
  }
  return result;
}
