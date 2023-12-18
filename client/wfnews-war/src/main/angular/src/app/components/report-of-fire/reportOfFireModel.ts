import { GalleryPhoto, Photo } from '@capacitor/camera';

/**
 * Model for the RoF object. This is matched against the model used in Notifications API,
 * Which we will be submitting to
 */
export class ReportOfFire {
  public consentToCall = 'No';
  public fullName = '';
  public phoneNumber = '';
  public estimatedDistance = 0;
  public fireLocation: Array<number> = [0, 0];
  public fireSize = '';
  public rateOfSpread = '';
  public visibleFlame = '';
  public burning: Array<string> = [];
  public smokeColor: Array<string> = [];
  public weather: Array<string> = [];
  public ifAssetsAtRisk = '';
  public assetsAtRisk: Array<string> = [];
  public ifSignsOfResponse = '';
  public signsOfResponse: Array<string> = [];
  public otherInfo = '';
  // image placeholder. Base64 strings or perhaps stored via capacitor before submit?
  public image1: Photo | GalleryPhoto;
  public image2: Photo | GalleryPhoto;
  public image3: Photo | GalleryPhoto;
  public currentLocation: Array<number> = [0, 0];
  public compassHeading = 0;
  public headingDetectionActive: boolean;
  public motionSensor: string;
  public deviceLocation: Array<number> = [0, 0];
}
