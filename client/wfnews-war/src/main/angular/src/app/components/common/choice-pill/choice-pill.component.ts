import { Component, EventEmitter, HostBinding, Input, Output } from '@angular/core';

/**
 * The selectable pill, as the Saved radius choices show it. The look comes from the
 * wf1-choice-pill mixin, so a caller cannot send colours in.
 * Projected content sits before the label, for an icon; an iconEnd attribute puts it after.
 */
@Component({
  selector: 'wfnews-choice-pill',
  templateUrl: './choice-pill.component.html',
  styleUrls: ['./choice-pill.component.scss'],
})
export class ChoicePillComponent {
  @Input() label?: string;
  @Input() selected = false;
  /** False for a pill that opens a dialog. Selected then shows a filter is on, not a press. */
  @Input() toggle = true;
  /** A 36px circle that holds one icon. The caller must then give an ariaLabel. */
  @HostBinding('class.icon-only') @Input() iconOnly = false;
  @Input() disabled = false;
  @Input() ariaLabel?: string;
  @Output() pillClicked = new EventEmitter<void>();
}
