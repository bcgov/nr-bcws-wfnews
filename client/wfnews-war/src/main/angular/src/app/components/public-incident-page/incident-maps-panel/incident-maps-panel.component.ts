import { Component, ChangeDetectionStrategy, Input } from "@angular/core";

@Component({
  selector: 'incident-maps-panel',
  templateUrl: './incident-maps-panel.component.html',
  styleUrls: ['./incident-maps-panel.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class IncidentMapsPanel {
  @Input() public incident
}
