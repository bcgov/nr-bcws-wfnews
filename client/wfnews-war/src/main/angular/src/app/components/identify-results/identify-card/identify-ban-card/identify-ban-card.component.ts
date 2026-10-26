import { Component } from '@angular/core';
import { INFORMATION_TEXTS } from '@app/constants';
import { IdentifyCardBase } from '../identify-card-base';

@Component({
  selector: 'wfnews-identify-ban-card',
  templateUrl: './identify-ban-card.component.html',
})
export class IdentifyBanCardComponent extends IdentifyCardBase {
  protected readonly compactOnDesktop = true;
  readonly bansInfo = INFORMATION_TEXTS.BCWS_BANS_APPLY_LAND_INFO;

  get heading(): string {
    if (!this.variant.banOpenFires) {
      return `Fire Ban on ${this.item.title}`;
    }
    const description: string = this.p.ACCESS_PROHIBITION_DESCRIPTION;
    return `Fire Ban on ${description.includes('Category 1') ? description.replace('Category 1', 'Category 1 (Campfires)') : description} Open Fires`;
  }
}
