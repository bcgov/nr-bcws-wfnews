import { Component, EventEmitter, Input, Output } from '@angular/core';

// The identify state before there are results. It is the results panel's box
// and header, so the results replace it without a jump.
@Component({
  selector: 'wfnews-identify-status',
  templateUrl: './identify-status.component.html',
  styleUrls: ['./identify-status.component.scss'],
})
export class IdentifyStatusComponent {
  @Input() status: 'searching' | 'empty';
  @Input() mobile = false;
  @Output() closed = new EventEmitter<void>();
}
