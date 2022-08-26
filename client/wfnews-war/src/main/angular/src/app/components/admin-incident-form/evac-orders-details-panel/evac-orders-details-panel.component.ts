import { Component, Input, OnChanges, OnInit, SimpleChanges } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { EvacOrderOption } from '../../../conversion/models';
import { AGOLService } from '../../../services/AGOL-service';

@Component({
  selector: 'evac-orders-details-panel',
  templateUrl: './evac-orders-details-panel.component.html',
  styleUrls: ['./evac-orders-details-panel.component.scss']
})
export class EvacOrdersDetailsPanel implements OnInit, OnChanges {
  @Input() public readonly formGroup: FormGroup
  @Input() public incident

  evacOrders : EvacOrderOption[] = []

  constructor(private agolService: AGOLService) {
  }

  ngOnInit() {
    this.getEvacOrders();
  }

  ngOnChanges(changes: SimpleChanges) {
  }

  getEvacOrders () {
    this.agolService.getEvacOrders(this.incident.geometry).subscribe(response => {
      if (response.features) {
        for (const element of response.features) {
          this.evacOrders.push({
            eventName: element.attributes.EVENT_NAME,
            eventType: element.attributes.EVENT_TYPE,
            orderAlertStatus: element.attributes.ORDER_ALERT_STATUS,
            issuingAgency: element.attributes.ISSUING_AGENCY,
            preOcCode: element.attributes.PREOC_CODE,
            emrgOAAsysID: element.attributes.EMRG_OAA_SYSID
          })
        }
      }
    })
  }
}
