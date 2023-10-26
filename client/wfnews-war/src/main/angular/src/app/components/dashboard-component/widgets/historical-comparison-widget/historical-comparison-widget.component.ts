import { AfterViewInit, Component } from "@angular/core"
import { PublishedIncidentService } from "@app/services/published-incident-service"
import { currentFireYear } from "@app/utils"

@Component({
  selector: 'historical-comparison-widget',
  templateUrl: './historical-comparison-widget.component.html',
  styleUrls: ['./historical-comparison-widget.component.scss']
})
export class HistoricalComparisonWidget implements AfterViewInit {
  public startupComplete = false
  public viewWildfireCounts = false

  public wildfireTotals = []
  public hectareTotals = []

  public colorScheme = {
    domain: ['#146FB4', '#146FB4', '#146FB4', '#146FB4', '#146FB4', '#8D8D8D']
  };

  constructor(private publishedIncidentService: PublishedIncidentService) { }

  ngAfterViewInit (): void {
    this.loadHistoricalData().then(() => {
      this.startupComplete = true
      console.log('startup complete')
    })
  }

  async loadHistoricalData () {
    const fireYear = currentFireYear()
    const capYear = fireYear - 4
    let totalHectares = 0
    let totalFires = 0
    let year = fireYear
    while (year >= fireYear - 19) {
      // set FC to BC
      const result = await this.publishedIncidentService.fetchStatistics(year).toPromise()

      const fireCount = result.reduce((n, { activeBeingHeldFires, activeOutOfControlFires, activeUnderControlFires, outFires }) => n + activeBeingHeldFires + activeOutOfControlFires + activeUnderControlFires + outFires, 0) || 0
      totalFires += fireCount

      const burnedHectares = result.reduce((n, { hectaresBurned }) => n + hectaresBurned, 0) || 0
      totalHectares += burnedHectares

      if (year >= capYear) {
        this.wildfireTotals.push({
          name: '' + year,
          value: fireCount
        })

        this.hectareTotals.push({
          name: '' + year,
          value: burnedHectares
        })
      }

      year -= 1
    }

    const averageHectaresBurned = Math.round(totalHectares / 20)
    const averageWildfires = Math.round(totalFires / 20)

    this.wildfireTotals.push({
      name: '20-Year Average',
      value: averageWildfires
    })

    this.hectareTotals.push({
      name: '20-Year Average',
      value: averageHectaresBurned
    })
  }
}
