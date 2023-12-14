import { AfterViewInit, Component } from "@angular/core"
import { DomSanitizer } from "@angular/platform-browser";
import { PublishedIncidentService } from "@app/services/published-incident-service"
import * as Editor from '@ckeditor/ckeditor5-build-decoupled-document';
import moment from "moment";

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
      if (sitrep?.collection?.length > 0) {
        const validReports = sitrep.collection.filter(r => r.publishedInd && !r.archivedInd)
        validReports.sort((a,b) => (a.createdTimestamp > b.createdTimestamp) ? 1 : (a.createdTimestamp < b.createdTimestamp) ? -1 : 0)
        this.situationReport = validReports[validReports.length - 1]
        this.situationReport.situationReportDate = moment(new Date(this.situationReport.createdTimestamp + 86000000)).format('MMM Do YYYY')
      }

      this.startupComplete = true
    })
  }
}
