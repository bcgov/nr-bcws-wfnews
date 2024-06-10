import { Component, Input } from '@angular/core';
import {
  AreaRestrictionsOption,
  EvacOrderOption,
} from '../../../conversion/models';

@Component({
  selector: 'alert-order-banner',
  templateUrl: './alert-order-banner.component.html',
  styleUrls: ['./alert-order-banner.component.scss'],
})
export class AlertOrderBannerComponent {
  @Input() evacuation: EvacOrderOption;
  @Input() areaRestriction: AreaRestrictionsOption;
  @Input() isCard: boolean;

  isOrder = () => this.evacuation?.orderAlertStatus === 'Order';
  isArea = () => !!this.areaRestriction;

  color = () => {
    if (this.isOrder() || this.isArea()) {
      return 'red';
    }
    return 'yellow';
  };

  shape = () => (this.isCard ? 'card' : 'banner');

  icon = () => {
    if (this.isArea()) {
      return 'signpost';
    }
    if (this.isOrder()) {
      return 'error';
    }
    return 'warning';
  };

  message = () => {
    if (this.isArea()) {
      return `Area Restriction: ${this.areaRestriction?.name}`;
    }
    if (this.isOrder()) {
      return `Evacuation Order: ${this.evacuation?.eventName} issued by ${this.evacuation?.issuingAgency}`;
    }
    return `Evacuation Alert: ${this.evacuation?.eventName} issued by ${this.evacuation?.issuingAgency}`;
  };
}
