import { Component } from '@angular/core';
import { ContactUsCoreComponent } from '@app/components/common/contact-us-core/contact-us-core.component';

@Component({
  selector: 'contact-us-card',
  templateUrl: './contact-us-card.component.html',
  styleUrls: ['./contact-us-card.component.scss']
})
export class ContactUsCardComponent extends ContactUsCoreComponent{
}
