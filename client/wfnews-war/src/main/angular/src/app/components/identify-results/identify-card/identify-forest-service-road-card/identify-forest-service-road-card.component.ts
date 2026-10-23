import { Component } from '@angular/core';
import { IdentifyCardBase } from '../identify-card-base';

@Component({
  selector: 'wfnews-identify-forest-service-road-card',
  templateUrl: './identify-forest-service-road-card.component.html',
})
export class IdentifyForestServiceRoadCardComponent extends IdentifyCardBase {
  get heading(): string {
    switch (this.p.ALERT_TYPE) {
      case 'WARNING':
        return 'Warning for ' + this.p.LOCATION;
      case 'CLOSURE':
        return 'Closure for ' + this.p.LOCATION;
      case 'SEASONAL':
        return 'Seasonal Closure for ' + this.p.LOCATION;
      default:
        return 'Unknown';
    }
  }
}
