import { Injectable } from '@angular/core';
import { GalleryPhoto, Photo } from '@capacitor/camera';
import { AppConfigService } from '@wf1/core-ui';
import { CommonUtilityService } from './common-utility.service';
import { App } from '@capacitor/app';
import ExifReader from 'exifreader';
import * as P from 'piexifjs';
import { Filesystem } from '@capacitor/filesystem';
import { LocalStorageService } from './local-storage-service';

export interface ReportOfFireType {
  fullName?: string;
  phoneNumber?: string;
  consentToCall?: boolean;
  estimatedDistance?: number;
  fireLocation?: number[];
  deviceLocation?: number[];
  fireSize?: string;
  rateOfSpread?: string;
  burning?: string[];
  smokeColor?: string[];
  weather?: string[];
  assetsAtRisk?: string[];
  signsOfResponse?: string[];
  otherInfo?: string;
  submittedTimestamp?: string;
  visibleFlame?: string[];
  submissionID?: string;
  image1?: Photo | GalleryPhoto;
  image2?: Photo | GalleryPhoto;
  image3?: Photo | GalleryPhoto;
}

@Injectable({
  providedIn: 'root',
})
export class ReportOfFireService {
  submittedOffline: boolean;
  longitude: number;
  latitude: number;
  formData: FormData

  constructor(
    private appConfigService: AppConfigService,
    private commonUtilityService: CommonUtilityService,
    private storageService: LocalStorageService
  ) { }

  async saveReportOfFire(
    reportOfFire: ReportOfFireType,
    image1: Photo | GalleryPhoto,
    image2: Photo | GalleryPhoto,
    image3: Photo | GalleryPhoto,
  ): Promise<any> {
    const rofUrl = this.appConfigService.getConfig().rest['fire-report-api'];
    const resource = JSON.stringify(reportOfFire);
    if (this.commonUtilityService.hasSQLKeywords(resource)) {
      console.error("JSON blob contains SQL keywords. Potential SQL injection attempt.");
      return;
    }
    // if the device's location is not populated use the fire location to set image GPS coordinates
    if (reportOfFire?.deviceLocation) {
      this.latitude = reportOfFire.deviceLocation[0];
      this.longitude = reportOfFire.deviceLocation[1];
    } else if (reportOfFire?.fireLocation) {
      this.latitude = reportOfFire.fireLocation[0];
      this.longitude = reportOfFire.fireLocation[1];
    }

    try {
      const formData = new FormData();
      formData.append('resource', resource);

      if (image1) {
        formData.append('image1', await this.convertToBase64(image1));
      }
      if (image2) {
        formData.append('image2', await this.convertToBase64(image2));
      }
      if (image3) {
        formData.append('image3', await this.convertToBase64(image3));
      }
      this.formData = formData
      // if the device is offline save RoF in storage
      try {
        await this.commonUtilityService.checkOnlineStatus().then(async (result) => {
          const self = this;
          if (!result) {
            await this.submitToStorage(formData);
            self.submittedOffline = true;
          }
        });
      } catch (error) {
        console.error('Error checking online status for ROF submission', error);
      }

      if (this.submittedOffline) {
        return;
      }

      let storedOfflineReportData;
      try {
        storedOfflineReportData = this.storageService.removeData('offlineReportData');
      } catch (error) {
        console.error('An error occurred while retrieving offlineReportData:', error);
      }
      if (storedOfflineReportData) {
        // in case the device back online right after user store the report into ionic, 
        // should always check to avoid submit the duplicate one
        const offlineReport = JSON.parse(storedOfflineReportData);
        if (offlineReport.resource) {
          const offlineResource = JSON.parse(offlineReport.resource);
          if (offlineResource === resource) {
            try {
              this.storageService.removeData('offlineReportData');
            } catch (error) {
              console.error('An error occurred while removing offlineReportData:', error);
            }
          }
        }
      }

      const response = await fetch(rofUrl, {
        method: 'POST',
        body: formData,
      });
      if (response.ok || response.status == 200) {
        // The server successfully processed the report
        return { success: true, message: 'Report submitted successfully' };
      } else {
        // submit to storage if there is an issue
        if (this.formData) await this.submitToStorage(this.formData)
        // The server encountered an error
        return { success: false, message: JSON.stringify(response) };
      }
    } catch (error) {
      // submit to storage if there is an error
      if (this.formData) await this.submitToStorage(this.formData)
      // An error occurred during the HTTP request
      return {
        success: false,
        message: 'An error occurred while submitting the report',
      };
    }
  }

  async blobToBase64(url): Promise<string> {
    return new Promise(async (resolve, _) => {
      // do a request to the blob uri
      const response = await fetch(url);

      // response has a method called .blob() to get the blob file
      const blob = await response.blob();

      // instantiate a file reader
      const fileReader = new FileReader();

      // read the file
      fileReader.readAsDataURL(blob);

      fileReader.onloadend = () => {
        resolve(fileReader.result as string); // Here is the base64 string
      };
    });
  }

