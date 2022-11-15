import { Component, ChangeDetectionStrategy, Input, AfterViewInit } from "@angular/core";
import { AreaRestrictionsOption, EvacOrderOption } from "../../../conversion/models";
import { toCanvas } from 'qrcode'

@Component({
  selector: 'incident-info-panel',
  templateUrl: './incident-info-panel.component.html',
  styleUrls: ['./incident-info-panel.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class IncidentInfoPanel implements AfterViewInit {
  @Input() public incident: any
  @Input() public evacOrders: EvacOrderOption[] = []
  @Input() public areaRestrictions : AreaRestrictionsOption[] = []

  ngAfterViewInit(): void {
    const canvas = document.getElementById('qr-code')
    toCanvas(canvas, window.location.href, function (error) {
      if (error) console.error(error)
    })
  }

  public getStageOfControlLabel (code: string) {
    if (code.toUpperCase().trim() === 'OUT') return 'Out'
    else if (code.toUpperCase().trim() === 'OUT_CNTRL') return 'Out of Control'
    else if (code.toUpperCase().trim() === 'HOLDING') return 'Holding'
    else if (code.toUpperCase().trim() === 'UNDR_CNTRL') return 'Under Control'
    else return 'Unknown'
  }

  public getStageOfControlDescription (code: string) {
    if (code.toUpperCase().trim() === 'OUT') return 'A wildfire that is extinguished. Suppression efforts are complete.'
    else if (code.toUpperCase().trim() === 'OUT_CNTRL') return 'A wildfire that is continuing to spread and is not responding to suppression efforts.'
    else if (code.toUpperCase().trim() === 'HOLDING') return 'A wildfire that is not likely to spread beyond predetermined boundaries under current conditions.'
    else if (code.toUpperCase().trim() === 'UNDR_CNTRL') return 'A wildfire that will not spread any further due to suppression efforts.'
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

  public printPage() {
    const printContents = document.getElementsByClassName('page-container')[0].innerHTML
    
    var appRoot = document.body.removeChild(document.getElementById("app-root"));

    document.body.innerHTML = printContents

    const canvas = document.getElementById('qr-code')
    toCanvas(canvas, window.location.href, function (error) {
      if (error) console.error(error)
      window.print()
      document.body.innerHTML = "";
      document.body.appendChild(appRoot);
    })
  }
}
