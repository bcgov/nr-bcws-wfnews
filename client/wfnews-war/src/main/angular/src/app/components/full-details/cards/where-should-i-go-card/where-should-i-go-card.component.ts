import { Component } from '@angular/core';

@Component({
  // eslint-disable-next-line @angular-eslint/component-selector
  selector: 'where-should-i-go-card',
  templateUrl: './where-should-i-go-card.component.html',
  styleUrls: ['./where-should-i-go-card.component.scss']
})
export class WhereShouldIGoCardComponent {

  directToLink() {
    window.open('https://www.drivebc.ca/');
  }
}
