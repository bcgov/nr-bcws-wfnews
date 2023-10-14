import { AfterViewInit, Component } from "@angular/core"
import { PublishedIncidentService } from "@app/services/published-incident-service";
import { FireCentres } from "@app/utils";

@Component({
  selector: 'active-fires-widget',
  templateUrl: './active-fires-widget.component.html',
  styleUrls: ['./active-fires-widget.component.scss']
})
export class ActiveFiresWidget implements AfterViewInit {
  public startupComplete = false
  public selectedFireCentreCode = ''
  public fireCentreOptions = FireCentres
  public activeFires: number
  public activeFireOfNote: number
  public activeOutOfControl: number
  public activeBeingHeld: number
  public activeUnderControl: number
  public activeOutOfControlPct: number
  public activeBeingHeldPct: number
  public activeUnderControlPct: number
  public outOfControlData = []
  public beingHeldData = []
  public underControlData = []


  public outOfControlScheme = { domain: ['#FF0000', '#C2C2C2'] }
  public beingHeldScheme = { domain: ['#DADA19', '#C2C2C2'] }
  public underControlScheme = { domain: ['#98E600', '#C2C2C2'] }

  public chartSize = 180

  constructor(private publishedIncidentService: PublishedIncidentService) { }

  ngAfterViewInit (): void {
    this.queryData()
  }

  queryData () {
    this.startupComplete = false
    Promise.all([
      this.publishedIncidentService.fetchPublishedIncidents().toPromise(),
      this.publishedIncidentService.fetchPublishedIncidents(0, 9999, true, false).toPromise()
    ]).then(([activeIncidents, activeFoNIncidents ]) => {
      let fires = activeIncidents.collection.filter(f => f.stageOfControlCode !== 'OUT').concat(activeFoNIncidents.collection.filter(f => f.stageOfControlCode !== 'OUT'))

      if (this.selectedFireCentreCode && this.selectedFireCentreCode !== '') {
        fires = fires.filter(f => f.fireCentreCode === this.selectedFireCentreCode)
      }

      this.activeFires = fires.length
      this.activeFireOfNote = activeFoNIncidents.collection.length
      this.activeOutOfControl = fires.filter(f => f.stageOfControlCode === 'OUT_CNTRL').length
      this.activeBeingHeld = fires.filter(f => f.stageOfControlCode === 'HOLDING').length
      this.activeUnderControl = fires.filter(f => f.stageOfControlCode === 'UNDR_CNTRL').length

      this.outOfControlData = [{ name: "Out of Control", value: this.activeOutOfControl }, { name: "All Fires", value: this.activeFires }]
      this.beingHeldData = [{ name: "Being Held", value: this.activeBeingHeld }, { name: "All Fires", value: this.activeFires }]
      this.underControlData = [{ name: "Under Control", value: this.activeUnderControl }, { name: "All Fires", value: this.activeFires }]

      this.activeOutOfControlPct = Math.round((this.activeOutOfControl / this.activeFires) * 100) || 0
      this.activeBeingHeldPct = Math.round((this.activeBeingHeld / this.activeFires) * 100) || 0
      this.activeUnderControlPct = Math.round((this.activeUnderControl / this.activeFires) * 100) || 0

      this.startupComplete = true
    }).catch(err => {
      console.error(err)
    })
  }

  selectFireCentre (value) {
    this.queryData()
  }
}
