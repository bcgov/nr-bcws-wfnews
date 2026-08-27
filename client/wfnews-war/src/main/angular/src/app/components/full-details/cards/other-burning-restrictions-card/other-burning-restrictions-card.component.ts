import { Component } from '@angular/core';
import { CARD_TEXTS } from '@app/constants';

@Component({
  selector: 'other-burning-restrictions-card',
  templateUrl: './other-burning-restrictions-card.component.html',
  styleUrls: ['./other-burning-restrictions-card.component.scss']
})
export class OtherBurningRestrictionsCardComponent {

  talkToYourLocalAuthorityText = CARD_TEXTS.TALK_TO_YOUR_LOCAL_AUTHORITY;
  campgroundsText = CARD_TEXTS.CAMPGROUNDS;

  directToLink() {
    window.open('https://bcparks.ca/active-advisories/', '_blank');
  }
}
