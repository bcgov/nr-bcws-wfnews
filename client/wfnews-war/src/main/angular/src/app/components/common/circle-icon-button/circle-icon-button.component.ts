import { Component, Input } from '@angular/core';

@Component({
  selector: 'circle-icon-button',
  templateUrl: './circle-icon-button.component.html',
  styleUrls: ['./circle-icon-button.component.scss'],
})
export class CircleIconButtonComponent {
  @Input() iconPath: string;
  @Input() label: string;
  @Input() componentStyle?: CircleIconButtonStyle;
  @Input() clickHandler: () => void;
}

export interface CircleIconButtonArgs {
  iconPath: string;
  componentStyle?: CircleIconButtonStyle;
  clickHandler: () => void;
}

export interface CircleIconButtonStyle {
  backgroundColor: string;
  border: string;
  iconColor?: string;
  overrideIconMask?: boolean;
}
