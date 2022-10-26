import { Component, OnInit } from '@angular/core';
import { AreaRestrictionsOption, BansAndProhibitionsOption, EvacOrderOption } from '../../conversion/models';
import { AGOLService } from '../../services/AGOL-service';

@Component({
  selector: 'current-alert-component',
  templateUrl: './current-alert-component.component.html',
  styleUrls: ['./current-alert-component.component.scss']
})
export class CurrentAlertComponentComponent implements OnInit {
  public evacOrders : EvacOrderOption[] = []
  public areaRestrictions: AreaRestrictionsOption[] = []
  public bansAndProhibitions: BansAndProhibitionsOption[] = []
  alertTypeOptions = [
    'All',
    'Area Restrictions',
    'Bans & Prohibitions',
    'Evacuation Orders and Alerts',
  ]
  selectedAlertType = ''

  constructor(private agolService: AGOLService) {
}


  ngOnInit() {
    this.getEvacOrders();
    this.getBansProhibitions();
    this.getAreaRestrictions()
  }
  selectAlertUpdated(event:any){
    console.log(event)
  }

  getEvacOrders () {
    this.agolService.getEvacOrders(null, { returnCentroid: true, returnGeometry: false}).subscribe(response => {
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

  getAreaRestrictions() {
    this.agolService.getAreaRestrictions(null,{ returnCentroid: true, returnGeometry: false}).subscribe(response => {
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

  getBansProhibitions() {
    this.agolService.getBansAndProhibitions(null,{ returnCentroid: true, returnGeometry: false}).subscribe(response => {
      if (response.features) {
        for (const element of response.features) {
          this.bansAndProhibitions.push({
            protBsSysID: element.attributes.PROT_BAP_SYSID,
            type: element.attributes.TYPE,
            accessStatusEffectiveDate: element.attributes.ACCESS_STATUS_EFFECTIVE_DATE,
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
}
