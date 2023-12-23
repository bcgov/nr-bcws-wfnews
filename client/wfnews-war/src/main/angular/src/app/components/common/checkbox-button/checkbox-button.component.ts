import { Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
  selector: 'checkbox-button',
  templateUrl: './checkbox-button.component.html',
  styleUrls: ['./checkbox-button.component.scss'],
})
export class CheckboxButtonComponent {
  @Input() checked: boolean;
  @Output() checkedChange = new EventEmitter<boolean>();

  toggle() {
    this.checked = !this.checked;
    this.checkedChange.emit(this.checked);
  }
}
