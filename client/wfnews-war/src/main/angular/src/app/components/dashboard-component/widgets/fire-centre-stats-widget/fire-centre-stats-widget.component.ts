import { AfterViewInit, Component } from '@angular/core';
import { Router } from '@angular/router';
import { PublishedIncidentService } from '@app/services/published-incident-service';
import { FireCentres, currentFireYear, snowPlowHelper } from '@app/utils';
import { AppConfigService } from '@wf1/core-ui';

@Component({
  selector: 'fire-centre-stats-widget',
  templateUrl: './fire-centre-stats-widget.component.html',
  styleUrls: ['./fire-centre-stats-widget.component.scss'],
})
export class FireCentreStatsWidget implements AfterViewInit {
  public startupComplete = false;
  public viewWildfireCounts = false;

  public fireCentreTotals = [];
  public fireCentreHectares = [];

  public colorScheme = {
    domain: ['#DCA237', '#3070AD', '#C66526', '#469C76', '#EEE461', '#C17DA5'],
  };

  private fireCentres = FireCentres;
  public snowPlowHelper = snowPlowHelper


  constructor(
    private publishedIncidentService: PublishedIncidentService,
    private appConfigService: AppConfigService,
    private router: Router
  ) {}

  ngAfterViewInit(): void {
    Promise.all([
      this.publishedIncidentService
        .fetchStatistics(currentFireYear(), null)
        .toPromise(),
    ])
      .then(([stats]) => {
        for (const fc of this.fireCentres) {
          const currentYearActive =
            stats
              .filter((f) => f.fireCentre === fc.description)
              .reduce(
                (
                  n,
                  {
                    activeBeingHeldFires,
                    activeBeingHeldFiresOfNote,
                    activeOutOfControlFires,
                    activeOutOfControlFiresOfNote,
                    activeUnderControlFires,
                    activeUnderControlFiresOfNote,
                    outFires,
                  },
                ) =>
                  n +
                  activeBeingHeldFires +
                  activeBeingHeldFiresOfNote +
                  activeOutOfControlFires +
                  activeOutOfControlFiresOfNote +
                  activeUnderControlFires +
                  activeUnderControlFiresOfNote +
                  outFires,
                0,
              ) || 0;

          this.fireCentreTotals.push({
            name: fc.description.replace(' Fire Centre', ''),
            value: currentYearActive,
          });

          this.fireCentreHectares.push({
            name: fc.description.replace(' Fire Centre', ''),
            value:
              Math.round(
                stats.find((f) => f.fireCentre === fc.description)
                  ?.hectaresBurned,
              ) || 0,
          });
        }

        this.startupComplete = true;
      })
      .catch((err) => {
        console.error(err);
      });
  }

  toggleViewWildfireCounts(label: string) {
    this.viewWildfireCounts = !this.viewWildfireCounts;
    this.snowplowCaller(label)
  }

  snowplowCaller(label) {
    const url = this.appConfigService.getConfig().application.baseUrl.toString() + this.router.url.slice(1);
    this.snowPlowHelper(url, {
      action: 'dashboard_click',
      text: label,
    });
  }
}
