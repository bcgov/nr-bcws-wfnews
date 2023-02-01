import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { AppConfigService, TokenService } from "@wf1/core-ui";
import { Observable, of } from 'rxjs';
import { concatMap, map } from 'rxjs/operators';

@Injectable({
    providedIn: 'root'
})
export class PublishedIncidentService {
  constructor(private appConfigService: AppConfigService, private tokenService: TokenService, private httpClient: HttpClient) {  }

  public fetchPublishedIncidents (pageNum: number = 0, rowCount: number = 9999, fireOfNote = false, out = false, orderBy: string = 'lastUpdatedTimestamp%20DESC'): Observable<any> {
    const url = `${this.appConfigService.getConfig().rest['wfnews']}/publicPublishedIncident?pageNumber=${pageNum}&pageRowCount=${rowCount}&fireOfNote=${fireOfNote}&out=${out}&orderBy=${orderBy}`;
    return this.httpClient.get(url, { headers: { apikey: this.appConfigService.getConfig().application['wfnewsApiKey']} })
  }

  // published incident guid, WF Incident Guid, WF year and incident sequence number?
  public fetchPublishedIncident (guid: string): Observable<any> {
    const url = `${this.appConfigService.getConfig().rest['wfnews']}/publicPublishedIncident/${guid}`;
    return this.httpClient.get(url, { headers: { apikey: this.appConfigService.getConfig().application['wfnewsApiKey']} })
  }

  public fetchIMIncident(fireYear: string, incidentNumber: string): Observable<any> {
    const url = `${this.appConfigService.getConfig().rest['incidents']}/incidents/${fireYear}/${incidentNumber}`

    return this.httpClient.get(url, { headers: { Authorization: `bearer ${this.tokenService.getOauthToken()}`} })
    .pipe(
      map((response:any) => {
        return {response: response, wildfireIncidentGuid: response.wildfireIncidentGuid};
      })
    )
    .pipe(
      concatMap((data) => {
        const publishedUrl = `${this.appConfigService.getConfig().rest['incidents']}/publishedIncidents/byIncident/${data.wildfireIncidentGuid}`;
        return of({response: data.response, getPublishedIncident: this.httpClient.get(publishedUrl, { headers: { 'Content-Type': 'application/json', Authorization: `bearer ${this.tokenService.getOauthToken()}`}})});
      })
    );
  }

  public saveIMPublishedIncident (publishedIncident: any): Observable<any> {
    let publishedUrl = `${this.appConfigService.getConfig().rest['incidents']}/publishedIncidents`
    const headers = {
      headers: {
        Authorization: `bearer ${this.tokenService.getOauthToken()}`,
        apikey: this.appConfigService.getConfig().application['wfnewsApiKey']
      }
    }

    if (publishedIncident.publishedIncidentDetailGuid) {
      return this.httpClient.put(publishedUrl + `/${publishedIncident.publishedIncidentDetailGuid}`, publishedIncident, headers)
    } else {
      return this.httpClient.post(publishedUrl, publishedIncident, headers)
    }
  }

  public fetchPublishedIncidentAttachments (incidentName): Observable<any> {
    let url  = `${this.appConfigService.getConfig().rest['wfnews']}/publicPublishedIncidentAttachment/${incidentName}/attachments`;
    return this.httpClient.get(url, { headers: { apikey: this.appConfigService.getConfig().application['wfnewsApiKey']} });
  }

  public fetchExternalUri (incidentNumber): Observable<any> {
    let url  = `${this.appConfigService.getConfig().rest['wfnews']}/publicExternalUri?sourceObjectUniqueId=${incidentNumber}&pageNumber=1&pageRowCount=100`;
    return this.httpClient.get(url, { headers: { apikey: this.appConfigService.getConfig().application['wfnewsApiKey']} });
  }

  public fetchAttachments (incidentNumber): Observable<any> {
    let url  = `${this.appConfigService.getConfig().rest['wfnews']}/publicPublishedIncidentAttachment/${incidentNumber}/attachments`;
    return this.httpClient.get(url, { headers: { apikey: this.appConfigService.getConfig().application['wfnewsApiKey']} });
  }

  public fetchAttachmentBytes (incidentNumber, attachmentGuid): Observable<any> {
    let url  = `${this.appConfigService.getConfig().rest['wfnews']}/publicPublishedIncidentAttachment/${incidentNumber}/attachments/${attachmentGuid}/bytes`;
    return this.httpClient.get(url, { headers: { apikey: this.appConfigService.getConfig().application['wfnewsApiKey']} });
  }
}
