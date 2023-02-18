import { HttpClient } from '@angular/common/http';
import { Component, Input, OnInit } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { Observable } from 'rxjs';
import { fireCentreOption } from '../../../conversion/models';
import { FireCentres } from '../../../utils';

@Component({
  selector: 'contacts-details-panel',
  templateUrl: './contacts-details-panel.component.html',
  styleUrls: ['./contacts-details-panel.component.scss',
    '../../base/base.component.scss']
})
export class ContactsDetailsPanel implements OnInit {
  @Input() public readonly formGroup: FormGroup
  @Input() public incident

  public contacts: any
  public fireCentreOptions : fireCentreOption[] = []

  constructor(protected http: HttpClient) {
  }

  ngOnInit() {
    this.getFireCentres();
    this.getFireCentreContacts().subscribe(data => {
      this.contacts = data
     });

  }

  setDefaultContactInfo (value) {
    const control = this.formGroup.get("contact")
    if (Object.prototype.hasOwnProperty.call(this.contacts, value)) {
      control.patchValue({
        phoneNumber: this.contacts[value].phone,
        emailAddress: this.contacts[value].url,
        fireCentre: value
      })
    }
  }

  public getFireCentreContacts (): Observable<any> {
    return this.http.get('../../../../assets/data/fire-center-contacts-agol.json')
  }

  getFireCentres(){
    this.fireCentreOptions = FireCentres
  }
}
