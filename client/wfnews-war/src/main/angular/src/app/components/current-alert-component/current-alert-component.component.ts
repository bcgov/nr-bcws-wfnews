import { Component, OnInit } from '@angular/core';
import { EvacOrderOption } from '../../conversion/models';
import { AGOLService } from '../../services/AGOL-service';

@Component({
  selector: 'current-alert-component',
  templateUrl: './current-alert-component.component.html',
  styleUrls: ['./current-alert-component.component.scss']
})
export class CurrentAlertComponentComponent implements OnInit {
  public evacOrders : EvacOrderOption[] = []
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
  }
  selectAlertUpdated(event:any){
    console.log(event)
  }

  getEvacOrders () {
    this.agolService.getEvacOrders(null, { returnCentroid: true, returnGeometry: false}).subscribe(response => {
      console.log(response)
      if (response.features) {
        for (const element of response.features) {
          this.evacOrders.push({
            eventName: element.attributes.EVENT_NAME,
            eventType: element.attributes.EVENT_TYPE,
            orderAlertStatus: element.attributes.ORDER_ALERT_STATUS,
            issuingAgency: element.attributes.ISSUING_AGENCY,
            preOcCode: element.attributes.PREOC_CODE,
            emrgOAAsysID: element.attributes.EMRG_OAA_SYSID,
            centroid: element.centroid
          })
        }
      }
      console.log(this.evacOrders)
    })
  }

  

}
