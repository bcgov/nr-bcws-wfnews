import { Injectable } from '@angular/core';
import { GalleryPhoto, Photo } from '@capacitor/camera';
import { AppConfigService } from '@wf1/core-ui';
import { CommonUtilityService } from './common-utility.service';
import { Storage } from '@ionic/storage-angular';
import { App } from '@capacitor/app';
import ExifReader from 'exifreader';
import * as P from 'piexifjs';
import { Filesystem } from '@capacitor/filesystem';

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
  image1?: Photo | GalleryPhoto;
  image2?: Photo | GalleryPhoto;
  image3?: Photo | GalleryPhoto;
}

@Injectable({
  providedIn: 'root',
})
export class ReportOfFireService {
  constructor(
    private appConfigService: AppConfigService,
    private commonUtilityService: CommonUtilityService,
    private storage: Storage,
  ) {}

  submittedOffline: boolean;
  longitude: number;
  latitude: number;

  async saveReportOfFire(
    reportOfFire: ReportOfFireType,
    image1: Photo | GalleryPhoto,
    image2: Photo | GalleryPhoto,
    image3: Photo | GalleryPhoto,
  ): Promise<any> {
    const rofUrl = this.appConfigService.getConfig().rest['fire-report-api'];
    const resource = JSON.stringify(reportOfFire);

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

      // if the device is offline save RoF in storage
      try {
        await this.commonUtilityService.checkOnlineStatus().then((result) => {
          const self = this;
          if (!result) {
            this.submitToStorage(formData);
            self.submittedOffline = true;
          }
        });
      } catch (error) {
        console.error('Error checking online status for ROF submission', error);
      }

      if (this.submittedOffline) {
return;
}

      const response = await fetch(rofUrl, {
        method: 'POST',
        body: formData,
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
      return {
        success: false,
        message: 'An error occurred while submitting the report',
      };
    }
  }

  async blobToBase64(url): Promise<string> {
    try {
      return new Promise(async (resolve, _) => {
        // do a request to the blob uri
        const response = await fetch(url);

        // response has a method called .blob() to get the blob file
        const blob = await response.blob();

        // instantiate a file reader
        const fileReader = new FileReader();

        // read the file
        fileReader.readAsDataURL(blob);

        fileReader.onloadend = function() {
          resolve(fileReader.result as string); // Here is the base64 string
        };
      });
    } catch (error) {
      console.error('Error converting Blob to base64 string', error);
    }
  }

  async convertToBase64(image: Photo | GalleryPhoto) {
    let base64;
    try {
      if (image.path) {
        // read binary data (base64 encoded) from plugins that return File URIs, such as
        // the Camera.
        const contents = await Filesystem.readFile({
          path: image.path,
        });

        base64 = image.path;
      }

      // if the webPath is already a base64 string, return it
      if (image.webPath && image.webPath.startsWith('data:image')) {
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
      if (base64 && base64.startsWith('data:image/jpeg')) {
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
    // retrive the offline RoF from the device's storage and convert to FormData for submission
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

      if (response.ok) {
        // Remove the locally stored data if sync is successful
        await this.storage.create();
        await this.storage.remove('offlineReportData');
        App.removeAllListeners();
        // The server successfully processed the report
        return { success: true, message: 'Report submitted successfully' };
      } else {
        // The server encountered an error
        const responseData = await response.json();
        return { success: false, message: responseData.error };
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
    this.storage.create();
    const object = {};
    formData.forEach((value, key) => (object[key] = value));
    const json = JSON.stringify(object);
    await this.storage.set('offlineReportData', json);
  }

  // could not seem to get this to work for non-JPEG, those will be handled in notifications api.
  async checkExifGPS(base64: string) {
    try {
      const tags = await ExifReader.load(base64);
      // if the base64 string already has GPS metadata return it
      if (tags && tags.GPSLongitude && tags.GPSLatitude) {
        return base64;
      } // add GPS metadata if not present
      else {
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
}
