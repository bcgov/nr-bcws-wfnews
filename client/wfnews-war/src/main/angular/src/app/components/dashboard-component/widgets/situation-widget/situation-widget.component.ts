import { AfterViewInit, Component } from "@angular/core"
import { DomSanitizer } from "@angular/platform-browser";
import { PublishedIncidentService } from "@app/services/published-incident-service"
import * as Editor from '@ckeditor/ckeditor5-build-decoupled-document';

@Component({
  selector: 'situation-widget',
  templateUrl: './situation-widget.component.html',
  styleUrls: ['./situation-widget.component.scss']
})
export class SituationWidget implements AfterViewInit {
  public startupComplete = false
  public situationReport

  public Editor = Editor

  constructor(private publishedIncidentService: PublishedIncidentService, private sanitizer: DomSanitizer) { }

  formatHtml (html: string) {
    return html // We don't want to execute script tags:: this.sanitizer.bypassSecurityTrustHtml(html)
  }

  public onReady (editor) {
    editor.enableReadOnlyMode('ck-doc')
  }

  ngAfterViewInit (): void {
    this.publishedIncidentService.fetchSituationReportList(0, 10, true, true).toPromise()
    .then(sitrep => {
      if (sitrep && sitrep.collection && sitrep.collection.length > 0) {
        const validReports = sitrep.collection.filter(r => r.publishedInd && !r.archivedInd)
        validReports.sort((a,b) =>(a.situationReportDate > b.situationReportDate) ? 1 : ((b.situationReportDate > a.situationReportDate) ? -1 : 0))
        this.situationReport = validReports[0]
        this.situationReport.situationReportDate = new Date(this.situationReport.situationReportDate)
      }

      this.startupComplete = true
    })
  }
}
