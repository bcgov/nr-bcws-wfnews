import { Component } from '@angular/core';
import { defaultSlimIconButtonStyle } from '@app/components/common/icon-button/icon-button.component';

@Component({
  // eslint-disable-next-line @angular-eslint/component-selector
  selector: 'connect-with-local-authorities-card',
  templateUrl: './connect-with-local-authorities-card.component.html',
  styleUrls: ['./connect-with-local-authorities-card.component.scss']
})
export class ConnectWithLocalAuthoritiesCardComponent {

  defaultSlimIconButtonStyle = defaultSlimIconButtonStyle;
  
  directToLink() {
    window.open('https://www.civicinfo.bc.ca/directories', '_blank');
  }
}
