import { HttpClient, HttpHeaders, HttpRequest, HttpResponse } from '@angular/common/http';
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
    return this.httpClient.get(url)
  }

  // published incident guid, WF Incident Guid, WF year and incident sequence number?
  public fetchPublishedIncident (guid: string): Observable<any> {
    const url = `${this.appConfigService.getConfig().rest['wfnews']}/publicPublishedIncident/${guid}`;
    return this.httpClient.get(url)
  }

  
  // public async fetchIMIncident (fireYear: string, incidentNumber: string): Promise<any> {
    
  //   const url = `${this.appConfigService.getConfig().rest['incidents']}/incidents/${fireYear}/${incidentNumber}`
  //   const incident = await this.httpClient.get(url, { headers: { Authorization: `bearer ${this.tokenService.getOauthToken()}`}, observe: "response" }).toPromise() as any
    
  //   const publishedUrl = `${this.appConfigService.getConfig().rest['incidents']}/publishedIncidents/byIncident/${incident.externalIdentifier}`
  //   const publishedIncident = await this.httpClient.get(publishedUrl, { headers: { Authorization: `bearer ${this.tokenService.getOauthToken()}`}, observe: "response" }).toPromise()
    
  //   return {
  //     incident,
  //     publishedIncident
  //   }
  // }

  // public fetchIMIncident2 (fireYear: string, incidentNumber: string) {
    
  //   const url = `${this.appConfigService.getConfig().rest['incidents']}/incidents/${fireYear}/${incidentNumber}`
  //   this.httpClient.get(url, { headers: { Authorization: `bearer ${this.tokenService.getOauthToken()}`} }).subscribe( (response) => {
  //     const publishedUrl = `${this.appConfigService.getConfig().rest['incidents']}/publishedIncidents/byIncident/${(response as any).externalIdentifier}`;
  //     this.httpClient.get(publishedUrl, { headers: { Authorization: `bearer ${this.tokenService.getOauthToken()}`}}).subscribe( 
  //       (response) => {
  //         debugger;
  //       },
  //       (error) => {
  //         debugger;
  //       },
  //     )
  //   })
  // }

  public fetchIMIncident(fireYear: string, incidentNumber: string): Observable<any> {
    
    const url = `${this.appConfigService.getConfig().rest['incidents']}/incidents/${fireYear}/${incidentNumber}`
    
    return this.httpClient.get(url, { headers: { Authorization: `bearer ${this.tokenService.getOauthToken()}`} })
    .pipe(
      map((response:any) => {
        return {response: response, externalIdentifier: response.externalIdentifier};
      })
    )
    .pipe(
      concatMap((data) => {
        debugger;
        const publishedUrl = `${this.appConfigService.getConfig().rest['incidents']}/publishedIncidents/byIncident/${data.response.wildfireIncidentGuid}`;
        return of({response: data.response, getPublishedIncident: this.httpClient.get(publishedUrl, { headers: { Authorization: `bearer ${this.tokenService.getOauthToken()}`}})});
      })
    );
  }

  public saveIMPublishedIncident (publishedIncident: any): Observable<any> {
    debugger;
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

  public fetchPublishedIncidentAttachments (incidentName): Observable<any> {
    let url  = `${this.appConfigService.getConfig().rest['wfnews']}/publicPublishedIncidentAttachment/${incidentName}/attachments`;
    return this.httpClient.get(url);
  }
}
