import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Component, Input, OnChanges, OnInit, SimpleChanges } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { AppConfigService } from '@wf1/core-ui';
import { Observable } from 'rxjs';
import { fireCentreOption } from '../../../conversion/models';

@Component({
  selector: 'contacts-details-panel',
  templateUrl: './contacts-details-panel.component.html',
  styleUrls: ['./contacts-details-panel.component.scss',
    '../../base/base.component.scss']
})
export class ContactsDetailsPanel implements OnInit, OnChanges {
  @Input() public readonly formGroup: FormGroup
  @Input() public incident

  private contacts: any
  fireCentreOptions : fireCentreOption[] = []

  constructor(private appConfigService: AppConfigService, protected http: HttpClient) {
  }

  ngOnInit() {
    this.getFireCentres();
    this.getFireCentreContacts().subscribe(data => {
      this.contacts = data
     });

  }

  ngOnChanges(changes: SimpleChanges) {
  }

  setDefaultContactInfo (value) {
    const control = this.formGroup.get("contact")
    if (Object.prototype.hasOwnProperty.call(this.contacts, value)) {
      control.patchValue({
        phoneNumber: this.contacts[value].phone,
        emailAddress: this.contacts[value].url
      })
    }
  }

  public getFireCentreContacts (): Observable<any> {
    return this.http.get('../../../../assets/data/fire-center-contacts.json')
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
