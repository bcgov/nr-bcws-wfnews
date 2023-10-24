import { AfterViewInit, Component } from "@angular/core"
import { PublishedIncidentService } from "@app/services/published-incident-service"
import { FireCentres, currentFireYear } from "@app/utils"

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
      this.publishedIncidentService.fetchStatistics(currentFireYear() - 1).toPromise(),
      this.publishedIncidentService.fetchStatistics(currentFireYear()).toPromise()
    ]).then(([previousYearStats, stats ]) => {
      for (const fc of this.fireCentres) {
        const currentYearActive = stats.filter(f => f.fireCentre === fc.description).reduce((n, { activeBeingHeldFires, activeOutOfControlFires, activeUnderControlFires }) => n + activeBeingHeldFires + activeOutOfControlFires + activeUnderControlFires, 0) || 0
        const previousYearActive = previousYearStats.filter(f => f.fireCentre === fc.description).reduce((n, { activeBeingHeldFires, activeOutOfControlFires, activeUnderControlFires }) => n + activeBeingHeldFires + activeOutOfControlFires + activeUnderControlFires, 0) || 0

        this.fireCentreTotals.push({
          name: fc.description.replace(' Fire Centre', ''),
          value: currentYearActive + previousYearActive
        })

        this.fireCentreHectares.push({
          name: fc.description.replace(' Fire Centre', ''),
          value: Math.round(stats.find(f => f.fireCentre === fc.description)?.hectaresBurned) || 0
        })
      }

      this.startupComplete = true
    }).catch(err => {
      console.error(err)
    })
  }
}
