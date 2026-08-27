import { Component, EventEmitter, HostBinding, Input, Output } from '@angular/core';

export type WfnewsButtonVariant =
  | 'primary'
  | 'secondary'
  | 'tertiary'
  | 'link'
  /** The two advisory ranks. They carry the wildfire domain colours, not the tokens. */
  | 'evacuationOrder'
  | 'evacuationAlert';
export type WfnewsButtonSize = 'xsmall' | 'small' | 'medium' | 'large';

/**
 * The one rectangular button. Its look comes from the BC Gov Design System Button and
 * nowhere else, so a caller picks a variant and a size and cannot send colours in.
 * Projected content sits before the label, for an icon.
 */
@Component({
  selector: 'wfnews-button',
  templateUrl: './wfnews-button.component.html',
  styleUrls: ['./wfnews-button.component.scss'],
})
export class WfnewsButtonComponent {
  @Input() label: string;
  @Input() variant: WfnewsButtonVariant = 'primary';
  @Input() size: WfnewsButtonSize = 'medium';
  /** Red, for an action the user cannot undo. */
  @Input() danger = false;
  /** A square that holds one icon. The caller must then give an ariaLabel. */
  @Input() iconOnly = false;
  @Input() disabled = false;
  /** Fills the width of the parent. A dialog on a phone wants this; a toolbar does not. */
  @HostBinding('class.full-width') @Input() fullWidth = false;
  @Input() type: 'button' | 'submit' | 'reset' = 'button';
  @Input() ariaLabel?: string;
  /**
   * An icon before the label, given as a path to an .svg file. A mask draws it, so it
   * takes the colour of the variant. iconPathEnd puts the icon after the label.
   *
   * A mask carries a shape and no colour. A two-colour icon would come out flat, so use
   * only single-colour icons here.
   */
  @Input() iconPath?: string;
  @Input() iconPathEnd?: string;
  @Output() buttonClicked = new EventEmitter<void>();

  clickHandler() {
    this.buttonClicked.emit();
  }
}
