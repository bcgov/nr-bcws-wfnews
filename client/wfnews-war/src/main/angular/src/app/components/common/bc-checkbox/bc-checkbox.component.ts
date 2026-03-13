import { ChangeDetectorRef, Component, EventEmitter, forwardRef, Input, Output } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';

@Component({
  selector: 'bc-checkbox',
  templateUrl: './bc-checkbox.component.html',
  styleUrls: ['./bc-checkbox.component.scss'],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => BcCheckboxComponent),
      multi: true
    }
  ]
})
export class BcCheckboxComponent implements ControlValueAccessor {
  @Input() label: string;
  @Input() checked: boolean = false;
  @Input() disabled: boolean = false;
  @Input() ariaLabel: string;
  @Output() change = new EventEmitter<any>();

  private onChange: (value: any) => void = () => { };
  private onTouched: () => void = () => { };

  constructor(private cdr: ChangeDetectorRef) { }

  onInputChange(event: Event) {
    event.stopPropagation();
    const checkbox = event.target as HTMLInputElement;
    this.checked = checkbox.checked;
    this.onChange(this.checked);
    this.onTouched();
    this.change.emit({ checked: this.checked, source: this });
    this.cdr.detectChanges();
  }

  writeValue(value: any): void {
    this.checked = !!value;
    this.cdr.detectChanges();
  }

  registerOnChange(fn: any): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: any): void {
    this.onTouched = fn;
  }

  setDisabledState?(isDisabled: boolean): void {
    this.disabled = isDisabled;
    this.cdr.detectChanges();
  }
}
