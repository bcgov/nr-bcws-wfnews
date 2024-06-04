import { Component } from '@angular/core';

@Component({
  // eslint-disable-next-line @angular-eslint/component-selector
  selector: 'at-the-reception-centre-card',
  templateUrl: './at-the-reception-centre-card.component.html',
  styleUrls: ['./at-the-reception-centre-card.component.scss']
})
export class AtTheReceptionCentreCardComponent {

  directToLink() {
    window.open('https://ess.gov.bc.ca/');
  }
}
