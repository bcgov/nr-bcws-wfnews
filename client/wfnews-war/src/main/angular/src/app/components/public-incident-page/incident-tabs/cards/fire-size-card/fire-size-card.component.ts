import { Component, Input } from '@angular/core';

@Component({
  selector: 'fire-size-card',
  templateUrl: './fire-size-card.component.html',
  styleUrls: ['./fire-size-card.component.scss']
})
export class FireSizeCardComponent {
  @Input() fireSize = 0;
  @Input() description = 'Fire size is estimated and based on the most current information available.';
}
