import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { AppConfigService, TokenService } from "@wf1/core-ui";
import { Observable } from 'rxjs';

@Injectable({
    providedIn: 'root'
})
export class PublishedIncidentService {
  constructor(private appConfigService: AppConfigService, private tokenService: TokenService, private httpClient: HttpClient) {
  }

  public fetchPublishedIncidents (pageNum: number = 0, rowCount: number = 9999, fireOfNote = false, out = false, orderBy: string = 'lastUpdatedTimestamp%20DESC'): Observable<any> {
    const url = `${this.appConfigService.getConfig().rest['wfnews']}/publicPublishedIncident?pageNumber=${pageNum}&pageRowCount=${rowCount}&fireOfNote=${fireOfNote}&out=${out}&orderBy=${orderBy}`;
    return this.httpClient.get(url)
  }

  // published incident guid, WF Incident Guid, WF year and incident sequence number?
  public fetchPublishedIncident (guid: string): Observable<any> {
    const url = `${this.appConfigService.getConfig().rest['wfnews']}/publicPublishedIncident/${guid}`;
    return this.httpClient.get(url)
  }

  public async fetchIMIncident (fireYear: string, incidentNumber: string): Promise<any> {
    const url = `${this.appConfigService.getConfig().rest['incidents']}/incidents/${fireYear}/${incidentNumber}`
    const headers = {
      headers: {
        Authorization: `bearer ${this.tokenService.getOauthToken()}`
      }
    }

    const incident = await this.httpClient.get(url, headers).toPromise().catch(err => console.error(err)) as any
    const publishedUrl = `${this.appConfigService.getConfig().rest['incidents']}/publishedIncidents/byIncident/${incident.externalIdentifier}`
    const publishedIncident = await this.httpClient.get(publishedUrl, headers).toPromise().catch(err => console.error(err)) as any
    return {
      incident,
      publishedIncident
    }
  }

  public saveIMPublishedIncident (publishedIncident: any): Observable<any> {
    let publishedUrl = `${this.appConfigService.getConfig().rest['incidents']}/publishedIncidents`
    const headers = {
      headers: {
        Authorization: `bearer ${this.tokenService.getOauthToken()}`
      }
    }

    if (publishedIncident.publishedIncidentGuid) {
      return this.httpClient.put(publishedUrl + `/${publishedIncident.publishedIncidentGuid}`, publishedIncident, headers)
    } else {
      return this.httpClient.post(publishedUrl, publishedIncident, headers)
    }
  }
}
