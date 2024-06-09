import { Component } from '@angular/core';
import { ContactUsBannerComponent } from '../../contact-us-banner/contact-us-banner.component';

@Component({
  // eslint-disable-next-line @angular-eslint/component-selector
  selector: 'contact-us-card',
  templateUrl: './contact-us-card.component.html',
  styleUrls: ['./contact-us-card.component.scss']
})
export class ContactUsCardComponent extends ContactUsBannerComponent{
}
