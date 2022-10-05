import { Component, Input } from '@angular/core';
import { FormGroup } from '@angular/forms';

@Component({
  selector: 'response-details-panel',
  templateUrl: './response-details-panel.component.html',
  styleUrls: ['./response-details-panel.component.scss']
})
export class ResponseDetailsPanel {
  @Input() public readonly formGroup: FormGroup;
  @Input() public incident;
}
