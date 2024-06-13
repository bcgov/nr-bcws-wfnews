import { Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
  selector: 'icon-button',
  templateUrl: './icon-button.component.html',
  styleUrls: ['./icon-button.component.scss'],
})
export class IconButtonComponent {
  @Input() iconPath: string;
  @Input() label: string;
  @Input() componentStyle?: IconButtonStyle;
  @Output() buttonClicked = new EventEmitter<void>();

  clickHandler() {
    this.buttonClicked.emit();
  }
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
}

export interface IconButtonStyle {
  backgroundColor: string;
  border: string;
  iconColor?: string;
  labelColor: string;
  overrideIconMask?: boolean;
  slim?: boolean;
}
