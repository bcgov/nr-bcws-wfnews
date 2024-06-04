import { Component, Input } from '@angular/core';

@Component({
  // eslint-disable-next-line @angular-eslint/component-selector
  selector: 'wfnews-button',
  templateUrl: './wfnews-button.component.html',
  styleUrls: ['./wfnews-button.component.scss'],
})
export class WfnewsButtonComponent {
  @Input() label: string;
  @Input() componentStyle?: WfnewsButtonStyle;
  @Input() clickHandler: () => void;
}

export interface WfnewsButtonArgs {
  iconPath: string;
  label: string;
  componentStyle?: WfnewsButtonStyle;
  clickHandler: () => void;
}

interface WfnewsButtonStyle {
  backgroundColor: string;
  border: string;
  labelColor: string;
}
