/**
 * Model for the RoF object. This is matched against the model used in Notifications API,
 * Which we will be submitting to
 */
export class ReportOfFire {
  public consentToCall: boolean = false;
  public fullName: string = '';
  public phoneNumber: string = '';
  public estimatedDistance: number = 0;
  public fireLocation: Array<number> = [0, 0];
  public fireSize: string = '';
  public rateOfSpread: string = '';
  public visibleFlame: string = '';
  public burning: Array<string> = [];
  public smokeColor: Array<string> = [];
  public weather: Array<string> = [];
  public assetsAtRisk: Array<string> = [];
  public signsOfResponse: Array<string> = [];
  public otherInfo: string = '';
  // image placeholder. Base64 strings or perhaps stored via capacitor before submit?
  public image1: any;
  public image2: any;
  public image3: any;
  public fireDirection: number = 0;
}
