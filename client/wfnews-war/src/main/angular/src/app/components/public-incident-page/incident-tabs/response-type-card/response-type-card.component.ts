import { Component, Input } from '@angular/core';

@Component({
  // eslint-disable-next-line @angular-eslint/component-selector
  selector: 'response-type-card',
  templateUrl: './response-type-card.component.html',
  styleUrls: ['./response-type-card.component.scss']
})
export class ResponseTypeCardComponent {
  @Input() responseTypeCode: string;

  responseTypes = {
    full: 'FULL',
    modified: 'MODIFIED',
    monitored: 'MONITOR',
  };
}