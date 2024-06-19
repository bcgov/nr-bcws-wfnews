import { Component, EventEmitter, Input, Output } from '@angular/core';
import { defaultSlimIconButtonStyle } from '../../../../common/icon-button/icon-button.component';

@Component({
  selector: 'location-card',
  templateUrl: './location-card.component.html',
  styleUrls: ['./location-card.component.scss']
})
export class LocationCardComponent {
  @Input() traditionalTerritory: string;
  @Input() description: string;
  @Output() buttonClicked = new EventEmitter<void>();

  iconButtonStyle = { ...defaultSlimIconButtonStyle, iconColor: '#242424' };

  clickHandler() {
    this.buttonClicked.emit();
  }
}
