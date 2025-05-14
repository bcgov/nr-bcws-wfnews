import { Component } from '@angular/core';
import { CARD_TEXTS } from '@app/constants';
import { defaultSlimButtonStyle } from '../../../common/wfnews-button/wfnews-button.component';

@Component({
  selector: 'other-burning-restrictions-card',
  templateUrl: './other-burning-restrictions-card.component.html',
  styleUrls: ['./other-burning-restrictions-card.component.scss']
})
export class OtherBurningRestrictionsCardComponent {

  talkToYourLocalAuthorityText = CARD_TEXTS.TALK_TO_YOUR_LOCAL_AUTHORITY;
  campgroundsText = CARD_TEXTS.CAMPGROUNDS;

  defaultSlimButtonStyle = defaultSlimButtonStyle;
  
  directToLink() {
    window.open('https://bcparks.ca/active-advisories/', '_blank');
  }
}
