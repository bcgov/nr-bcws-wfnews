import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { AppConfigService } from '@wf1/core-ui';
import { Observable } from 'rxjs';

export const UPLOAD_DIRECTORY = '/WFIM/uploads';

@Injectable({
    providedIn: 'root'
})
export class PublishedIncidentService {
  private wfnewsUrl: string;

  constructor(private appConfigService: AppConfigService, private httpClient: HttpClient) {
    this.appConfigService.loadAppConfig().then(() => {
      this.wfnewsUrl = this.appConfigService.getConfig().rest['wfnews'];
    });
  }
  /*
  We'll likely need to include Fetches for:
  - Incidents paged, with filters by WF year, active/out
  - Statistical queries (match our AGOL queries)
  - Spatial Query (include bbox, point and radius)
  */

  fetchPublishedIncidents(pageNum: number = 0, rowCount: number = 9999): Observable<any> {
    const url = `${this.wfnewsUrl}/publicPublishedIncident?pageNumber=${pageNum}&pageRowCount=${rowCount}`;
    return this.httpClient.get(url);
  }

  // published incident guid, WF Incident Guid, WF year and incident sequence number?
  fetchPublishedIncident(guid: string): Observable<any> {
    const url = `${this.wfnewsUrl}/publicPublishedIncident/${guid}`;
    return this.httpClient.get(url);
  }
}
