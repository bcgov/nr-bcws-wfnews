import { AfterViewInit, Component, OnInit } from '@angular/core';
import { AreaRestrictionsOption, BansAndProhibitionsOption, EvacOrderOption } from '../../conversion/models';
import { AGOLService } from '../../services/AGOL-service';
import { CommonUtilityService } from '../../services/common-utility.service';
import { haversineDistance } from '../../services/wfnews-map.service/util';
import { convertToDateWithDayOfWeek as DateTimeConvert } from '../../utils';
import * as L from 'leaflet';
import { AppConfigService } from '@wf1/core-ui';

@Component({
  selector: 'current-alert-component',
  templateUrl: './current-alert-component.component.html',
  styleUrls: ['./current-alert-component.component.scss']
})
export class CurrentAlertComponentComponent implements OnInit, AfterViewInit {
  public evacOrders : EvacOrderOption[] = []
  public areaRestrictions: AreaRestrictionsOption[] = []
  public bansAndProhibitions: BansAndProhibitionsOption[] = []
  public currentLat: number;
  public currentLong: number;
  public nearmeChecked: boolean;
  public alertTypeOptions = [
    'All',
    'Area Restrictions',
    'Bans & Prohibitions',
    'Evacuation Orders and Alerts',
  ]
  public selectedAlertType = 'All'

  constructor(private agolService: AGOLService, private commonUtilityService: CommonUtilityService, private appConfigService: AppConfigService) {}
  public convertToDateWithDayOfWeek = DateTimeConvert;

  ngOnInit() {
    this.useMyCurrentLocation()
  }

  createMap (id: string, item: any, type: string) {
    const location = item && item.centroid ? [Number(item.centroid.y || 0), Number(item.centroid.x || 0)] : [0, 0]
    const map = L.map(id, {
      attributionControl: false,
      zoomControl: false,
      dragging: false,
      doubleClickZoom: false,
      boxZoom: false,
      trackResize: false
    }).setView(location, 12)

    if (item.geometry) {
      map.fitBounds(new L.LatLngBounds([item.geometry.ymin, item.geometry.xmin], [item.geometry.ymax, item.geometry.xmax]));
    }

    L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    }).addTo(map)

    let databcUrl = this.appConfigService.getConfig()['mapServices']['openmapsBaseUrl'].toString()

    if (type.toLocaleLowerCase() === 'evac') {
      L.tileLayer.wms(databcUrl, {
        layers: 'WHSE_HUMAN_CULTURAL_ECONOMIC.EMRG_ORDER_AND_ALERT_AREAS_SP',
        styles: '6885',
        format: 'image/png',
        transparent: true,
        version: '1.1.1'
      }).addTo(map);
    } else if (type.toLocaleLowerCase() === 'ban') {
      L.tileLayer.wms(databcUrl, {
        layers: 'WHSE_LAND_AND_NATURAL_RESOURCE.PROT_BANS_AND_PROHIBITIONS_SP',
        styles: '7733',
        format: 'image/png',
        transparent: true,
        version: '1.1.1'
      }).addTo(map);
    } else if (type.toLocaleLowerCase() === 'area') {
      L.tileLayer.wms(databcUrl, {
        layers: 'WHSE_LAND_AND_NATURAL_RESOURCE.PROT_RESTRICTED_AREAS_SP',
        styles: '7735',
        format: 'image/png',
        transparent: true,
        version: '1.1.1'
      }).addTo(map);
    }
  }

  async ngAfterViewInit () {
    await Promise.all([this.getEvacOrders(), this.getBansProhibitions(), this.getAreaRestrictions()])
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

  async getEvacOrders (currentLong: number = null, currentLat: number = null): Promise<void> {
    const response = await this.agolService.getEvacOrders((currentLong && currentLat) ? {x: currentLong, y: currentLat} : null, { returnCentroid: true, returnGeometry: false}).toPromise()

    if (response.features) {
      for (const element of response.features) {
        const extentResponse = await this.agolService.getEvacOrdersByEventNumber(element.attributes.EVENT_NUMBER, { returnExtent: true}).toPromise()

        this.evacOrders.push({
          eventName: element.attributes.EVENT_NAME,
          eventType: element.attributes.EVENT_TYPE,
          orderAlertStatus: element.attributes.ORDER_ALERT_STATUS,
          issuingAgency: element.attributes.ISSUING_AGENCY,
          preOcCode: element.attributes.PREOC_CODE,
          emrgOAAsysID: element.attributes.EMRG_OAA_SYSID,
          centroid: element.centroid,
          geometry: extentResponse.extent,
          dateModified: element.attributes.DATE_MODIFIED,
          noticeType: 'evac'
        })
      }
    }
  }

  async getAreaRestrictions(currentLong: number = null, currentLat: number = null): Promise<void> {
    const response = await this.agolService.getAreaRestrictions((currentLong && currentLat) ? {x: currentLong, y: currentLat} : null, { returnCentroid: true, returnGeometry: false}).toPromise()
    if (response.features) {
      for (const element of response.features) {
        const extentResponse = await this.agolService.getAreaRestrictionsByID(element.attributes.PROT_RA_SYSID, { returnExtent: true}).toPromise()
        this.areaRestrictions.push ({
          protRsSysID: element.attributes.PROT_RA_SYSID,
          name: element.attributes.NAME,
          accessStatusEffectiveDate: element.attributes.ACCESS_STATUS_EFFECTIVE_DATE,
          fireCentre: element.attributes.FIRE_CENTRE_NAME,
          fireZone: element.attributes.FIRE_ZONE_NAME,
          bulletinUrl: element.attributes.BULLETIN_URL,
          centroid: element.centroid,
          geometry: extentResponse.extent,
          noticeType: 'area'
        })
      }
    }
  }

  async getBansProhibitions(currentLong: number = null, currentLat: number = null): Promise<void> {
    const response = await this.agolService.getBansAndProhibitions((currentLong && currentLat) ? {x: currentLong, y: currentLat} : null, { returnCentroid: true, returnGeometry: true}).toPromise()
    if (response.features) {
      // there is no Status column in BanAndProhibitions
      for (const element of response.features) {
        const extentResponse = await this.agolService.getBansAndProhibitionsById(element.attributes.PROT_BAP_SYSID, { returnExtent: true }).toPromise()
        this.bansAndProhibitions.push({
          protBsSysID: element.attributes.PROT_BAP_SYSID,
          type: element.attributes.TYPE,
          accessStatusEffectiveDate: element.attributes.ACCESS_STATUS_EFFECTIVE_DATE,
          fireCentre: element.attributes.FIRE_CENTRE_NAME,
          fireZone: element.attributes.FIRE_ZONE_NAME,
          bulletinUrl: element.attributes.BULLETIN_URL,
          accessProhibitionDescription: element.attributes.ACCESS_PROHIBITION_DESCRIPTION,
          centroid: element.centroid,
          geometry: extentResponse.extent,
          noticeType: 'bans'
        })
      }
    }
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
