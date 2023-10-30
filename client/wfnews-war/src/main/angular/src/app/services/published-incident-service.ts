import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { SituationReport } from '@app/components/wf-admin-panel/dashboard-panel/edit-dashboard.component';
import { LocationData } from '@app/components/wildfires-list-header/filter-by-location/filter-by-location-dialog.component';
import { AppConfigService, TokenService } from "@wf1/core-ui";
import { Observable, of } from 'rxjs';
import { concatMap, map } from 'rxjs/operators';

@Injectable({
    providedIn: 'root'
})
export class PublishedIncidentService {
  constructor(private appConfigService: AppConfigService, private tokenService: TokenService, private httpClient: HttpClient) {  }

  public async getActiveFireCount () : Promise<any> {
    const url = `${this.appConfigService.getConfig().rest['wfnews']}/publicPublishedIncident?pageNumber=1&pageRowCount=1&out=false&stageOfControlList=OUT_CNTRL&stageOfControlList=HOLDING&stageOfControlList=UNDR_CNTRL`;
    const result = await this.httpClient.get(url, { headers: { apikey: this.appConfigService.getConfig().application['wfnewsApiKey']} }).toPromise();

    return ((result as any).totalRowCount || 0)
  }

  public fetchOutIncidents (pageNum: number = 0, rowCount: number = 9999): Observable<any> {
    const url = `${this.appConfigService.getConfig().rest['wfnews']}/publicPublishedIncident?pageNumber=${pageNum}&pageRowCount=${rowCount}&stageOfControlList=OUT&newFires=false`
    return this.httpClient.get(url, { headers: { apikey: this.appConfigService.getConfig().application['wfnewsApiKey']} })
  }

  public fetchPublishedIncidents (pageNum: number = 0, rowCount: number = 9999, fireOfNote = false, out = false, orderBy: string = 'lastUpdatedTimestamp%20DESC'): Observable<any> {
    const url = out ? `${this.appConfigService.getConfig().rest['wfnews']}/publicPublishedIncident?pageNumber=${pageNum}&pageRowCount=${rowCount}&fireOfNote=${fireOfNote}&out=true` : `${this.appConfigService.getConfig().rest['wfnews']}/publicPublishedIncident?pageNumber=${pageNum}&pageRowCount=${rowCount}&fireOfNote=${fireOfNote}&out=false&orderBy=${orderBy}&stageOfControlList=OUT_CNTRL&stageOfControlList=HOLDING&stageOfControlList=UNDR_CNTRL`;
    return this.httpClient.get(url, { headers: { apikey: this.appConfigService.getConfig().application['wfnewsApiKey']} })
  }

  public fetchPublishedIncidentsList (pageNum: number = 0, rowCount: number = 10, location: LocationData | null = null, searchText: string | null = null, fireOfNote = false, stageOfControl: string[] = [], fireCentreCode: number | null = null, bbox: string | null = null, orderBy: string = 'lastUpdatedTimestamp%20DESC'): Observable<any> {
    let url = `${this.appConfigService.getConfig().rest['wfnews']}/publicPublishedIncident?pageNumber=${pageNum}&pageRowCount=${rowCount}&fireOfNote=${fireOfNote}&orderBy=${orderBy}`;

    if (searchText && searchText.length) {
      url += `&searchText=${searchText}`
    }

    if (stageOfControl && stageOfControl.length > 0) {
      for (const soc of stageOfControl) {
        url += `&stageOfControlList=${soc}`
      }
    }

    if (location && location.radius) {
      url += `&latitude=${location.latitude}`
      url += `&longitude=${location.longitude}`
      url += `&radius=${location.radius * 1000}`
    }

    if (fireCentreCode) {
      url += `&fireCentreCode=${fireCentreCode}`
    }

    if (bbox) {
      url += `&bbox=${bbox}`
    }

    return this.httpClient.get(url, { headers: { apikey: this.appConfigService.getConfig().application['wfnewsApiKey']} })
  }

  // published incident guid, WF Incident Guid, WF year and incident sequence number?
  public fetchPublishedIncident (guid: string, fireYear: string = null): Observable<any> {
    const url = `${this.appConfigService.getConfig().rest['wfnews']}/publicPublishedIncident/${guid}${fireYear ? '?fireYear=' + fireYear : ''}`;
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
        Authorization: `bearer ${this.tokenService.getOauthToken()}`
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

  public fetchExternalUriList (page: number = 1, rows: number = 10): Observable<any> {
    let url  = `${this.appConfigService.getConfig().rest['wfnews']}/publicExternalUri?pageNumber=${page}&pageRowCount=${rows}`;
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

  /********** Stats Data ***********/

  public fetchStatistics (fireYear: number, fireCentre: string = "BC"): Observable<any> {
    const url = `${this.appConfigService.getConfig().rest['wfnews']}/statistics?fireYear=${fireYear}${fireCentre ? ('&fireCentre=' + fireCentre) : ''}`
    return this.httpClient.get<any>(url, { headers: { apikey: this.appConfigService.getConfig().application['wfnewsApiKey']} })
  }

  /********** Situation Report ************/

  public fetchSituationReportList (pageNum: number = 0, rowCount: number = 9999, published = true, cacheBust = false): Observable<any> {
    const url = `${this.appConfigService.getConfig().rest['wfnews']}/publicSituationReport?pageNumber=${pageNum}&pageRowCount=${rowCount}&published=${published ? 'T' : 'F'}${cacheBust ? ('&cacheBust=' + new Date().getTime()) : ''}`
    return this.httpClient.get<SituationReport>(url, { headers: { apikey: this.appConfigService.getConfig().application['wfnewsApiKey']} })
  }

  public fetchSituationReport (reportGuid: string): Observable<SituationReport> {
    const url = `${this.appConfigService.getConfig().rest['wfnews']}/publicSituationReport/${reportGuid}`
    return this.httpClient.get<SituationReport>(url, { headers: { apikey: this.appConfigService.getConfig().application['wfnewsApiKey']} })
  }

  public updateSituationReport (report: SituationReport): Observable<SituationReport> {
    const url = `${this.appConfigService.getConfig().rest['wfnews']}/situationReport/${report.reportGuid}`
    const headers = {
      headers: {
        Authorization: `bearer ${this.tokenService.getOauthToken()}`
      }
    }
    return this.httpClient.put<SituationReport>(url, report, headers)
  }

  public createSituationReport (report: SituationReport): Observable<SituationReport> {
    const url = `${this.appConfigService.getConfig().rest['wfnews']}/situationReport`
    const headers = {
      headers: {
        Authorization: `bearer ${this.tokenService.getOauthToken()}`
      }
    }
    return this.httpClient.post<SituationReport>(url, report, headers)
  }

  public deleteSituationReport (report: SituationReport): Observable<SituationReport> {
    const url = `${this.appConfigService.getConfig().rest['wfnews']}/situationReport/${report.reportGuid}`
    const headers = {
      headers: {
        Authorization: `bearer ${this.tokenService.getOauthToken()}`
      }
    }
    return this.httpClient.delete<SituationReport>(url, headers)
  }
}
