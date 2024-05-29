import { Injectable } from "@angular/core";
import { TokenService } from "@wf1/core-ui";
import { Observable, of } from "rxjs";
import { concatMap, map } from "rxjs/operators";
import { DefaultService as ScheduleAPIService } from "@wf1/wfrm-resource-schedule-api";
import { UUID } from "angular2-uuid";

export interface AssignmentResourcesSummary {
    "Header Total": {
        resources: { name: string, count: number }[]
    },
    "Single Resources": AssignmentResourcesSummaryDetail,
    "Crews": AssignmentResourcesSummaryDetail,
    "Heavy Equipment": AssignmentResourcesSummaryDetail,
    "Light Equipment": AssignmentResourcesSummaryDetail,
    "Fire Services Equipment": AssignmentResourcesSummaryDetail,
}

export interface AssignmentResourcesSummaryDetail {
    totalCount: number
    resources: Array<{
        name: string,
        count: number
    }>
}

@Injectable({
        providedIn: 'root',
    })
export class ResourceManagementService {

    constructor(
        private tokenService: TokenService,
        private scheduleApiService: ScheduleAPIService,
    ) { }

    public fetchResource(
        fireYear: string,
        incidentNumber: string,
        summaryFilter: string
    ): Observable<any> {
        const authToken = this.tokenService.getOauthToken();
        const requestId = `WFRME${UUID.UUID().toUpperCase()}`.replace(/-/g, "");
        return this.scheduleApiService.getAssignmentList(
            requestId,
            1,
            "no-cache",
            "no-cache",
            `Bearer ${authToken}`,
            undefined,
            [fireYear],
            undefined,
            undefined,
            undefined,
            undefined,
            [incidentNumber],
            undefined,
            undefined,
            undefined,
            undefined,
            undefined,
            "1",
            "1",
        ).pipe(
            map((response: any) => ({
                response,
                assignmentGuid: response.collection[0].assignmentGuid,
            })),
        )
            .pipe(
                concatMap((data) => {
                    return of({
                        response: data.response,
                        summary: this.scheduleApiService.getAssignmentResourcesSummary(
                            data.assignmentGuid,
                            requestId,
                            2,
                            "no-cache",
                            "no-cache",
                            `Bearer ${authToken}`,
                            new Date().toISOString().slice(0, 10),
                            summaryFilter
                        ).toPromise()
                    });
                }),
            );
    }


}