import { AfterViewInit, Component } from '@angular/core';
import { Router } from '@angular/router';
import { PublishedIncidentService } from '@app/services/published-incident-service';
import { currentFireYear, snowPlowHelper } from '@app/utils';
import { AppConfigService } from '@wf1/core-ui';

@Component({
  selector: 'historical-comparison-widget',
  templateUrl: './historical-comparison-widget.component.html',
  styleUrls: ['./historical-comparison-widget.component.scss'],
})
export class HistoricalComparisonWidget implements AfterViewInit {
  public startupComplete = false;
  public viewWildfireCounts = false;

  public wildfireTotals = [];
  public hectareTotals = [];
  public fireYear: number;
  public snowPlowHelper = snowPlowHelper

  public colorScheme = {
    domain: ['#146FB4', '#146FB4', '#146FB4', '#146FB4', '#146FB4', '#8D8D8D'],
  };

  constructor(
    private publishedIncidentService: PublishedIncidentService,
    private appConfigService: AppConfigService,
    private router: Router
  ) {}

  ngAfterViewInit(): void {
    this.loadHistoricalData().then(() => {
      this.startupComplete = true;
    });
  }

  async loadHistoricalData() {
    this.fireYear = currentFireYear();
    const capYear = this.fireYear - 4;
    let totalHectares = 0;
    let totalFires = 0;
    let year = this.fireYear;

    // first (current) year fetched has 20 year averages. load the next 5 for counts.cd ..
    let averageHectaresBurned = 0;
    let averageWildfires = 0;
    while (year >= this.fireYear - 4) {
      const result = await this.publishedIncidentService
        .fetchStatistics(year)
        .toPromise();

      if (year === this.fireYear) {
        averageHectaresBurned = Math.round(result[0].hectaresBurned20YearAvg);
        averageWildfires = Math.round(result[0].incidentCount20YearAvg);
      }

      const fireCount =
        result.reduce(
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
      totalFires += fireCount;

      const burnedHectares =
        result.reduce((n, { hectaresBurned }) => n + hectaresBurned, 0) || 0;
      totalHectares += burnedHectares;

      if (year >= capYear) {
        this.wildfireTotals.push({
          name: '' + year,
          value: fireCount,
        });

        this.hectareTotals.push({
          name: '' + year,
          value: burnedHectares,
        });
      }

      year -= 1;
    }

    this.wildfireTotals.push({
      name: '20-Year Average',
      value: averageWildfires,
    });

    this.hectareTotals.push({
      name: '20-Year Average',
      value: averageHectaresBurned,
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
