import { Component, Input } from '@angular/core';

@Component({
  selector: 'connect-with-local-authorities-card',
  templateUrl: './connect-with-local-authorities-card.component.html',
  styleUrls: ['./connect-with-local-authorities-card.component.scss']
})
export class ConnectWithLocalAuthoritiesCardComponent {

  @Input() localAuthority: string;

  
  directToLink() {
    window.open('https://www.civicinfo.bc.ca/directories', '_blank');
  }
}
