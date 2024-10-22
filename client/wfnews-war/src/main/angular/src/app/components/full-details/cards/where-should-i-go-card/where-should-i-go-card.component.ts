import { Component } from '@angular/core';
import { defaultSlimButtonStyle } from '@app/components/common/wfnews-button/wfnews-button.component';

@Component({
  selector: 'where-should-i-go-card',
  templateUrl: './where-should-i-go-card.component.html',
  styleUrls: ['./where-should-i-go-card.component.scss']
})
export class WhereShouldIGoCardComponent {

  defaultSlimButtonStyle = defaultSlimButtonStyle;

  directToLink() {
    window.open('https://www.drivebc.ca/', '_blank');
  }
}
