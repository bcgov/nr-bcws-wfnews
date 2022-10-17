import { Component, ChangeDetectionStrategy, Input } from "@angular/core";

@Component({
  selector: 'incident-overview-panel',
  templateUrl: './incident-overview-panel.component.html',
  styleUrls: ['./incident-overview-panel.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class IncidentOverviewPanel {
  @Input() public incident
}
