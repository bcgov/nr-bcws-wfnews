import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { AppConfigService, TokenService } from "@wf1/core-ui";
import { Observable } from "rxjs"

@Injectable({
    providedIn: 'root'
})
export class ReportOfFireService {

constructor(private appConfigService: AppConfigService, private tokenService: TokenService, private httpClient: HttpClient) {  }

public saveReportOfFire (reportOfFire: any): Observable<any> {
    let rofUrl = `https://wfone-notifications-api.dev.bcwildfireservices.com/rof`
    const headers = {
      headers: {
        Authorization: `bearer ${this.tokenService.getOauthToken()}`
      }
    }        
      return this.httpClient.post(rofUrl, reportOfFire, headers)
    }
}
    