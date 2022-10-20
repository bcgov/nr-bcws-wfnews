import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { AppConfigService } from "@wf1/core-ui";
import { Observable } from 'rxjs';

@Injectable({
    providedIn: 'root'
})
export class PublishedIncidentService {
  constructor(private appConfigService: AppConfigService, private httpClient: HttpClient) {
  }

  fetchPublishedIncidents (pageNum: number = 0, rowCount: number = 9999, fireOfNote = false, out = false, orderBy: string = 'lastUpdatedTimestamp%20DESC'): Observable<any> {
    const url = `${this.appConfigService.getConfig().rest['wfnews']}/publicPublishedIncident?pageNumber=${pageNum}&pageRowCount=${rowCount}&fireOfNote=${fireOfNote}&out=${out}&orderBy=${orderBy}`;
    return this.httpClient.get(url)
  }

  // published incident guid, WF Incident Guid, WF year and incident sequence number?
  fetchPublishedIncident (guid: string): Observable<any> {
    const url = `${this.appConfigService.getConfig().rest['wfnews']}/publicPublishedIncident/${guid}`;
    return this.httpClient.get(url)
  }
}
