import { Component, Input } from '@angular/core';
import { defaultSlimIconButtonStyle } from '@app/components/common/icon-button/icon-button.component';

@Component({
  selector: 'connect-with-local-authorities-card',
  templateUrl: './connect-with-local-authorities-card.component.html',
  styleUrls: ['./connect-with-local-authorities-card.component.scss']
})
export class ConnectWithLocalAuthoritiesCardComponent {

  @Input() localAuthority: string;

  defaultSlimIconButtonStyle = defaultSlimIconButtonStyle;
  
  directToLink() {
    window.open('https://www.civicinfo.bc.ca/directories', '_blank');
  }
}
