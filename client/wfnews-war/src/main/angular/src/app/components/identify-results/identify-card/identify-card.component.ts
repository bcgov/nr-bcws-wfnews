import { Component, EventEmitter, Input, Output } from '@angular/core';
import { IdentifyKind, identifyKind } from '@app/utils/identify-results';
import { IdentifyLayout } from '../identify-variants';

export type IncidentLoad = 'loading' | 'done' | 'failed' | 'unavailable' | null;

/** One identify result, on the phone Drawer and in the desktop preview, as the card of its record type. */
@Component({
  selector: 'wfnews-identify-card',
  templateUrl: './identify-card.component.html',
  styleUrls: ['./identify-card.component.scss'],
})
export class IdentifyCardComponent {
  @Input() item: any;
  @Input() layout: IdentifyLayout = 'phone';
  /** A wildfire's published Incident, which the host loads. */
  @Input() incident: any;
  @Input() incidentLoad: IncidentLoad = null;
  @Output() retry = new EventEmitter<void>();

  get kind(): IdentifyKind | null {
    return identifyKind(this.item);
  }
}
