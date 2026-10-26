import { Component } from '@angular/core';
import { IdentifyCardBase } from '../identify-card-base';

@Component({
  selector: 'wfnews-identify-protected-land-card',
  templateUrl: './identify-protected-land-card.component.html',
})
export class IdentifyProtectedLandCardComponent extends IdentifyCardBase {
  protected readonly compactOnDesktop = true;

  get campfireBan(): boolean {
    return this.p.CAMPFIRE_BAN_IND !== 'N';
  }

  get details(): string {
    return this.p.ACCESS_DETAILS || (this.variant.parkClosedFallback ? this.texts.PARK_CLOSED : this.p.ACCESS_DETAILS);
  }
}
