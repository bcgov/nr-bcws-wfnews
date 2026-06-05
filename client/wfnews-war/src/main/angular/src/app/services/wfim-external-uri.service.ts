import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { AppConfigService } from '@wf1/core-ui';
import { ExternalUriResource } from '@wf1/incidents-rest-api';

@Injectable({
  providedIn: 'root'
})
export class WfimExternalUriService {
  constructor(private http: HttpClient, private appConfig: AppConfigService) {}

  private get basePath(): string {
    return this.appConfig.getConfig().rest['incidents'];
  }

  public async getExternalUri(guid: string): Promise<any> {
    return this.http.get(`${this.basePath}/externalUri/${guid}`, { observe: 'response' }).toPromise();
  }

  public async deleteExternalUri(guid: string, etag?: string): Promise<void> {
    let headers = new HttpHeaders();
    if (etag) {
      headers = headers.set('If-Match', etag);
    }
    
    await this.http.delete(`${this.basePath}/externalUri/${guid}`, { headers }).toPromise();
  }

  public async updateExternalUri(guid: string, resource: ExternalUriResource): Promise<any> {
    // The WfimEtagInterceptor will automatically extract resource.etag and add the If-Match header
    return this.http.put(`${this.basePath}/externalUri/${guid}`, resource).toPromise();
  }

  public createExternalUri(resource: ExternalUriResource): Promise<any> {
    return this.http.post(`${this.basePath}/externalUri`, resource).toPromise();
  }

  public getExternalUriList(sourceObjectUniqueId: string, pageNumber: number = 1, pageRowCount: number = 100): Promise<any> {
    return this.http.get(`${this.basePath}/externalUri`, {
      params: {
        sourceObjectUniqueId: sourceObjectUniqueId,
        pageNumber: pageNumber.toString(),
        pageRowCount: pageRowCount.toString()
      }
    }).toPromise();
  }
}
