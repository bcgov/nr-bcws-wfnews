import { ChangeDetectorRef, Component, Input, OnInit } from '@angular/core';
import { FormArray, FormBuilder, FormGroup } from '@angular/forms';
import { EvacOrderOption } from '../../../conversion/models';
import { AGOLService } from '../../../services/AGOL-service';
import { DefaultService as ExternalUriService, ExternalUriResource } from '@wf1/incidents-rest-api';

@Component({
  selector: 'evac-orders-details-panel',
  templateUrl: './evac-orders-details-panel.component.html',
  styleUrls: ['./evac-orders-details-panel.component.scss']
})
export class EvacOrdersDetailsPanel implements OnInit {
  @Input() public readonly formGroup: FormGroup
  @Input() public incident

  evacOrders : EvacOrderOption[] = []

  constructor(private agolService: AGOLService, protected cdr: ChangeDetectorRef, private readonly formBuilder: FormBuilder, private externalUriService: ExternalUriService) {
  }

  ngOnInit() {
    this.getEvacOrders();
  }

  addEvacOrder () {
    this.incident.evacOrders.push({
      orderAlertStatus: null,
      eventName: '',
      url: '',
      externalUri:  {
        externalUriDisplayLabel: null,
        externalUri: null,
        publishedInd: false,
        privateInd: false,
        archivedInd: false,
        primaryInd: false,
        externalUriCategoryTag: 'EVAC-ORDER',
        sourceObjectNameCode: 'INCIDENT',
        sourceObjectUniqueId: '' + this.incident.wildfireIncidentGuid,
        '@type': 'http://wfim.nrs.gov.bc.ca/v1/externalUri',
        type: 'http://wfim.nrs.gov.bc.ca/v1/externalUri'
      } as ExternalUriResource
    })
    this.evacOrderForm.push(this.formBuilder.group({
      orderAlertStatus: [],
      eventName: [],
      url: []
    }))
  }

  deleteEvacOrder (index) {
    const evac = this.incident.evacOrders[index]
    // remove from arrays and form builder
    this.incident.evacOrders.splice(index, 1)
    this.evacOrderForm.removeAt(index)
    // delete from externalUri, if this uri already exists
    if (evac.externalUri && evac.externalUri.externalUriGuid) {
      this.externalUriService.deleteExternalUri(evac.externalUri.externalUriGuid).toPromise().catch(err => {
        console.error(err)
      })
    }
    this.cdr.detectChanges()
  }

  get evacOrderForm() : FormArray {
    return this.formGroup.get("evacOrders") as FormArray
  }

  persistEvacOrders () {
    for (let i = 0; i < this.incident.evacOrders.length; i++) {
      const evac = this.incident.evacOrders[i]
      const evacForm = this.evacOrderForm.at(i)


      evac.externalUri.externalUriCategoryTag = 'EVAC-ORDER:' + evacForm.value.orderAlertStatus
      evac.externalUri.externalUriDisplayLabel = evacForm.value.eventName
      evac.externalUri.externalUri = evacForm.value.url
      evac.externalUri.publishedInd = true
      evac.externalUri.sourceObjectUniqueId = '' + this.incident.wildfireIncidentGuid

      if (evac.externalUri && evac.externalUri.externalUriGuid) {
        this.externalUriService.updateExternalUri(evac.externalUri.externalUriGuid, evac.externalUri).toPromise().then(result => {
          // ignore result, should probably just call .subscribe()?
        })
      } else {
        this.externalUriService.createExternalUri(evac.externalUri).toPromise().then(result => {
          // ignore result, should probably just call .subscribe()?
        })
      }
    }
  }

  getEvacOrders () {
    if(this.incident.geometry.x && this.incident.geometry.y){
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

    this.externalUriService.getExternalUriList(
      '' + this.incident.wildfireIncidentGuid,
      '' + 1,
      '' + 100,
      'response',
      undefined,
      undefined
    ).toPromise().then( (response) => {
      const externalUriList = response.body
      for (const uri of externalUriList.collection) {
        if (uri.externalUriCategoryTag.includes('EVAC-ORDER')) {
          const evac = {
            orderAlertStatus: uri.externalUriCategoryTag.split(':')[1],
            eventName: uri.externalUriDisplayLabel,
            url: uri.externalUri,
            externalUri: uri as ExternalUriResource
          }

          this.incident.evacOrders.push(evac)

          const form = this.formBuilder.group({
            orderAlertStatus: [],
            eventName: [],
            url: []
          })
          form.patchValue(evac)
          this.evacOrderForm.push(form)
        }
      }

      this.cdr.detectChanges()
    }).catch(err => {
      console.error(err)
    })
  }
}
