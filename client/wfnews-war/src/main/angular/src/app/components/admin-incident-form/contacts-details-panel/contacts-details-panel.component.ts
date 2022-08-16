import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Component, Input, OnChanges, OnInit, SimpleChanges } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { AppConfigService } from '@wf1/core-ui';
import { fireCentreOption } from '../../../conversion/models';

@Component({
  selector: 'contacts-details-panel',
  templateUrl: './contacts-details-panel.component.html',
  styleUrls: ['./contacts-details-panel.component.scss']
})
export class ContactsDetailsPanel implements OnInit, OnChanges {
  @Input() public readonly formGroup: FormGroup
  @Input() public incident

  fireCentreOptions : fireCentreOption[] = []

  constructor(private appConfigService: AppConfigService, protected http: HttpClient) {
  }

  ngOnInit() {
    this.getFireCentres();
  }

  ngOnChanges(changes: SimpleChanges) {
  }

  getFireCentres(){
    let url = this.appConfigService.getConfig().externalAppConfig['AGOLfireCentres'].toString();
    let headers = new HttpHeaders();
    headers.append('Access-Control-Allow-Origin','*');
    headers.append('Accept','*/*');
    this.http.get<any>(url,{headers}).subscribe(response => {
      if(response.features){
        response.features.forEach(element => {
          this.fireCentreOptions.push({code: element.attributes.FIRE_CENTRE_CODE, fireCentreName: element.attributes.FIRE_CENTRE})
        });
      }
    })
  }
}
