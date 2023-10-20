import { AfterViewInit, Component } from "@angular/core"
import { PublishedIncidentService } from "@app/services/published-incident-service"

@Component({
  selector: 'resources-widget',
  templateUrl: './resources-widget.component.html',
  styleUrls: ['./resources-widget.component.scss']
})
export class ResourcesWidget implements AfterViewInit {
  public startupComplete = false
  public situationReport

  constructor(private publishedIncidentService: PublishedIncidentService) { }

  ngAfterViewInit (): void {
    this.publishedIncidentService.fetchSituationReportList(0, 10, true, true).toPromise()
    .then(sitrep => {
      if (sitrep && sitrep.collection && sitrep.collection.length > 0) {
        const validReports = sitrep.collection.filter(r => r.publishedInd && !r.archivedInd)
        validReports.sort((a,b) =>(a.situationReportDate > b.situationReportDate) ? 1 : ((b.situationReportDate > a.situationReportDate) ? -1 : 0))
        this.situationReport = validReports[0]
      }

      this.startupComplete = true
    })
  }
}
