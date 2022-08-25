import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Component, Input, OnChanges, OnInit, SimpleChanges } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { AppConfigService } from '@wf1/core-ui';
import { EvacOrderOption } from '../../../conversion/models';

@Component({
  selector: 'evac-orders-details-panel',
  templateUrl: './evac-orders-details-panel.component.html',
  styleUrls: ['./evac-orders-details-panel.component.scss']
})
export class EvacOrdersDetailsPanel implements OnInit, OnChanges {
  @Input() public readonly formGroup: FormGroup
  @Input() public incident

  evacOrders : EvacOrderOption[] = []

  constructor(private appConfigService: AppConfigService, protected http: HttpClient) {
  }

  ngOnInit() {
    this.getEvacOrders();
  }

  ngOnChanges(changes: SimpleChanges) {
  }

  getEvacOrders(){
    // need to support a spatial query here
    // query by the fire location point with a buffer
    // also, move to a service class

    let url = this.appConfigService.getConfig().externalAppConfig['AGOLevacOrders'].toString();
    // append query. Only search for Fire events
    url += "query?where=EVENT_TYPE='fire'&geometryType=esriGeometryEnvelope&inSR=4326&spatialRel=esriSpatialRelIntersects&units=esriSRUnit_Meter&outFields=*&returnGeometry=false&returnCentroid=false&featureEncoding=esriDefault&outSR=4326&defaultSR=4326&returnIdsOnly=false&returnQueryGeometry=false&cacheHint=false&returnExceededLimitFeatures=true&sqlFormat=none&f=pjson&token="

    if (Object.prototype.hasOwnProperty.call(this.incident, 'geometry')) {
      // Get the incident geometry, buffer the points by x metres
      // right now, just moving by 10 points of lat/long
      url += `&geometry=${this.incident.geometry.x - 5},${this.incident.geometry.y - 5},${this.incident.geometry.x + 5},${this.incident.geometry.y + 5}`
    }

    let headers = new HttpHeaders();
    headers.append('Access-Control-Allow-Origin','*');
    headers.append('Accept','*/*');
    this.http.get<any>(url,{headers}).subscribe(response => {
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
