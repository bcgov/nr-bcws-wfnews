import { Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
  selector: 'wfnews-select',
  templateUrl: './wfnews-select.component.html',
  styleUrls: ['./wfnews-select.component.scss'],
})
export class WfnewsSelectComponent {
  @Input() options: WfnewsSelectOption[];
  @Output() selectedValueChange = new EventEmitter<string>();

  selectedValue: number | string;

  changeHandler(event) {
    this.selectedValueChange.emit(event.target.value);
  }
}

export interface WfnewsSelectOption {
  value: number | string;
  label: string;
};
