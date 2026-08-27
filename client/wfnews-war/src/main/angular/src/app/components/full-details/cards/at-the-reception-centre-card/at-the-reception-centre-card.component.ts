import { Component } from '@angular/core';

@Component({
  selector: 'at-the-reception-centre-card',
  templateUrl: './at-the-reception-centre-card.component.html',
  styleUrls: ['./at-the-reception-centre-card.component.scss']
})
export class AtTheReceptionCentreCardComponent {

  directToLink() {
    window.open('https://ess.gov.bc.ca/', '_blank');
  }
}
