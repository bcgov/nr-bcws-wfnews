import { AfterViewInit, Component } from "@angular/core"
import { PublishedIncidentService } from "@app/services/published-incident-service"

@Component({
  selector: 'fire-totals-widget',
  templateUrl: './fire-totals-widget.component.html',
  styleUrls: ['./fire-totals-widget.component.scss']
})
export class FireTotalsWidget implements AfterViewInit {
  public startupComplete = false

  public totalFires = 0
  public outFires = 0
  public hectaresBurned = 0

  constructor(private publishedIncidentService: PublishedIncidentService) { }

  ngAfterViewInit (): void {
    Promise.all([
      this.publishedIncidentService.fetchPublishedIncidents().toPromise(),
      this.publishedIncidentService.fetchPublishedIncidents(0, 9999, true, false).toPromise(),
      this.publishedIncidentService.fetchOutIncidents(0, 9999).toPromise()
    ]).then(([activeIncidents, activeFoNIncidents, outIncidents ]) => {
      let fires = activeIncidents.collection.filter(f => f.stageOfControlCode !== 'OUT').concat(activeFoNIncidents.collection.filter(f => f.stageOfControlCode !== 'OUT'))

      const outFires = outIncidents.collection.filter(f => f.stageOfControlCode === 'OUT')
      fires = fires.concat(outFires)

      this.totalFires = fires.length + outFires.length
      this.outFires = outFires.length

      for (const fire of fires) {
        if (!fire.incidentSizeEstimatedHa) {
          fire.incidentSizeEstimatedHa = 0
        }
      }

      this.hectaresBurned = Math.round(fires.reduce((n, { incidentSizeEstimatedHa }) => n + incidentSizeEstimatedHa, 0) || 0) || 0

      this.startupComplete = true
    }).catch(err => {
      console.error(err)
    })
  }

  getFireYear () {
    const now = new Date()
    return now.getMonth() > 2 ? now.getFullYear() : now.getFullYear() -1
  }
}
