import { AfterViewInit, Component } from "@angular/core"
import { PublishedIncidentService } from "@app/services/published-incident-service"
import { FireCentres } from "@app/utils"

@Component({
  selector: 'fire-centre-stats-widget',
  templateUrl: './fire-centre-stats-widget.component.html',
  styleUrls: ['./fire-centre-stats-widget.component.scss']
})
export class FireCentreStatsWidget implements AfterViewInit {
  public startupComplete = false
  public viewWildfireCounts = false

  public fireCentreTotals = []
  public fireCentreHectares = []

  private fireCentres = FireCentres

  public colorScheme = {
    domain: ['#95A4FC', '#A1E3CB', '#8D8D8D', '##B1E3FF', '#BAEDBD', '#A8C5DA']
  };

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

      for (const fire of fires) {
        if (!fire.incidentSizeEstimatedHa) {
          fire.incidentSizeEstimatedHa = 0
        }
      }

      for (const fc of this.fireCentres) {
        const firesByCentre = fires.filter(f => f.fireCentreCode === fc.code || f.fireCentreName === fc.description)
        this.fireCentreTotals.push({
          name: fc.description.replace(' Fire Centre', ''),
          value: firesByCentre.length
        })

        this.fireCentreHectares.push({
          name: fc.description.replace(' Fire Centre', ''),
          value: Math.round(firesByCentre.reduce((n, { incidentSizeEstimatedHa }) => n + incidentSizeEstimatedHa, 0) || 0) || 0
        })
      }

      this.startupComplete = true
    }).catch(err => {
      console.error(err)
    })
  }
}
