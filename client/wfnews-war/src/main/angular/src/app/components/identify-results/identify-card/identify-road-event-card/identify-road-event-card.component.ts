import { Component } from '@angular/core';
import { IdentifyCardBase } from '../identify-card-base';

@Component({
  selector: 'wfnews-identify-road-event-card',
  templateUrl: './identify-road-event-card.component.html',
})
export class IdentifyRoadEventCardComponent extends IdentifyCardBase {
  get severity(): string {
    return this.p.SEVERITY[0].toUpperCase() + this.p.SEVERITY.slice(1).toLowerCase();
  }
}
