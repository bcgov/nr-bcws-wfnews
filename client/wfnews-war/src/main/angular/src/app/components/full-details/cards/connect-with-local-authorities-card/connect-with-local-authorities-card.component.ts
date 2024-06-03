import { Component } from '@angular/core';

@Component({
  // eslint-disable-next-line @angular-eslint/component-selector
  selector: 'connect-with-local-authorities-card',
  templateUrl: './connect-with-local-authorities-card.component.html',
  styleUrls: ['./connect-with-local-authorities-card.component.scss']
})
export class ConnectWithLocalAuthoritiesCardComponent {

  directToLink() {
    window.open('https://www.civicinfo.bc.ca/directories');
  }
}
