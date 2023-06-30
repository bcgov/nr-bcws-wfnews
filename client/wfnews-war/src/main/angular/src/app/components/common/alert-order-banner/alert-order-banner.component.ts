import { Component, Input } from '@angular/core';
import { EvacOrderOption } from '../../../conversion/models';

@Component({
  selector: 'alert-order-banner',
  templateUrl: './alert-order-banner.component.html',
  styleUrls: ['./alert-order-banner.component.scss']
})
export class AlertBannerComponent {
  @Input() evac: EvacOrderOption;
  @Input() card: boolean;

  isOrder = () => this.evac?.orderAlertStatus === 'Order'
}
