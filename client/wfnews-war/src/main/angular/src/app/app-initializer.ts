import { HttpClient } from "@angular/common/http";
import { Injector } from "@angular/core";
import { Store } from "@ngrx/store";
import { AppConfigService} from "@wf1/core-ui";
import { MapStatePersistenceService } from "./services/map-state-persistence.service";
import { formatCodeHierarchies } from "./store/code-data/code-data.reducers";
import { loadUserPrefsSuccess } from "./store/searchAndConfig/search-and-config.actions";
import { CODE_TABLE_CACHE } from "./utils";

export function codeTableAndUserPrefFnInit(appConfig: AppConfigService, http: HttpClient, mapStatePersistenceService: MapStatePersistenceService, injector: Injector): () => Promise<any> {
    return () => {
        let store = injector.get(Store)

        return appConfig.loadAppConfig()
            .then(() => {

                const incidentsApiBaseUrl = appConfig.getConfig().rest['incidents'];
                const orgUnitApiBaseUrl = appConfig.getConfig().rest['orgunit'];
                const codeTablesEndpoint = 'codeTables?effectiveAsOfDate=' + new Date().getTime();
                const codeHierarchiesEndpoint = 'codeHierarchies';

                function fetchUrl(url: string) {
                    return http.get(url).toPromise()
                }

            })
            .then(() => {
                return mapStatePersistenceService.getNonMapPrefs()
                    .then((prefs) => {
                        prefs.forEach((p) => {
                            store.dispatch(loadUserPrefsSuccess(p))
                        })
                    })
            })
            .catch((e) => {
                console.warn('Failed initializing app', e)
            })
    }
}

export function populateCodeTableCache(codeTable, codeHierarchy, orgCodeTable, orgHierarchy) {
    try {
        CODE_TABLE_CACHE['codeTables'] = codeTable.reduce((acc, table) => ({ ...acc, [table.codeTableName]: table.codes.filter((item: any) => Date.now() <= new Date(item.expiryDate).getTime()) }), {});
        CODE_TABLE_CACHE['orgCodeTables'] = orgCodeTable.reduce((acc, table) => ({ ...acc, [table.codeTableName]: table.codes }), {});

        const codeTableHierarchies = orgHierarchy.codeHierarchyList || [];
        const formattedCodeHierarchies = formatCodeHierarchies(codeTableHierarchies);
        CODE_TABLE_CACHE['orgCodeHierarchyIndex'] = formattedCodeHierarchies;
    }
    catch (error) {
        console.error(error)
    }
}

export function getEndpointUrl(baseUrl: string, endpoint: string): string {
    let result = '';
    if (baseUrl && baseUrl.length > 0 && endpoint && endpoint.length > 0) {
        return baseUrl.endsWith('/') ? `${baseUrl}${endpoint}` : `${baseUrl}/${endpoint}`;
    }
    else if (baseUrl && baseUrl.length > 0) {
        return baseUrl;
    }
    else if (endpoint && endpoint.length > 0) {
        return endpoint;
    }
    return result;
}
