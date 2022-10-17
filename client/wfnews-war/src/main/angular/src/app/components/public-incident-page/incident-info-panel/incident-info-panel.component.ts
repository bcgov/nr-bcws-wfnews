import { Component, ChangeDetectionStrategy, Input } from "@angular/core";
import { AreaRestrictionsOption, EvacOrderOption } from "../../../conversion/models";

@Component({
  selector: 'incident-info-panel',
  templateUrl: './incident-info-panel.component.html',
  styleUrls: ['./incident-info-panel.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class IncidentInfoPanel {
  @Input() public incident: any
  @Input() public evacOrders: EvacOrderOption[] = []
  @Input() public areaRestrictions : AreaRestrictionsOption[] = []

  public getStageOfControlLabel (code: string) {
    if (code.toUpperCase().trim() === 'OUT') return 'Out'
    else if (code.toUpperCase().trim() === 'OUT_CNTRL') return 'Out of Control'
    else if (code.toUpperCase().trim() === 'HOLDING') return 'Holding'
    else if (code.toUpperCase().trim() === 'UNDR_CNTRL') return 'Under Control'
    else return 'Unknown'
  }

  public getStageOfControlDescription (code: string) {
    if (code.toUpperCase().trim() === 'OUT') return 'A wildfire that has been extinguished.'
    else if (code.toUpperCase().trim() === 'OUT_CNTRL') return 'A wildfire that is continuing to spread, or is not responding to suppression efforts.'
    else if (code.toUpperCase().trim() === 'HOLDING') return 'We need a description for holding'
    else if (code.toUpperCase().trim() === 'UNDR_CNTRL') return 'We ned a description of under control'
    else return 'Unknown stage of control'
  }

  public getCauseLabel (code: number) {
    if (code === 1) return 'Human'
    else if (code === 2) return 'Lightning / Natural'
    else if (code === 3) return 'Under Investigation'
    else return 'Unknown'
  }

  public getCauseDescription (code: number) {
    if (code === 1) return 'A wildfire started by humans or human activity.'
    else if (code === 2) return 'A wildfire started by natural causes.'
    else if (code === 3) return 'A wildfire of undetermined cause, including a wildfire that is currently under investigation, as well as one where the investigation has been completed.'
    else return 'A wildfire of undetermined cause, including a wildfire that is currently under investigation, as well as one where the investigation has been completed.'
  }
}
