import { Component, Input } from '@angular/core';
import { FormGroup } from '@angular/forms';

@Component({
  selector: 'incident-details-panel',
  templateUrl: './incident-details-panel.component.html',
  styleUrls: ['./incident-details-panel.component.scss']
})
export class IncidentDetailsPanel {
  @Input() public readonly formGroup: FormGroup
  @Input() public incident
}
