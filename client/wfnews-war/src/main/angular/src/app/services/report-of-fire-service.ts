import { Injectable } from "@angular/core";
import { Photo } from "@capacitor/camera";
import { AppConfigService } from "@wf1/core-ui";

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

    constructor(private appConfigService: AppConfigService) {  }

    async saveReportOfFire (reportOfFire: ReportOfFireType, image1: Photo, image2: Photo, image3: Photo): Promise<any> {

        let rofUrl = this.appConfigService.getConfig().rest['fire-report-api']
        let resource = JSON.stringify(reportOfFire)
        const formData = new FormData()
        formData.append('resource', resource)

        if (image1 !== null && image1 !== undefined && image1.webPath) formData.append('image1', await this.convertToBase64(image1))
        if (image2 !== null && image2 !== undefined && image2.webPath) formData.append('image2', await this.convertToBase64(image2))
        if (image3 !== null && image3 !== undefined && image3.webPath) formData.append('image3', await this.convertToBase64(image3))
        
        let response = await fetch(rofUrl, {
             method: 'POST',
             body: formData
         });

      }

    async blobToBase64 (url): Promise<string> {
      return new Promise(async (resolve, _) => {
        // do a request to the blob uri
        const response = await fetch(url);
      
        // response has a method called .blob() to get the blob file
        const blob = await response.blob();
      
        // instantiate a file reader
        const fileReader = new FileReader();
      
        // read the file
        fileReader.readAsDataURL(blob);
      
        fileReader.onloadend = function(){
          resolve(fileReader.result as string); // Here is the base64 string
        }
      });
    };
      

  async convertToBase64 (image: Photo){
      // if the webPath is already a base64 string, return it
      if (image.webPath !== null && image.webPath.startsWith("data:image")){
          console.log("webPath: " + image.webPath)
          return image.webPath;
      }
      else {   
          let b64 = ""
          await this.blobToBase64(image.webPath).then(result => {
            console.log("b64: " + result)
            b64 = result;
          })
          return b64;
      }
    }
   
}