import { Component, Input } from '@angular/core';
import { defaultSlimIconButtonStyle } from '../../../common/icon-button/icon-button.component';

@Component({
  // eslint-disable-next-line @angular-eslint/component-selector
  selector: 'contact-us-banner',
  templateUrl: './contact-us-banner.component.html',
  styleUrls: ['./contact-us-banner.component.scss']
})
export class ContactUsBannerComponent {

  @Input() incident;

  iconButtonStyling = { ...defaultSlimIconButtonStyle, backgroundColor: '#FFF' };
  

  call = () => {
    window.open('tel:' + this.incident.contactPhoneNumber, '_self');
  };

  email = () => {
    window.open('mailto:' + this.incident.contactEmailAddress, '_blank');
  };
}
