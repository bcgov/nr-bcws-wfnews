import { HttpClient, HttpEvent, HttpRequest } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { AppConfigService, TokenService } from "@wf1/core-ui";
import { Observable } from "rxjs/internal/Observable";

@Injectable({
    providedIn: 'root'
})
export class ReportOfFireService {
    rofUrl: string;

    constructor(private appConfigService: AppConfigService, private tokenService: TokenService, private httpClient: HttpClient) {  }

    public saveReportOfFire (reportOfFire: any, image1: any, image2: any, image3: any): Observable<any> {

        let rofUrl = this.appConfigService.getConfig().rest['fire-report-api']

        const formData = new FormData()
        formData.append('resource', new Blob([JSON.stringify(reportOfFire)], {type: 'application/json'}))
        if (image1 != null) formData.append('image1', image1)
        if (image2 != null) formData.append('image2', image2)
        if (image3 != null) formData.append('image3', image3)

        let req = this.httpClient.request(new HttpRequest('POST', rofUrl, formData, {
            reportProgress: true,
            responseType: 'json',
        } ) )

        return req;
      }
}