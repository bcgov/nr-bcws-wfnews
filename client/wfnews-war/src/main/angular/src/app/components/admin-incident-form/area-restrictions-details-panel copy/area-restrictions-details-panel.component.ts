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
