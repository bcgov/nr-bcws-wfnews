import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { AppConfigService, TokenService } from "@wf1/core-ui";
import { Observable, of } from "rxjs";
import { concatMap, map } from "rxjs/operators";

@Injectable({
    providedIn: 'root',
})
export class ResourceManagementService {

    constructor(
        private appConfigService: AppConfigService,
        private tokenService: TokenService,
        private httpClient: HttpClient,
    ) { }

    public fetchResource(
        fireYear: string,
        incidentNumber: string,
    ): Observable<any> {
        const url = `${this.appConfigService.getConfig().rest['resource-api']
            }/assignments?wildfireYear=${fireYear}&incidentNumberLabel=${incidentNumber}`;

        return this.httpClient
            .get(url, {
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `bearer ${this.tokenService.getOauthToken()}`,
                },
            })
            .pipe(
                map((response: any) => ({
                    response,
                    assignmentGuid: response.assignmentGuid,
                })),
            )
            .pipe(
                concatMap((data) => {
                    const date = Date.now();
                    const publishedUrl = `${this.appConfigService.getConfig().rest['resource-api']
                        }/${data.assignmentGuid}/resources/summary?date=${date}&summarySectionfilter=headerOnly`;
                    return of({
                        response: data.response,
                        getResource: this.httpClient.get(publishedUrl, {
                            headers: {
                                'Content-Type': 'application/json',
                                Authorization: `bearer ${this.tokenService.getOauthToken()}`,
                            },
                            observe: 'response'
                        }),
                    });
                }),
            );
    }

}