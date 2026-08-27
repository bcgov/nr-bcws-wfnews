import { Component, EventEmitter, Input, Output } from '@angular/core';

/**
 * A notice that a device setting stops a feature, with one action that corrects it.
 * The caller owns the words and the action, because each permission fails in its
 * own way: push has one failure state, location has two.
 */
@Component({
  selector: 'permission-banner',
  templateUrl: './permission-banner.component.html',
  styleUrls: ['./permission-banner.component.scss'],
})
export class PermissionBannerComponent {
  @Input() heading: string;
  @Input() message: string;
  @Input() actionLabel: string;
  @Input() icon = '/assets/images/svg-icons/custom_warning.svg';

  @Output() action = new EventEmitter<void>();
}
