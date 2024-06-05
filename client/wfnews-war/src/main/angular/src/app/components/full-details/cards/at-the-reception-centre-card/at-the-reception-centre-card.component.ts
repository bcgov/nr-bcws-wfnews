import { Component } from '@angular/core';
import { defaultSlimButtonStyle } from '@app/components/common/wfnews-button/wfnews-button.component';

@Component({
  // eslint-disable-next-line @angular-eslint/component-selector
  selector: 'at-the-reception-centre-card',
  templateUrl: './at-the-reception-centre-card.component.html',
  styleUrls: ['./at-the-reception-centre-card.component.scss']
})
export class AtTheReceptionCentreCardComponent {

  defaultSlimButtonStyle = defaultSlimButtonStyle;

  directToLink() {
    window.open('https://ess.gov.bc.ca/', '_blank');
  }
}
