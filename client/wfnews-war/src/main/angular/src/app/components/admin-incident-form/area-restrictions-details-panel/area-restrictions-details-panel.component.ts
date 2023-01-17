import { Component, Input, OnInit} from '@angular/core';
import { FormGroup } from '@angular/forms';
import { AreaRestrictionsOption } from '../../../conversion/models';
import { AGOLService } from '../../../services/AGOL-service';

@Component({
  selector: 'area-restrictions-details-panel',
  templateUrl: './area-restrictions-details-panel.component.html',
  styleUrls: ['./area-restrictions-details-panel.component.scss'],

})
export class AreaRestrictionsDetailsPanel implements OnInit {
  @Input() public readonly formGroup: FormGroup
  @Input() public incident

  areaRestrictions : AreaRestrictionsOption[] = []

  constructor(private agolService: AGOLService) {
  }

  ngOnInit() {
    this.getAreaRestrictions()
  }


  getAreaRestrictions () {
    if(this.incident.geometry.x && this.incident.geometry.y){
      this.agolService.getAreaRestrictions({ x: this.incident.geometry.x, y: this.incident.geometry.y}).subscribe(response => {
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
}
