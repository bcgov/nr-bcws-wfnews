import { Component, Input } from '@angular/core';
import { defaultSlimIconButtonStyle } from '../icon-button/icon-button.component';

@Component({
  selector: 'contact-us-core',
  templateUrl: './contact-us-core.component.html',
  styleUrls: ['./contact-us-core.component.scss']
})
export class ContactUsCoreComponent {
  @Input() incident;

  iconButtonStyling = { ...defaultSlimIconButtonStyle, backgroundColor: '#FFF' };
  

  call = () => {
    window.open('tel:' + this.incident.contactPhoneNumber, '_self');
  };

  email = () => {

    window.open(
      'mailto:' + this.incident?.contactEmailAddress + 
      '?subject=' + encodeURIComponent(this.incident?.incidentName),
      '_blank'
    );
  };
  
}
