import { Component, Input } from '@angular/core';

@Component({
  // eslint-disable-next-line @angular-eslint/component-selector
  selector: 'icon-button',
  templateUrl: './icon-button.component.html',
  styleUrls: ['./icon-button.component.scss'],
})
export class IconButtonComponent {
  @Input() iconPath: string;
  @Input() label: string;
  @Input() componentStyle?: IconButtonStyle;
  @Input() clickHandler: () => void;
}

export const defaultSlimIconButtonStyle: IconButtonStyle = {
  slim: true,
  backgroundColor: 'transparent',
  border: '1px solid #C7C7C7',
  labelColor: '#242424'
};

export interface IconButtonArgs {
  iconPath: string;
  label: string;
  componentStyle?: IconButtonStyle;
  clickHandler: () => void;
}

export interface IconButtonStyle {
  backgroundColor: string;
  border: string;
  iconColor?: string;
  labelColor: string;
  overrideIconMask?: boolean;
  slim?: boolean;
}
