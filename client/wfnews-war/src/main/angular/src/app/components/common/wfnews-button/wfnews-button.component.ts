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

export const defaultSlimButtonStyle: WfnewsButtonStyle = {
  slim: true,
  backgroundColor: 'transparent',
  border: '1px solid #C7C7C7',
  labelColor: '#242424'
};

export interface WfnewsButtonArgs {
  iconPath: string;
  label: string;
  componentStyle?: WfnewsButtonStyle;
  clickHandler: () => void;
}

export interface WfnewsButtonStyle {
  backgroundColor: string;
  border: string;
  labelColor: string;
  slim?: boolean;
}
