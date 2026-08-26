import { Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
  selector: 'wfnews-button',
  templateUrl: './wfnews-button.component.html',
  styleUrls: ['./wfnews-button.component.scss'],
})
export class WfnewsButtonComponent {
  @Input() label: string;
  @Input() componentStyle?: WfnewsButtonStyle;
  @Input() isVisible?: boolean = true;
  /**
   * Render a real <button> instead of the clickable div. A div cannot take focus, so the
   * keypress handler on it never fires from a keyboard. Opt in; the default is unchanged.
   */
  @Input() nativeButton = false;
  @Output() buttonClicked = new EventEmitter<void>();

  clickHandler() {
    this.buttonClicked.emit();
  }
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
}

export interface WfnewsButtonStyle {
  backgroundColor: string;
  border: string;
  labelColor: string;
  slim?: boolean;
}
