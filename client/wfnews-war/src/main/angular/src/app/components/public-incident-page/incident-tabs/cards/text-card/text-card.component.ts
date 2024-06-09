import { Component, Input } from '@angular/core';

@Component({
  // eslint-disable-next-line @angular-eslint/component-selector
  selector: 'text-card',
  templateUrl: './text-card.component.html',
  styleUrls: ['./text-card.component.scss']
})
export class TextCardComponent {

  @Input() text;
  @Input() backgroundColor;
  @Input() textColor;
}
