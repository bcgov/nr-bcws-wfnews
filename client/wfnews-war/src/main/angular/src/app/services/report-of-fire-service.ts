import { Injectable } from "@angular/core";
import { Photo } from "@capacitor/camera";
import { AppConfigService } from "@wf1/core-ui";
import { CommonUtilityService } from "./common-utility.service";
import { Storage } from '@ionic/storage-angular';
import { App } from '@capacitor/app';

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
    submittedTimestamp?: string
  };

@Injectable({
    providedIn: 'root'
})
export class ReportOfFireService {

    constructor(private appConfigService: AppConfigService,
      private commonUtilityService: CommonUtilityService,
      private storage: Storage) {  }
      
    submittedOffline: boolean

    async saveReportOfFire (reportOfFire: ReportOfFireType, image1: Photo, image2: Photo, image3: Photo): Promise<any> {

        let rofUrl = this.appConfigService.getConfig().rest['fire-report-api']
        let resource = JSON.stringify(reportOfFire)
        
        try {
          const formData = new FormData()
          formData.append('resource', resource)

          if (image1 !== null && image1 !== undefined && image1.webPath) formData.append('image1', await this.convertToBase64(image1))
          if (image2 !== null && image2 !== undefined && image2.webPath) formData.append('image2', await this.convertToBase64(image2))
          if (image3 !== null && image3 !== undefined && image3.webPath) formData.append('image3', await this.convertToBase64(image3))

          // if the device is offline save RoF in storage
          await (this.commonUtilityService.checkOnlineStatus().then(result => {
            let self = this
            if (!result){
              this.submitToStorage(formData)
              self.submittedOffline = true;
            ;
            }
          }));

          if (this.submittedOffline) return;
          
          let response = await fetch(rofUrl, {
              method: 'POST',
              body: formData
          });
          if (response.ok) {
            // The server successfully processed the report
            return { success: true, message: 'Report submitted successfully' };
          } else {
            // The server encountered an error
            const responseData = await response.json();
            return { success: false, message: responseData.error };
          }

        } catch (error) {
          // An error occurred during the HTTP request
          return { success: false, message: 'An error occurred while submitting the report' };
        }

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
          return image.webPath;
      }
      else {   
          let b64 = ""
          await this.blobToBase64(image.webPath).then(result => {
            b64 = result;
          })
          return b64;
      }
    }


    async submitOfflineReportToServer(offlineReport?): Promise<any>{

      // retrive the offline RoF from the device's storage and convert to FormData for submission
      // images will already to converted to base64 string from initial submission
      const rofUrl = this.appConfigService.getConfig().rest['fire-report-api']
      const rofJson = JSON.parse(offlineReport);
      const resource = rofJson.resource;
      const image1 = rofJson.image1;
      const image2 = rofJson.image2;
      const image3 = rofJson.image3;

      const formData = new FormData()
      if (resource) formData.append('resource', resource)

      if (image1) formData.append('image1', image1)
      if (image2) formData.append('image2', image2)
      if (image3) formData.append('image3', image3)

      try {
        // Make an HTTP POST request to your server's API endpoint
        let response = await fetch(rofUrl, {
          method: 'POST',
          body: formData
      })
    
      if (response.ok) {
          // Remove the locally stored data if sync is successful
          await this.storage.create();
          await this.storage.remove('offlineReportData');
          App.removeAllListeners();
           // The server successfully processed the report
         return { success: true, message: 'Report submitted successfully' };
         } else {
          // The server encountered an error
           const responseData = await response.json()
           return { success: false, message: responseData.error };
         }
      } catch (error) {
        // An error occurred during the HTTP request
        return { success: false, message: 'An error occurred while submitting the report' };
      }
    }

    async submitToStorage(formData: FormData) {
      this.storage.create();
      let object = {};
      formData.forEach((value, key) => object[key] = value);
      let json = JSON.stringify(object);
      await this.storage.set('offlineReportData', json);
    }
   
}