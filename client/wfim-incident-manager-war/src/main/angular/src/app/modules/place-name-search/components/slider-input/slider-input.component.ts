import {Component, EventEmitter, Input, Output} from '@angular/core';
import {FormControl} from '@angular/forms';

@Component({
  selector: 'wfim-slider-input',
  templateUrl: './slider-input.component.html',
  styleUrls: ['./slider-input.component.scss']
})
export class SliderInputComponent {
  public TOOLTIP_DELAY = 500;

  @Input()
  label: string;
  @Input()
  formControl: FormControl;
  @Input()
  min?: number;
  @Input()
  max?: number;
  @Input()
  step?: number;
  @Input()
  value?: number;
  @Output()
  change = new EventEmitter<number>();

  constructor() {}

  fireChangeEvent(newValue) {
    this.change.emit(newValue);
  }
}
