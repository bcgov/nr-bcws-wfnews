import { HttpClient, HttpErrorResponse, HttpRequest, HttpResponse } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { Photo } from "@capacitor/camera";
import { AppConfigService } from "@wf1/core-ui";
import { Observable } from "rxjs/internal/Observable";

export type ReportOfFireType = {
    fullName?: string,
    phoneNumber?: string,
    consentToCall?: boolean,
    estimatedDistance?: number,
    fireLocation?: number[],
    fireSize?: string,
    rateOfSpread?: string,
    burning?: string[],
    smokeColor?: string[],
    weather?: string[],
    assetsAtRisk?: string[],
    signsOfResponse?: string[],
    otherInfo?: string,
  };

@Injectable({
    providedIn: 'root'
})
export class ReportOfFireService {
    rofUrl: string;

    constructor(private appConfigService: AppConfigService, private httpClient: HttpClient) {  }

    public saveReportOfFire (reportOfFire: ReportOfFireType, image1: Photo, image2: Photo, image3: Photo): Observable<any> {

        // let rofUrl = this.appConfigService.getConfig().rest['fire-report-api']
        let rofUrl = "https://wfone-notifications-api-int.bcwildfireservices.com/rof"
        console.log('rofUrl = ' + rofUrl)

        const formData = new FormData()
        formData.append('resource', new Blob([JSON.stringify(reportOfFire)], {type: 'application/json'}))
        if (image1 != null) formData.append('image1', new Blob([image1.webPath], {type: 'image/' + image1.webPath}))
        if (image2 != null) formData.append('image2', new Blob([image2.webPath], {type: 'image/' + image2.webPath})) 
        if (image3 != null) formData.append('image3', new Blob([image3.webPath], {type: 'image/' + image3.webPath})) 

        
        let req = this.httpClient.request(new HttpRequest('POST', rofUrl, formData, {
            reportProgress: true,
            responseType: 'json',
        } ) )
        
        console.log(req.constructor.name)
        req.subscribe(
        (ev) => {
        
            if ( ev instanceof HttpResponse ) {
              console.log('Successful RoF Submission: ' + ev.status)
            }
            else if ( ev instanceof HttpErrorResponse ) {
                console.error('Unsuccessful RoF Submission: ' + ev.status)
            } else console.warn('HttpResponse not returned for RoF' + ev.constructor.name)
        },
        (err) =>  console.error(err))

        return req;
      }
     
}