import { AfterViewInit, Component, Input } from "@angular/core"
import { PublishedIncidentService } from "@app/services/published-incident-service"
import { FireCentres } from "@app/utils"

@Component({
  selector: 'fire-cause-widget',
  templateUrl: './fire-cause-widget.component.html',
  styleUrls: ['./fire-cause-widget.component.scss']
})
export class FireCauseWidget implements AfterViewInit {
  @Input() public yearly = false

  public startupComplete = false
  public selectedFireCentreCode = ''
  public fireCentreOptions = FireCentres
  public lightningFires: number
  public humanFires: number
  public unknownFires: number
  public lightningFiresPct: number
  public humanFiresPct: number
  public unknownFiresPct: number

  constructor(private publishedIncidentService: PublishedIncidentService) { }

  ngAfterViewInit (): void {
    this.queryData()
  }

  queryData () {
    this.startupComplete = false

    const promises = [
      this.publishedIncidentService.fetchPublishedIncidents().toPromise(),
      this.publishedIncidentService.fetchPublishedIncidents(0, 9999, true, false).toPromise()
    ]

    if (this.yearly) {
      promises.push(this.publishedIncidentService.fetchOutIncidents(0, 9999).toPromise())
    }

    Promise.all(promises).then(([activeIncidents, activeFoNIncidents, outIncidents ]) => {
      let fires = activeIncidents.collection.filter(f => f.stageOfControlCode !== 'OUT').concat(activeFoNIncidents.collection.filter(f => f.stageOfControlCode !== 'OUT'))

      // If this is a yearly totals sum, then we need to include outfires
      // out fires promise will only be handled if yearly is true
      if (this.yearly && outIncidents) {
        const outFires = outIncidents.collection.filter(f => f.stageOfControlCode === 'OUT')
        fires = fires.concat(outFires)
      }

      if (this.selectedFireCentreCode && this.selectedFireCentreCode !== '') {
        fires = fires.filter(f => f.fireCentreCode === this.selectedFireCentreCode)
      }

      this.lightningFires = fires.filter(f => f.generalIncidentCauseCatId === 2).length
      this.lightningFiresPct = Math.round((this.lightningFires / fires.length) * 100) || 0
      this.humanFires = fires.filter(f => f.generalIncidentCauseCatId === 1).length
      this.humanFiresPct = Math.round((this.humanFires / fires.length) * 100) || 0
      this.unknownFires = fires.filter(f => f.generalIncidentCauseCatId === 3).length
      this.unknownFiresPct = Math.round((this.unknownFires / fires.length) * 100) || 0

      this.startupComplete = true
    }).catch(err => {
      console.error(err)
    })
  }

  selectFireCentre (value) {
    this.queryData()
  }
}
