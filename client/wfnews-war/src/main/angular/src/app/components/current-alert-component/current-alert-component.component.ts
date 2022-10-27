import { Component, OnInit } from '@angular/core';
import { AreaRestrictionsOption, BansAndProhibitionsOption, EvacOrderOption } from '../../conversion/models';
import { AGOLService } from '../../services/AGOL-service';
import { CommonUtilityService } from '../../services/common-utility.service';
import { haversineDistance } from '../../services/wfnews-map.service/util';
import { convertToDateWithDayOfWeek as DateTimeConvert } from '../../utils';

@Component({
  selector: 'current-alert-component',
  templateUrl: './current-alert-component.component.html',
  styleUrls: ['./current-alert-component.component.scss']
})
export class CurrentAlertComponentComponent implements OnInit {
  public evacOrders : EvacOrderOption[] = []
  public areaRestrictions: AreaRestrictionsOption[] = []
  public bansAndProhibitions: BansAndProhibitionsOption[] = []
  currentLat: number;
  currentLong: number;
  nearmeChecked: boolean;
  alertTypeOptions = [
    'All',
    'Area Restrictions',
    'Bans & Prohibitions',
    'Evacuation Orders and Alerts',
  ]
  selectedAlertType = 'All'

  constructor(private agolService: AGOLService, private commonUtilityService: CommonUtilityService) {
}
  public convertToDateWithDayOfWeek = DateTimeConvert;



  ngOnInit() {
    this.useMyCurrentLocation()
    this.getEvacOrders(null, null);
    this.getBansProhibitions(null, null);
    this.getAreaRestrictions(null, null)
  }

  selectAlertUpdated(event:string){
    this.evacOrders = [];
    this.areaRestrictions = [];
    this.bansAndProhibitions = [];
    let long = null;
    let lat = null
    if(this.nearmeChecked){
      long = this.currentLong 
      lat = this.currentLat
    }
    switch(event) { 
      case 'All': { 
        this.getEvacOrders(long, lat);
        this.getBansProhibitions(long, lat);
        this.getAreaRestrictions(long, lat)
        break; 
      } 
      case 'Area Restrictions': { 
        this.getAreaRestrictions(long, lat)         
        break; 
      } 
      case 'Bans & Prohibitions': {
        this.getBansProhibitions(long, lat);
        break;
      }
      case 'Evacuation Orders and Alerts': {
        this.getEvacOrders(long, lat);
        break;
      }
      default: { 
         break; 
      } 
   }   
  }

  nearmeToggleChanged(){
    this.selectAlertUpdated(this.selectedAlertType)
  }

  getEvacOrders (currentLong: number, currentLat: number) {
    this.agolService.getEvacOrders((currentLong && currentLat) ? {x:currentLong, y:currentLat} : null, { returnCentroid: true, returnGeometry: false}).subscribe(response => {
      if (response.features) {
        for (const element of response.features) {
          this.evacOrders.push({
            eventName: element.attributes.EVENT_NAME,
            eventType: element.attributes.EVENT_TYPE,
            orderAlertStatus: element.attributes.ORDER_ALERT_STATUS,
            issuingAgency: element.attributes.ISSUING_AGENCY,
            preOcCode: element.attributes.PREOC_CODE,
            emrgOAAsysID: element.attributes.EMRG_OAA_SYSID,
            centroid: element.centroid,
            dateModified: element.attributes.DATE_MODIFIED,
            noticeType: 'evac'
          })
        }
      }
    })
  }

  getAreaRestrictions(currentLong: number, currentLat: number) {
    this.agolService.getAreaRestrictions((currentLong && currentLat) ? {x:currentLong, y:currentLat} : null, { returnCentroid: true, returnGeometry: false}).subscribe(response => {
      if (response.features) {
        for (const element of response.features) {
          this.areaRestrictions.push ({
            protRsSysID: element.attributes.PROT_RA_SYSID,
            name: element.attributes.NAME,
            accessStatusEffectiveDate: element.attributes.ACCESS_STATUS_EFFECTIVE_DATE,
            fireCentre: element.attributes.FIRE_CENTRE_NAME,
            fireZone: element.attributes.FIRE_ZONE_NAME,
            bulletinUrl: element.attributes.BULLETIN_URL,
            centroid:element.centroid,
            noticeType: 'area'
          })
        }
      }
    })
  }

  getBansProhibitions(currentLong: number, currentLat: number) {
    this.agolService.getBansAndProhibitions((currentLong && currentLat) ? {x:currentLong, y:currentLat} : null, { returnCentroid: true, returnGeometry: false}).subscribe(response => {
      if (response.features) {
        // there is no Status column in BanAndProhibitions
        for (const element of response.features) {
          this.bansAndProhibitions.push({
            protBsSysID: element.attributes.PROT_BAP_SYSID,
            type: element.attributes.TYPE,
            accessStatusEffectiveDate: element.attributes.ACCESS_STATUS_EFFECTIVE_DATE,
            fireCentre: element.attributes.FIRE_CENTRE_NAME,
            fireZone: element.attributes.FIRE_ZONE_NAME,
            bulletinUrl: element.attributes.BULLETIN_URL,
            accessProhibitionDescription: element.attributes.ACCESS_PROHIBITION_DESCRIPTION,
            centroid: element.centroid,
            noticeType: 'bans'
          })
        }
      }
    })
  }

  async useMyCurrentLocation() {
    const location = await this.commonUtilityService.getCurrentLocationPromise()
    if( location ){
        this.currentLat = Number(location.coords.latitude);
        this.currentLong = Number(location.coords.longitude);
    }
  }

  calculateDistance (lat: number, long: number): string {
    let result = '---';
    if (lat && long && this.currentLat && this.currentLong) {
      result = (haversineDistance(lat, this.currentLat, long, this.currentLong) / 1000).toFixed(2);
    }
    return result;
  }

  openBcGovGuide() {
    let url = 'https://www2.gov.bc.ca/gov/content/safety/wildfire-status/fire-bans-and-restrictions'
    window.open(url, "_blank");
  }

  convertRestriction(value: string) {
    let text = value.split(', ')
    for (let i = 0; i < text.length; i++) {
      if((text[i] === 'Category 2') || (text[i] === 'Category 3')) {
        text[i] = text[i] + ' Open Fire'
      }
    }
    return text.toString()
  }
}
