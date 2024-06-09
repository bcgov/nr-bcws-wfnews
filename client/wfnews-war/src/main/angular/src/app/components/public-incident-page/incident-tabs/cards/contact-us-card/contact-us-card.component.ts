import { Component, Input } from '@angular/core';

@Component({
  // eslint-disable-next-line @angular-eslint/component-selector
  selector: 'contact-us-card',
  templateUrl: './contact-us-card.component.html',
  styleUrls: ['./contact-us-card.component.scss']
})
export class ContactUsCardComponent {

  @Input() incident;

  call = () => {
    window.open('tel:' + this.incident.contactPhoneNumber, '_self');
  };

  email = () => {
    window.open('mailto:' + this.incident.contactEmailAddress, '_blank');
  };
}
