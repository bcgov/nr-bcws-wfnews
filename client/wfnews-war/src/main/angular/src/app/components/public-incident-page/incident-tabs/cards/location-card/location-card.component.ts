import { Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
  selector: 'location-card',
  templateUrl: './location-card.component.html',
  styleUrls: ['./location-card.component.scss']
})
export class LocationCardComponent {
  @Input() traditionalTerritory: string;
  @Input() description: string;
  @Output() buttonClicked = new EventEmitter<void>();


  clickHandler() {
    this.buttonClicked.emit();
  }
}
