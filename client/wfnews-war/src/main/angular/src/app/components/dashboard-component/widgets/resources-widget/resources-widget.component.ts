import { AfterViewInit, Component } from '@angular/core';
import { PublishedIncidentService } from '@app/services/published-incident-service';
import { isMobileView, openLink } from '@app/utils';
import { AppConfigService } from '@wf1/core-ui';

@Component({
  selector: 'resources-widget',
  templateUrl: './resources-widget.component.html',
  styleUrls: ['./resources-widget.component.scss'],
})
export class ResourcesWidget implements AfterViewInit {
  public startupComplete = false;
  public situationReport;

  public isMobileView = isMobileView;
  openLink = openLink;
  wildfirePersonnelUrl = this.appConfigService.getConfig().externalAppConfig['wildfirePersonnelUrl'].toString();

  constructor(
    private publishedIncidentService: PublishedIncidentService,
    private appConfigService: AppConfigService,
  ) {}

  ngAfterViewInit(): void {
    this.publishedIncidentService
      .fetchSituationReportList(0, 10, true)
      .toPromise()
      .then((sitrep) => {
        if (sitrep?.collection?.length > 0) {
          const validReports = sitrep.collection.filter(
            (r) => r.publishedInd && !r.archivedInd,
          );
          validReports.sort((a, b) =>
            new Date(a.situationReportDate) > new Date(b.situationReportDate)
              ? -1
              : new Date(b.situationReportDate) >
                  new Date(a.situationReportDate)
                ? 1
                : 0,
          );
          this.situationReport = validReports[0];
        }

        this.startupComplete = true;
      });
  }
}
