import { Component, ChangeDetectionStrategy, Input } from "@angular/core";
import { EvacOrderOption } from "../../../conversion/models";

@Component({
  selector: 'incident-info-panel',
  templateUrl: './incident-info-panel.component.html',
  styleUrls: ['./incident-info-panel.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class IncidentInfoPanel {
  @Input() public incident
  @Input() public evacOrders: EvacOrderOption[] = []
}
