import { Component } from '@angular/core';
import { displayDangerRatingDescription } from '@app/utils';
import { IdentifyCardBase } from '../identify-card-base';

@Component({
  selector: 'wfnews-identify-danger-rating-card',
  templateUrl: './identify-danger-rating-card.component.html',
})
export class IdentifyDangerRatingCardComponent extends IdentifyCardBase {
  protected readonly compactOnDesktop = true;

  get heading(): string | null {
    const rating = this.p.DANGER_RATING_DESC;
    return !this.phone || rating ? `${rating ?? ''} Fire Danger` : null;
  }

  get description(): string {
    return displayDangerRatingDescription(this.p.DANGER_RATING_DESC);
  }
}
