import { Component, Input } from '@angular/core';

@Component({
  selector: 'text-card',
  templateUrl: './text-card.component.html',
  styleUrls: ['./text-card.component.scss']
})
export class TextCardComponent {

  @Input() text;
  @Input() backgroundColor;
  @Input() textColor;
}
