import { HttpClient } from '@angular/common/http';
import { Injector } from '@angular/core';
import { Store } from '@ngrx/store';
import { AppConfigService} from '@wf1/core-ui';
import { MapStatePersistenceService } from './services/map-state-persistence.service';

export function codeTableAndUserPrefFnInit(appConfig: AppConfigService, http: HttpClient,
  mapStatePersistenceService: MapStatePersistenceService, injector: Injector): () => Promise<any> {
    return () => {
        const store = injector.get(Store);

        return appConfig.loadAppConfig()
            .then(() => {

                const incidentsApiBaseUrl = appConfig.getConfig().rest['incidents'];
                const orgUnitApiBaseUrl = appConfig.getConfig().rest['orgunit'];
                const codeTablesEndpoint = 'codeTables?effectiveAsOfDate=' + new Date().getTime();
                const codeHierarchiesEndpoint = 'codeHierarchies';

                function fetchUrl(url: string) {
                    return http.get(url).toPromise();
                }

            })
            .catch((e) => {
                console.warn('Failed initializing app', e);
            });
    };
}

export function populateCodeTableCache(codeTable, codeHierarchy, orgCodeTable, orgHierarchy) {
    try {

    } catch (error) {
        console.error(error);
    }
}

export function getEndpointUrl(baseUrl: string, endpoint: string): string {
    const result = '';
    if (baseUrl && baseUrl.length > 0 && endpoint && endpoint.length > 0) {
        return baseUrl.endsWith('/') ? `${baseUrl}${endpoint}` : `${baseUrl}/${endpoint}`;
    } else if (baseUrl && baseUrl.length > 0) {
        return baseUrl;
    } else if (endpoint && endpoint.length > 0) {
        return endpoint;
    }
    return result;
}