  async convertToBase64(image: Photo | GalleryPhoto) {
    let base64;
    let content;
    let mimeType;
    try {
      if (image.path) {
        // read binary data (base64 encoded) from plugins that return File URIs, such as
        // the Camera.
        const contents = await Filesystem.readFile({
          path: image.path,
        }).then(result => {
          content = result.data;
        })

        // Filesystem.readFile returns just the content of the base64 string. Detect mimeType from content
        const identifier = content.charAt(0)
        switch (identifier) {
          case '/':
            mimeType = 'jpg';
            break;
          case 'i':
            mimeType = 'png';
            break;
          case 'R':
            mimeType = 'gif';
            break;
          case 'U':
            mimeType = 'webp';
            break;
          default:
            mimeType = 'jpg';
            break;
        }

        base64 = 'data:image/' + mimeType + ';base64,' + content;
      }

      // if the webPath is already a base64 string, return it
      else if (image?.webPath?.startsWith('data:image')) {
        base64 = image.webPath;
      }
      // if it does not have base64 string convert it to one
      else if (image.webPath) {
        await this.blobToBase64(image.webPath).then((result) => {
          base64 = result;
        });
      }
      // if it does not have a webPath return the dataUrl which should be a base64 string
      else {
        image = image as Photo;
        if (image.dataUrl) {
          base64 = image.dataUrl;
        }
      }

      // if not a JPG, metadata will be checked in notifications api and lat/long will be added if not present.
      if (base64?.startsWith('data:image/jpeg')) {
        await this.checkExifGPS(base64).then((response) => {
          base64 = response;
        });
      }
    } catch (error) {
      console.error('Error converting image to base64 string', error);
    }

    return base64;
  }

  async submitOfflineReportToServer(offlineReport?): Promise<any> {
    // retrieve the offline RoF from the device's storage and convert to FormData for submission
    // images will already to converted to base64 string from initial submission
    const rofUrl = this.appConfigService.getConfig().rest['fire-report-api'];
    const rofJson = JSON.parse(offlineReport);
    const resource = rofJson.resource;
    const image1 = rofJson.image1;
    const image2 = rofJson.image2;
    const image3 = rofJson.image3;

    const formData = new FormData();
    if (resource) {
      formData.append('resource', resource);
    }

    if (image1) {
      formData.append('image1', image1);
    }
    if (image2) {
      formData.append('image2', image2);
    }
    if (image3) {
      formData.append('image3', image3);
    }

    try {
      // Make an HTTP POST request to your server's API endpoint
      const response = await fetch(rofUrl, {
        method: 'POST',
        body: formData,
      });

      if (response.ok || response.status == 200) {
        // Remove the locally stored data if sync is successful
        this.storageService.removeData('offlineReportData');
        App.removeAllListeners();
        // The server successfully processed the report
        return { success: true, message: 'Report submitted successfully' };
      } else {
        // The server encountered an error
        return { success: false, message: JSON.stringify(response) };
      }
    } catch (error) {
      // An error occurred during the HTTP request
      return {
        success: false,
        message: 'An error occurred while submitting the report',
      };
    }
  }

  async submitToStorage(formData: FormData) {
    const object = {};
    formData.forEach((value, key) => (object[key] = value));
    const json = JSON.stringify(object);
    const data = this.storageService.getData('offlineReportData')
    if (data == json) {
      return;
    } else this.storageService.saveData('offlineReportData', json);
  }

  // could not seem to get this to work for non-JPEG, those will be handled in notifications api.
  async checkExifGPS(base64: string) {
    try {
      const tags = await ExifReader.load(base64);
      // if the base64 string already has GPS metadata return it
      if (tags && tags.GPSLongitude && tags.GPSLatitude) {
        return base64;
      } else {
        // add GPS metadata if not present
        const gps = {};
        gps[P.GPSIFD.GPSLatitudeRef] = this.latitude < 0 ? 'S' : 'N';
        gps[P.GPSIFD.GPSLatitude] = P.GPSHelper.degToDmsRational(this.latitude);
        gps[P.GPSIFD.GPSLongitudeRef] = this.longitude < 0 ? 'W' : 'E';
        gps[P.GPSIFD.GPSLongitude] = P.GPSHelper.degToDmsRational(
          this.longitude,
        );
        const exifObj = { GPS: gps };
        const exifbytes = P.dump(exifObj);
        const exifModified = P.insert(exifbytes, base64);
        return exifModified;
      }
    } catch (err) {
      console.error('Error checking exif: ' + err);
    }
  }

  async syncDataWithServer() {
    let dataSynced = false;
    let submissionID = null;
    let duplicateStored = false;
    let submissionIdList = null;
    let offlineReport = null;

    try {
      // Fetch and submit locally stored data
      offlineReport = this.storageService.getData('offlineReportData')
      submissionIdList = this.storageService.getData('submissionIDList')

      if (offlineReport) {
        // Check for duplicate, reject if submissionID has already been stored
        const offlineJson = JSON.parse(offlineReport)
        if (offlineJson?.resource) {
          const resourceJson = JSON.parse(offlineJson.resource)
          submissionID = resourceJson?.submissionID
          if (submissionID && submissionIdList?.includes(submissionID)) {
            duplicateStored = true;
          }
        }

        // Reject duplicate if submissionID has already been stored
        if (duplicateStored) return true;

        // Send the report to the server
        const response =
          await this.submitOfflineReportToServer(offlineReport).then(async response => {
            if (response.success) {
              dataSynced = true;
              // Remove the locally stored data if sync is successful
              this.storageService.removeData('offlineReportData');
              const rof = this.storageService.getData('offlineReportData')
              console.log('rof: ' + rof)
              // store submissionID for duplicate check 
              if (submissionID) {
                submissionIdList = submissionIdList ? submissionIdList + ", " + submissionID : submissionID;
                this.storageService.saveData('submissionIDList', submissionIdList)
              }
              App.removeAllListeners();
            }
          });
      }
    } catch (error) {
      console.error('Sync failed:', error);
    }
    return dataSynced;
  }

}