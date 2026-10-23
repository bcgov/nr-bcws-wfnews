import { Component, EventEmitter, Input, Output } from '@angular/core';

type IdentifyStatus = 'searching' | 'empty';

// The identify state before there are results. It is the results panel's box
// (the Drawer on mobile) and header, so the results replace it without a jump.
@Component({
  selector: 'wfnews-identify-status',
  templateUrl: './identify-status.component.html',
  styleUrls: ['./identify-status.component.scss'],
})
export class IdentifyStatusComponent {
  @Input() set status(value: IdentifyStatus | null) {
    this.current = value;
    // The Drawer keeps the last words while it slides out.
    if (value) {
      this.shown = value;
    }
  }
  get status(): IdentifyStatus | null {
    return this.current;
  }

  @Input() mobile = false;
  @Output() closed = new EventEmitter<void>();

  shown: IdentifyStatus | null = null;
  private current: IdentifyStatus | null = null;
}
