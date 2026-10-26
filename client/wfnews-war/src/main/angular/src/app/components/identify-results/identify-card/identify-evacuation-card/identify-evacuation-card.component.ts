import { Component } from '@angular/core';
import { IdentifyCardBase } from '../identify-card-base';

@Component({
  selector: 'wfnews-identify-evacuation-card',
  templateUrl: './identify-evacuation-card.component.html',
})
export class IdentifyEvacuationCardComponent extends IdentifyCardBase {
  get heading(): string | null {
    if (!this.p.EVENT_NAME) {
      return null;
    }
    const prefix = this.p.ORDER_ALERT_STATUS === 'Alert' ? 'Evacuation Alert for '
      : this.p.ORDER_ALERT_STATUS === 'Order' ? 'Evacuation Order for '
      : null;
    return prefix + this.p.EVENT_NAME;
  }

  get descriptions(): string[] {
    const texts = this.variant.texts;
    return this.p.ORDER_ALERT_STATUS === 'Alert' ? texts.EVACUATION_ALERT
      : this.p.ORDER_ALERT_STATUS === 'Order' ? texts.EVACUATION_ORDER
      : [];
  }
}
