import { Component, ChangeDetectionStrategy, AfterViewInit, ChangeDetectorRef } from "@angular/core";
import { RoFPage } from "../rofPage";
import { ReportOfFire } from "../reportOfFireModel";
import ConfigJson from '../report-of-fire.config.json';
import * as L from 'leaflet'
import { ReportOfFirePage } from "@app/components/report-of-fire/report-of-fire.component";
import { Storage } from '@ionic/storage-angular';
import { CommonUtilityService } from "@app/services/common-utility.service";
import { AppConfigService } from "@wf1/core-ui";
import { MatSnackBar } from "@angular/material/snack-bar";
import { ReportOfFireService, ReportOfFireType } from "@app/services/report-of-fire-service";
import { equalsIgnoreCase } from '../../../utils';
import offlineMapJson from '../../../../assets/maps/british-columbia.json'




@Component({
  selector: 'rof-review-page',
  templateUrl: './rof-review-page.component.html',
  styleUrls: ['./rof-review-page.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class RoFReviewPage extends RoFPage implements AfterViewInit{
  public reportOfFirePages: any;
  map: any;

  public constructor(
    private reportOfFirePage: ReportOfFirePage,
    private storage: Storage,
    private commonUtilityService : CommonUtilityService,
    private cdr: ChangeDetectorRef,
    private appConfigService: AppConfigService,
    private reportOfFireService: ReportOfFireService,
    protected snackbarService: MatSnackBar,
  ) {
    super()
  }

  ngAfterViewInit(): void {
    this.loadMap()
  }

  initialize (data: any, index: number, reportOfFire: ReportOfFire) {
    super.initialize(data, index, reportOfFire);
    this.reportOfFirePages = ConfigJson.pages
    const pagesToRemove = [
      'first-page',
      'permissions-page',
      'callback-page',
      'compass-page',
      'distance-page',
      'infrastructure-page',
      'response-page',
      'review-page',
      'final-page'
    ];
    this.reportOfFirePages = this.reportOfFirePages.filter(page => !pagesToRemove.includes(page.id));
    // this.ionViewDidEnter()
  }

  selectedAnswer(page:any) {
    switch(page.id){
      case 'contact-page' : 
        return this.reportOfFire.consentToCall ? this.reportOfFire.consentToCall.charAt(0).toUpperCase() + this.reportOfFire.consentToCall.slice(1) : null;
      case 'location-page' :
        return this.reportOfFire.fireLocation
      case 'photo-page' :
        return this.photoNumber()
      case 'smoke-color-page' :
        return this.reportOfFire.smokeColor? this.reportOfFire.smokeColor.map(item => this.findLabelByValue(page.id,item)).join(', ') : null;
      case 'fire-size-page' :
        return this.reportOfFire.fireSize ? this.findLabelByValue(page.id,this.reportOfFire.fireSize) : null;
      case 'response-details-page' :
        //make the first letter of a string uppercase
        return this.reportOfFire.ifSignsOfResponse ? this.reportOfFire.ifSignsOfResponse.charAt(0).toUpperCase() + this.reportOfFire.ifSignsOfResponse.slice(1) : null;
      case 'visible-flame-page' :
        return this.reportOfFire.visibleFlame ? this.reportOfFire.visibleFlame.charAt(0).toUpperCase() + this.reportOfFire.visibleFlame.slice(1) : null;
      case 'fire-spread-page' :
        return this.reportOfFire.rateOfSpread ? this.reportOfFire.rateOfSpread.charAt(0).toUpperCase() + this.reportOfFire.rateOfSpread.slice(1) : null;
      case 'what-is-burning-page' :
        return this.reportOfFire.burning? this.reportOfFire.burning.map(item => this.findLabelByValue(page.id,item)).join(', ') : null;
      case 'infrastructure-details-page' :
        return this.reportOfFire.ifAssetsAtRisk ? this.reportOfFire.ifAssetsAtRisk.charAt(0).toUpperCase() + this.reportOfFire.ifAssetsAtRisk.slice(1) : null;
      case 'comments-page' :
        return this.reportOfFire.otherInfo;
      default :
        return null;
    }
  }

  selectedAnswerPart2(page: any) {
    switch(page.id) {
      case 'contact-page' :
        let phoneNumber = ('' + this.reportOfFire.phoneNumber).replace(/\D/g, '');
        let match = phoneNumber.match(/^(\d{3})(\d{3})(\d{4})$/); 
        // reformate to phonenumber
        if (match) {
          return (this.reportOfFire.fullName) + '\n' + '(' + match[1] + ') ' + match[2] + '-' + match[3];
        }
      case 'response-details-page' :
        return this.reportOfFire.signsOfResponse? this.reportOfFire.signsOfResponse.map(item => this.findLabelByValue(page.id,item)).join(', ') : null;
      case 'infrastructure-details-page' :
        return this.reportOfFire.assetsAtRisk? this.reportOfFire.assetsAtRisk.map(item => this.findLabelByValue(page.id,item)).join(', ') : null;
    }
  }

  twoPartsQuestions(page:any) {
    if ((page.id === 'contact-page') && (this.reportOfFire.consentToCall === 'yes' ) ) {
      return true;
    }
    else if ((page.id === 'response-details-page') && (this.reportOfFire.ifSignsOfResponse === 'yes')){
      return true
    }
    else if ((page.id === 'infrastructure-details-page') && (this.reportOfFire.ifAssetsAtRisk === 'yes')){
      return true
    } 
    else {
      return false;
    }
  }

  photoNumber() {
    let photoNumber = 0;
    if (this.reportOfFire.image1) {
      photoNumber++;
    }
    if (this.reportOfFire.image2) {
      photoNumber++;
    }
    if (this.reportOfFire.image3) {
      photoNumber++;
    }
    if ( photoNumber === 0) {
      return 'Skipped'
    }
    else if ( photoNumber === 1) {
      return photoNumber + ' photo added'
    }
    else  {
      return photoNumber + ' photos added'
    }
  }

  loadMap() {
    if (this.map) {
      this.map.remove();
    }
    const location = this.reportOfFire.fireLocation;
    this.map = L.map('map', {
      attributionControl: false,
      zoomControl: false,
      dragging: false,
      doubleClickZoom: false,
      boxZoom: false,
      trackResize: false,
      scrollWheelZoom: false
    })

    // Calculate the bounding box
    if (this.reportOfFire.currentLocation && this.reportOfFire.fireLocation) {
      const bbox = L.latLngBounds(this.reportOfFire.currentLocation, this.reportOfFire.fireLocation);
      const zoomLevel = this.map.getBoundsZoom(bbox);
      this.map.setView(bbox.getCenter(), zoomLevel)
    }
    // Calculate the ideal zoom level to fit the bounding box within the map's view
    // configure map data
    L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
      zoom: 5,
      subdomains:['mt0','mt1','mt2','mt3']
    }).addTo(this.map);

    this.checkOnline().then((result) => {
      if(!result) {
        const geoJsonData = offlineMapJson
        L.geoJson(geoJsonData,{
          style:{
            color:"#6495ED",
            weight:8,
            fillColor:'',
            fillOpacity:0.00001
          },
          zoom:6,
          subdomains:['mt0','mt1','mt2','mt3']
        }).addTo(this.map)
      }
    })

    const fireLocationIcon = L.divIcon({
      html: '<i class="fireLocationIcon material-icons">location_searching</i>',
      iconSize: [48, 48],
      className: 'fireLocationIcon'
    })
    L.marker(location, {icon:fireLocationIcon}).addTo(this.map)

    L.marker( this.reportOfFire.currentLocation, {
      icon: L.divIcon( {
          className:  'rof-location',
          iconSize:   [ 20, 20 ],
          iconAnchor: [ 14, 14 ]
      } )
    }).addTo(this.map)
  }

  edit(pageId:string, secondStep?:boolean) {
    if((pageId === 'contact-page') && !secondStep) {
      this.reportOfFirePage.edit('callback-page')
    } 
    else if((pageId === 'response-details-page') && !secondStep) {
      this.reportOfFirePage.edit('response-page')
    }
    else if((pageId === 'infrastructure-details-page') && !secondStep) {
      this.reportOfFirePage.edit('infrastructure-page')
    }
    else {
      this.reportOfFirePage.edit(pageId)
    }
  }

  findLabelByValue(pageId: string, valueToFind: string) {
    if (pageId && valueToFind) {
      const page = this.reportOfFirePages.find(page => page.id === pageId);
      const button = page.buttons.find(button => button.value === valueToFind);
      if (button) {
        const label = button.label;
        return label
      }
    }
  }

  async submitReport() {
    if (!this.checkOnlineStatus) {
      await this.storage.set('offlineReportData', this.reportOfFire);
    }
  }

  ionViewDidEnter() {
    this.scheduleDataSync();
  }

  async scheduleDataSync() {
    await this.storage.create();
    //set to check connection every 10min
    const syncIntervalMinutes = this.appConfigService.getConfig().application['syncIntervalMinutes'].toString();
    setInterval(async() => {
      const isConnected = await this.checkOnlineStatus();
      if (isConnected) {
        await this.syncDataWithServer();
      }
    }, syncIntervalMinutes *60 * 1000);
  }

  async checkOnlineStatus() {
    try {
      await this.commonUtilityService.pingSerivce().toPromise();
      this.cdr.detectChanges();
      return true;
    } catch (error) {
      this.cdr.detectChanges();
      return false;
    }
  }

  async syncDataWithServer() {
    try {
      // Fetch and submit locally stored data
      const offlineReport = await this.storage.get('offlineReportData');

      if (offlineReport) {
        // Send the report to the server
        const response = await this.submitReportToServer(offlineReport);

        if (response.success) {
          // Remove the locally stored data if sync is successful
          await this.storage.remove('offlineReportData');
        }
      }
    } catch (error) {
      console.error('Sync failed:', error);
    }
  }

  async submitReportToServer(offlineReport?): Promise<any>{
    // this part is the task of WFNEWS-1419 which is under progress.
    // please ignore the following process as this will be replaced by real caller.
    const url = this.appConfigService.getConfig().rest['fire-report-api']
    try {
      // Make an HTTP POST request to your server's API endpoint
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(offlineReport),
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

submitRof(){
  const rofResource: ReportOfFireType = {
    fullName: this.nullEmptyStrings(this.reportOfFire.fullName),
    phoneNumber: this.nullEmptyStrings(this.reportOfFire.phoneNumber),
    consentToCall: equalsIgnoreCase(this.reportOfFire.consentToCall, "Yes") ? true : false,
    estimatedDistance: this.reportOfFire.estimatedDistance,
    fireLocation: this.reportOfFire.fireLocation,
    fireSize: this.nullEmptyStrings(this.reportOfFire.fireSize),
    rateOfSpread: equalsIgnoreCase(this.reportOfFire.rateOfSpread, "Yes") ? "Fast" : equalsIgnoreCase(this.reportOfFire.rateOfSpread, "No") ? "Slow" : "Unknown",
    burning: this.reportOfFire.burning,
    smokeColor: this.reportOfFire.smokeColor,
    weather: this.reportOfFire.weather,
    assetsAtRisk: this.reportOfFire.assetsAtRisk,
    signsOfResponse: this.reportOfFire.signsOfResponse,
    otherInfo: this.reportOfFire.otherInfo,
  }

  try {   
    const response = this.reportOfFireService.saveReportOfFire(rofResource, this.reportOfFire.image1, this.reportOfFire.image2, this.reportOfFire.image3);
    this.next();
  } catch (err) {
     this.snackbarService.open(
       'Failed to submit Report Of Fire: ' + JSON.stringify(err.message),
       'OK',
       { duration: 10000, panelClass: 'snackbar-error' }
     );
    
  } finally {
    this.cdr.detectChanges();
  }

}
  nullEmptyStrings(value: string) {
    return !value ? null : value;
  }

  async checkOnline() {
    try {
      await this.commonUtilityService.pingSerivce().toPromise();
      this.cdr.detectChanges();
      return true;
    } catch (error) {
      this.cdr.detectChanges();
      return false;
    }
  }


}

