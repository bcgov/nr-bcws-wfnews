import { AfterViewInit, Component } from "@angular/core"
import { PublishedIncidentService } from "@app/services/published-incident-service"

@Component({
  selector: 'summary-widget',
  templateUrl: './summary-widget.component.html',
  styleUrls: ['./summary-widget.component.scss']
})
export class SummaryWidget implements AfterViewInit {
  public startupComplete = false

  public activeFires: string
  public starts24hour: string
  public starts7Day: string
  public out7Day: string

  constructor(private publishedIncidentService: PublishedIncidentService) { }

  ngAfterViewInit (): void {
    Promise.all([
      this.publishedIncidentService.getActiveFireCount(),
      this.publishedIncidentService.fetchPublishedIncidents().toPromise(),
      this.publishedIncidentService.fetchPublishedIncidents(0, 9999, true, false).toPromise(),
      this.publishedIncidentService.fetchOutIncidents(0, 9999).toPromise()
    ]).then(([activeCount, activeIncidents, activeFoNIncidents,outIncidents ]) => {
      const outFires = outIncidents.collection.filter(f => f.stageOfControlCode === 'OUT')
      const fires = activeIncidents.collection.filter(f => f.stageOfControlCode !== 'OUT').concat(activeFoNIncidents.collection.filter(f => f.stageOfControlCode !== 'OUT'))

      this.activeFires = '' + activeCount
      this.starts24hour = '' + (fires.filter(f => f.discoveryDate > Date.now() - 86400000).length + outFires.filter(f => f.discoveryDate > Date.now() - 86400000).length)
      this.starts7Day = '' + (fires.filter(f => f.discoveryDate > Date.now() - 604800000).length + outFires.filter(f => f.discoveryDate > Date.now() - 604800000).length)
      this.out7Day = '' + (outFires.filter(f => f.discoveryDate > Date.now() - 604800000).length)

      this.startupComplete = true
    }).catch(err => {
      console.error(err)
    })
  }
}
