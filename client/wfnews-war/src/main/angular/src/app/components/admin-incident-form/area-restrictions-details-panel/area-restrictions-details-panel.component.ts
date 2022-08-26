import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Component, Input, OnChanges, OnInit, SimpleChanges } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { AppConfigService } from '@wf1/core-ui';
import { AreaRestrictionsOption } from '../../../conversion/models';

@Component({
  selector: 'area-restrictions-details-panel',
  templateUrl: './area-restrictions-details-panel.component.html',
  styleUrls: ['./area-restrictions-details-panel.component.scss']
})
export class AreaRestrictionsDetailsPanel implements OnInit, OnChanges {
  @Input() public readonly formGroup: FormGroup
  @Input() public incident

  areaRestrictions : AreaRestrictionsOption[] = []

  constructor(private appConfigService: AppConfigService, protected http: HttpClient) {
  }

  ngOnInit() {
    this.getAreaRestrictions();
  }

  ngOnChanges(changes: SimpleChanges) {
  }

  getAreaRestrictions(){
    // need to support a spatial query here
    // query by the fire location point with a buffer
    // also, move this into a service class
    let url = this.appConfigService.getConfig().externalAppConfig['AGOLareaRestrictions'].toString();

    // append query
    url += 'query?where=1=1&geometryType=esriGeometryEnvelope&inSR=4326&spatialRel=esriSpatialRelIntersects&units=esriSRUnit_Meter&outFields=*&returnGeometry=false&returnCentroid=false&featureEncoding=esriDefault&outSR=4326&defaultSR=4326&returnIdsOnly=false&returnQueryGeometry=false&cacheHint=false&returnExceededLimitFeatures=true&sqlFormat=none&f=pjson&token='

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
          this.areaRestrictions.push({
            protRsSysID: element.attributes.PROT_RA_SYSID,
            name: element.attributes.NAME,
            accessStatusEffectiveDate: element.attributes.ACCESS_STATUS_EFFECTIVE_DATE,
            fireCentre: element.attributes.FIRE_CENTRE_NAME,
            fireZone: element.attributes.FIRE_ZONE_NAME,
            bulletinUrl: element.attributes.BULLETIN_URL
          })
        }
      }
    })
  }
}
