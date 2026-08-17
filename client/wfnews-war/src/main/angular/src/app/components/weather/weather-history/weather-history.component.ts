import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  Input,
  OnInit,
  ViewChild,
} from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { ActivatedRoute, ParamMap, Router } from '@angular/router';
import { ApplicationStateService } from '@app/services/application-state.service';
import { GoogleChartsService } from '@app/services/google-charts.service';
import {
  formatWeatherDate,
  formatWeatherTimeOfDay,
  getCurrentCondition,
  weatherHourToDate,
} from '@app/utils';
import {
  PointIdService,
  WeatherHourlyCondition,
  WeatherStationConditions,
} from '../../../services/point-id.service';
import { WeatherHistoryOptionsDialogComponent } from '../weather-history-options-dialog/weather-history-options-dialog.component';

@Component({
  selector: 'wfnews-weather-history',
  templateUrl: './weather-history.component.html',
  styleUrls: ['./weather-history.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class WeatherHistoryComponent implements OnInit {
  @ViewChild('chart') chartContainer;
  @Input() latitude;
  @Input() longitude;

  params: ParamMap;
  loading = true;
  isMobileRes: boolean;
  weatherStation: WeatherStationConditions;
  currentCondition: WeatherHourlyCondition;

  constructor(
    protected changeDetector: ChangeDetectorRef,
    protected applicationStateService: ApplicationStateService,
    protected googleChartsService: GoogleChartsService,
    private dialog: MatDialog,
    protected router: Router,
    private pointIdService: PointIdService,
    private route: ActivatedRoute,
  ) {
    this.isMobileRes = this.applicationStateService.getIsMobileResolution();
  }

  ngOnInit(): void {
    this.route.queryParams.subscribe((params: ParamMap) => {
      this.params = params;
    });

    if ((this.latitude && this.longitude) || (this.params && this.params['latitude'] && this.params['longitude'])) {
      const latitude = this.latitude ?? this.params['latitude'];
      const longitude = this.longitude ?? this.params['longitude'];
      this.pointIdService
        .fetchNearestWeatherStation(
          Number(latitude),
          Number(longitude),
        )
        .then((response) => {
          this.setWeatherStation(response);
        });
    }
  }

  setLoading(loading: boolean) {
    this.loading = loading;
    this.changeDetector.markForCheck();
    this.changeDetector.detectChanges();
  }

  setWeatherStation(station: WeatherStationConditions) {
    this.weatherStation = station;
    this.currentCondition = getCurrentCondition(station);
    this.setLoading(false);
    this.showChart();
  }

  showChart() {
    const self = this;

    this.setLoading(true);

    const historyOpt = this.applicationStateService.getWeatherHistoryOptions();

    this.googleChartsService.getVisualization().then(function(vis) {
      self.setLoading(false);

      const data = new vis.DataTable();

      data.addColumn('date', 'Hour');

      const props = [];
        const titles = [];
      historyOpt.chartDataSources.forEach(function(ds) {
        data.addColumn('number', ds.title);
        data.addColumn({ type: 'string', role: 'tooltip', p: { html: true } });
        titles.push(ds.title);
        props.push(ds.property);
      });

      const range = new Date();
      range.setHours(range.getHours() - historyOpt.historyLength);
      range.setMinutes(0);
      range.setSeconds(0);
      range.setMilliseconds(0);

      self.weatherStation.hourly.forEach(function(c) {
        // The hourstamp is a fixed-UTC-8 wall clock, so resolve it to a real
        // instant rather than letting Date reinterpret it in the browser's
        // zone. The chart then plots it in the viewer's zone.
        const ts = weatherHourToDate(c.hour);

        if (!ts || ts.getTime() < range.getTime()) {
return;
}

        const r = [
          ts,
          ...props.reduce(function(acc, p, i) {
            return acc.concat(c[p], chartTooltip(titles[i], ts, c[p]));
          }, []),
        ];

        data.addRow(r);
      });

      const opt: google.visualization.LineChartOptions = {
        series: {
          0: { targetAxisIndex: 0 },
          1: { targetAxisIndex: 1 },
        },
        vAxes: {
          0: { title: historyOpt.chartDataSources[0].title },
          1: { title: historyOpt.chartDataSources[1].title },
        },
        hAxis: {},
        legend: {
          maxLines: 2,
          position: 'top',
        },
        tooltip: { isHtml: true },
        vAxis: {
          viewWindow: {},
        },
      };

      const chart = new vis.LineChart(self.chartContainer.nativeElement);

      chart.draw(data, opt);
      self.changeDetector.detectChanges();
    });

    function chartTooltip(title, ts, val) {
      return `
 <div>${title}: ${val}</div>
 <div>${formatWeatherDate(ts)}, ${formatWeatherTimeOfDay(ts)}</div>
 `;
    }
  }

  showOptions() {
    const self = this;

    const opts = this.applicationStateService.getWeatherHistoryOptions();

    opts.includedSources = [];

    if (this.currentCondition) {
      Object.keys(this.currentCondition).forEach(function(p) {
        if (
          self.weatherStation.hourly
            .map(function(c) {
              return c[p];
            })
            .some(function(v) {
              return v;
            })
        ) {
opts.includedSources.push({ property: p });
}
      });
    }

    window['snowplow'](
      'trackPageView',
      self.router.url + '#weather-history-options',
    );

    const dialog = this.dialog.open(WeatherHistoryOptionsDialogComponent, {
      width: '300px',
      data: opts,
      autoFocus: false,
    });

    return dialog
      .afterClosed()
      .toPromise()
      .then(function(result) {
        if (!result) {
          return;
        }

        self.applicationStateService.setWeatherHistoryOptions(result);
        self.showChart();
      });
  }
}
