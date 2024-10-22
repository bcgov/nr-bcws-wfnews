import { Component } from '@angular/core';
import { defaultSlimButtonStyle } from '../../../common/wfnews-button/wfnews-button.component';

@Component({
  selector: 'other-burning-restrictions-card',
  templateUrl: './other-burning-restrictions-card.component.html',
  styleUrls: ['./other-burning-restrictions-card.component.scss']
})
export class OtherBurningRestrictionsCardComponent {

  defaultSlimButtonStyle = defaultSlimButtonStyle;
  
  directToLink() {
    window.open('https://bcparks.ca/active-advisories/', '_blank');
  }
}
