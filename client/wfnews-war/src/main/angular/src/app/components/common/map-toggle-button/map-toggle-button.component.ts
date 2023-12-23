import { Component, EventEmitter, Input, Output } from '@angular/core';
import { MatButtonToggleChange } from '@angular/material/button-toggle';

@Component({
  selector: 'map-toggle-button',
  templateUrl: './map-toggle-button.component.html',
  styleUrls: ['./map-toggle-button.component.scss'],
})
export class MapToggleButtonComponent {
  @Input() labelText: string;
  @Input() labelIconPath: string;
  @Input() value: string;
  @Input() checked: boolean;
  @Output() changeEvent: EventEmitter<MatButtonToggleChange> =
    new EventEmitter();

  onButtonToggleChange(event: MatButtonToggleChange): void {
    this.changeEvent.emit(event);
  }
}
