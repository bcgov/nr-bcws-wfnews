import { AfterViewInit, Component, Input } from "@angular/core"
import { PublishedIncidentService } from "@app/services/published-incident-service"
import { FireCentres, currentFireYear } from "@app/utils"

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

    Promise.all([
      this.publishedIncidentService.fetchStatistics(currentFireYear() - 1).toPromise(),
      this.publishedIncidentService.fetchStatistics(currentFireYear()).toPromise()
    ]).then(([previousYearStats, stats]) => {
      // fire counts
      const currentYearActive = stats.reduce((n, { activeBeingHeldFires, activeOutOfControlFires, activeUnderControlFires }) => n + activeBeingHeldFires + activeOutOfControlFires + activeUnderControlFires, 0) || 0
      const previousYearActive = previousYearStats.reduce((n, { activeBeingHeldFires, activeOutOfControlFires, activeUnderControlFires }) => n + activeBeingHeldFires + activeOutOfControlFires + activeUnderControlFires, 0) || 0
      const currentYearOut = stats.reduce((n, { outFires }) => n + outFires, 0) || 0
      // If this is a yearly totals sum, then we need to include outfires
      const totalFires = currentYearActive + previousYearActive + (this.yearly ? currentYearOut : 0)

      // counts by cause code
      const currentYearHuman = stats.reduce((n, { activeHumanCausedFires }) => n + activeHumanCausedFires, 0) || 0
      const previousYearHuman = previousYearStats.reduce((n, { activeHumanCausedFires }) => n + activeHumanCausedFires, 0) || 0
      const humanOut = stats.reduce((n, { extinguishedHumanCausedFires }) => n + extinguishedHumanCausedFires, 0) || 0

      const currentYearNatural = stats.reduce((n, { activeNaturalCausedFires }) => n + activeNaturalCausedFires, 0) || 0
      const previousYearNatural = previousYearStats.reduce((n, { activeNaturalCausedFires }) => n + activeNaturalCausedFires, 0) || 0
      const naturalOut = stats.reduce((n, { extinguishedNaturalCausedFires }) => n + extinguishedNaturalCausedFires, 0) || 0

      const currentYearUnknown = stats.reduce((n, { activeUnknownCausedFires }) => n + activeUnknownCausedFires, 0) || 0
      const previousYearUnknown = previousYearStats.reduce((n, { activeUnknownCausedFires }) => n + activeUnknownCausedFires, 0) || 0
      const unknownOut = stats.reduce((n, { extinguishedUnknownCausedFires }) => n + extinguishedUnknownCausedFires, 0) || 0

      // If this is a yearly totals sum, then we need to include outfires
      this.lightningFires = currentYearNatural + previousYearNatural + (this.yearly ? naturalOut : 0)
      this.lightningFiresPct = Math.round((this.lightningFires / totalFires) * 100) || 0
      this.humanFires = currentYearHuman + previousYearHuman + (this.yearly ? humanOut : 0)
      this.humanFiresPct = Math.round((this.humanFires / totalFires) * 100) || 0
      this.unknownFires = currentYearUnknown + previousYearUnknown + (this.yearly ? unknownOut : 0)
      this.unknownFiresPct = Math.round((this.unknownFires / totalFires) * 100) || 0

      this.startupComplete = true
    }).catch(err => {
      console.error(err)
    })
  }

  selectFireCentre (value) {
    this.queryData()
  }
}
