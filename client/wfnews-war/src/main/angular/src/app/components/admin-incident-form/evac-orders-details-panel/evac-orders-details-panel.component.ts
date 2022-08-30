import { Component, Input, OnChanges, OnInit, SimpleChanges } from '@angular/core';
import { FormArray, FormBuilder, FormGroup } from '@angular/forms';
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

  constructor(private agolService: AGOLService, private readonly formBuilder: FormBuilder) {
  }

  ngOnInit() {
    this.getEvacOrders();
  }

  ngOnChanges(changes: SimpleChanges) {
  }

  addEvacOrder () {
    this.incident.evacOrders.push({
      orderAlertStatus: null,
      eventName: '',
      url: ''
    })
    this.evacOrderForm.push(this.formBuilder.group({
      orderAlertStatus: [],
      eventName: [],
      url: []
    }))
  }

  deleteEvacOrder (evacOrder) {
    const index = this.incident.evacOrders.indexOf(evacOrder)
    if (index) {
      this.incident.evacOrders.splice(index, 1)
      this.evacOrderForm.removeAt(index)
    }
  }

  get evacOrderForm() : FormArray {
    return this.formGroup.get("evacOrders") as FormArray
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
