import { Injectable } from '@angular/core';
import { GalleryPhoto, Photo } from '@capacitor/camera';
import { Filesystem } from '@capacitor/filesystem';
import { AppConfigService } from '@wf1/core-ui';
import ExifReader from 'exifreader';
import * as P from 'piexifjs';
import { LocalStorageService } from './local-storage-service';
import { OfflineReport, OfflineReportQueueService } from './offline-report-queue.service';
import { ConnectivityService } from '@app/services/connectivity.service';
import { NativeReportSenderService, OFFLINE_REPORT_MAX_AGE_MS } from './native-report-sender.service';

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
  longitude: number;
  latitude: number;
  isSyncing: boolean = false;

  constructor(
    private appConfigService: AppConfigService,
    private connectivityService: ConnectivityService,
    private offlineReportQueue: OfflineReportQueueService,
    private localStorageService: LocalStorageService,
    private nativeReportSender: NativeReportSenderService,
  ) { }

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

    // A queue write error is not caught here: the caller must know the report is not saved.
    let online = true;
    try {
      online = await this.connectivityService.checkOnlineStatus();
    } catch (error) {
      console.error('Error checking online status for ROF submission', error);
    }
    if (!online) {
      await this.submitToStorage(formData);
      return;
    }

    let response: Response;
    try {
      response = await fetch(rofUrl, {
        method: 'POST',
        body: formData,
      });
    } catch (error) {
      console.error(error);
      await this.submitToStorage(formData);
      return {
        success: false,
        message: 'An error occurred while submitting the report',
      };
    }

    if (response.ok) {
      // A retry of a queued report must not be sent again by Sync.
      if (reportOfFire?.submissionID) {
        await this.offlineReportQueue
          .remove(reportOfFire.submissionID)
          .catch((error) => console.error('Error removing sent report from the queue', error));
        await this.nativeReportSender.cancel(reportOfFire.submissionID);
      }
      return { success: true, message: 'Report submitted successfully' };
    }

    await this.submitToStorage(formData);
    return { success: false, message: JSON.stringify(response) };
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
        const file = await Filesystem.readFile({
          path: image.path,
        });
        content = file.data;

        // Filesystem.readFile returns just the content of the base64 string. Detect mimeType from content
        const identifier = content.charAt(0);
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
        base64 = await this.blobToBase64(image.webPath);
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
        base64 = await this.checkExifGPS(base64);
      }
    } catch (error) {
      console.error('Error converting image to base64 string', error);
    }

    return base64;
  }

  async submitOfflineReportToServer(offlineReport: OfflineReport): Promise<any> {
    // The photos are already base64 text from the first submit.
    const rofUrl = this.appConfigService.getConfig().rest['fire-report-api'];
    const formData = new FormData();
    if (offlineReport.resource) {
      formData.append('resource', offlineReport.resource);
    }
    if (offlineReport.image1) {
      formData.append('image1', offlineReport.image1);
    }
    if (offlineReport.image2) {
      formData.append('image2', offlineReport.image2);
    }
    if (offlineReport.image3) {
      formData.append('image3', offlineReport.image3);
    }

    try {
      const response = await fetch(rofUrl, {
        method: 'POST',
        body: formData,
      });

      if (response.ok) {
        return { success: true, message: 'Report submitted successfully' };
      } else {
        return { success: false, message: JSON.stringify(response) };
      }
    } catch (error) {
      return {
        success: false,
        message: 'An error occurred while submitting the report',
      };
    }
  }

  async submitToStorage(formData: FormData) {
    const fields: Record<string, string> = {};
    formData.forEach((value, key) => (fields[key] = value as string));
    const resource = fields.resource ? JSON.parse(fields.resource) : {};
    const queuedTimestamp = Date.now();
    const item: OfflineReport = {
      submissionID: resource.submissionID || `local-${queuedTimestamp}`,
      queuedTimestamp,
      syncAttempts: 0,
      resource: fields.resource,
      image1: fields.image1,
      image2: fields.image2,
      image3: fields.image3,
    };
    await this.offlineReportQueue.add(item);
    await this.nativeReportSender.enqueue(item, submittedTimestampOf(item));
  }

  // The native uploader sent these with the app closed. Record them first, so a failed
  // remove still leaves Sync a reason to skip them.
  async removeNativeSent(): Promise<void> {
    const sent = await this.nativeReportSender.takeSent();
    if (!sent.length) {
      return;
    }
    const sentIds = this.getSentSubmissionIds();
    sentIds.push(...sent.filter((id) => !sentIds.includes(id)));
    this.localStorageService.saveData(SENT_SUBMISSION_IDS_KEY, JSON.stringify(sentIds));
    for (const id of sent) {
      await this.offlineReportQueue.remove(id);
    }
  }

  // Covers a report queued before the native uploader, or one whose native copy is gone.
  async handQueueToNative(): Promise<void> {
    const pending = await this.nativeReportSender.pending();
    for (const item of await this.offlineReportQueue.list()) {
      if (!pending.includes(item.submissionID)) {
        await this.nativeReportSender.enqueue(item, submittedTimestampOf(item));
      }
    }
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

  async syncDataWithServer(): Promise<void> {
    if (this.isSyncing) {
      return;
    }

    this.isSyncing = true;

    try {
      const queue = await this.offlineReportQueue.list();
      const sentIds = this.getSentSubmissionIds();

      for (const item of queue) {
        if (sentIds.includes(item.submissionID)) {
          await this.offlineReportQueue.remove(item.submissionID);
          await this.nativeReportSender.cancel(item.submissionID);
          continue;
        }

        const submitResponse = await this.submitOfflineReportToServer(item);
        if (submitResponse.success) {
          await this.offlineReportQueue.remove(item.submissionID);
          await this.nativeReportSender.cancel(item.submissionID);
          sentIds.push(item.submissionID);
          this.localStorageService.saveData(SENT_SUBMISSION_IDS_KEY, JSON.stringify(sentIds));
        } else {
          await this.offlineReportQueue.markAttempt(item.submissionID);
        }
      }
    } catch (error) {
      console.error('Sync failed:', error);
    } finally {
      this.isSyncing = false;
    }
  }

  async removeInvalidOfflineRoF() {
    try {
      const queue = await this.offlineReportQueue.list();
      for (const item of queue) {
        const submitted = submittedTimestampOf(item);
        if (this.invalidTimestamp(String(submitted))) {
          await this.offlineReportQueue.remove(item.submissionID);
          await this.nativeReportSender.cancel(item.submissionID);
        }
      }
    } catch (error) {
      console.error('Error removing invalid RoF data:', error);
    }
  }

  // Before the queue this was a comma-separated string, and includes() matched part of an ID.
  private getSentSubmissionIds(): string[] {
    const stored = this.localStorageService.getData(SENT_SUBMISSION_IDS_KEY);
    if (!stored) {
      return [];
    }
    try {
      const parsed = JSON.parse(stored);
      if (Array.isArray(parsed)) {
        return parsed;
      }
    } catch {
      // The old comma-separated form.
    }
    return stored.split(',').map((id) => id.trim()).filter((id) => id);
  }

  invalidTimestamp(timestamp: string): boolean {
    // check if submitted timestamp is more than 24 hours ago
    const now = new Date().getTime();
    const submittedTimestamp = Number(timestamp);
    return now - submittedTimestamp > OFFLINE_REPORT_MAX_AGE_MS;
  }
}

const SENT_SUBMISSION_IDS_KEY = 'submissionIDList';

function submittedTimestampOf(item: OfflineReport): number {
  try {
    const submitted = Number(JSON.parse(item.resource)?.submittedTimestamp);
    if (submitted) {
      return submitted;
    }
  } catch {
    // An unreadable resource falls back to the queue time.
  }
  return item.queuedTimestamp;
}
