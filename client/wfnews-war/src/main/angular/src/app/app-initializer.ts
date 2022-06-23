import { HttpClient } from "@angular/common/http";
import { Injector } from "@angular/core";
import { Store } from "@ngrx/store";
import { AppConfigService, TokenService } from "@wf1/core-ui";
import { MapStatePersistenceService } from "./services/map-state-persistence.service";
import * as CodeDataActions from "./store/code-data/code-data.actions";
import { formatCodeHierarchies } from "./store/code-data/code-data.reducers";
import { loadUserPrefsSuccess } from "./store/searchAndConfig/search-and-config.actions";
import { CODE_TABLE_CACHE } from "./utils";

export function codeTableAndUserPrefFnInit(appConfig: AppConfigService, http: HttpClient, mapStatePersistenceService: MapStatePersistenceService, injector: Injector): () => Promise<any> {
    return () => {
        let store = injector.get(Store)

        return appConfig.loadAppConfig()
            .then(() => {
                const tokenService = injector.get( TokenService )

                const incidentsApiBaseUrl = appConfig.getConfig().rest['incidents'];
                const orgUnitApiBaseUrl = appConfig.getConfig().rest['orgunit'];
                const codeTablesEndpoint = 'codeTables?effectiveAsOfDate=' + new Date().getTime();
                const codeHierarchiesEndpoint = 'codeHierarchies';

                function fetchUrl(url: string) {
                    return http.get(url).toPromise()
                }

                return tokenService.authTokenEmitter.toPromise()
                    .then( () => {
                        return Promise.all([
                            fetchUrl(getEndpointUrl(incidentsApiBaseUrl, codeTablesEndpoint)).then((res) => {
                                store.dispatch(new CodeDataActions.GetCodeTableDataSuccessAction(res))
                                return res
                            }),
                            fetchUrl(getEndpointUrl(incidentsApiBaseUrl, codeHierarchiesEndpoint)).then((res) => {
                                store.dispatch(new CodeDataActions.GetCodeHierarchyDataSuccessAction(res))
                                return res
                            }),
                            fetchUrl(getEndpointUrl(orgUnitApiBaseUrl, codeTablesEndpoint)).then((res) => {
                                store.dispatch(new CodeDataActions.GetOrgCodeTableDataSuccessAction(res))
                                return res
                            }),
                            fetchUrl(getEndpointUrl(orgUnitApiBaseUrl, codeHierarchiesEndpoint)).then((res) => {
                                store.dispatch(new CodeDataActions.GetOrgCodeHierarchyDataSuccessAction(res))
                                return res
                            })
                        ])
                    } )
                    .then((tables: Array<any>) => {
                        populateCodeTableCache(tables[0].codeTableList, tables[1], tables[2].codeTableList, tables[3])
                    })
                    .catch((e) => {
                        console.warn('Failed to load one of the code tables', e)
                    })
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
