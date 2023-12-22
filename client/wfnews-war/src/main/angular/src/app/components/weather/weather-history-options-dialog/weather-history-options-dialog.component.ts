import {
  AfterViewInit,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  Inject,
  OnInit,
} from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { WeatherHistoryOptions } from '@app/services/application-state.service';

@Component({
  selector: 'wfone-weather-history-options-dialog',
  templateUrl: './weather-history-options-dialog.component.html',
  styleUrls: ['./weather-history-options-dialog.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class WeatherHistoryOptionsDialogComponent implements AfterViewInit {
  metrics = [
    {
      value: 'temp',
      title: 'Temperature',
    },
    {
      value: 'relativeHumidity',
      title: 'Relative Humidity',
    },
    {
      value: 'windSpeed',
      title: 'Wind Speed',
    },
    {
      value: 'windDirection',
      title: 'Wind Direction',
    },
    {
      value: 'precipitation',
      title: 'Precipitation',
    },
    {
      value: 'fineFuelMoistureCode',
      title: 'Fine Fuel Moisture Code',
    },
    {
      value: 'initialSpreadIndex',
      title: 'Initial Spread Index',
    },
    {
      value: 'fireWeatherIndex',
      title: 'Fire Weather Index',
    },
  ];

  selectedMetric = [null, null];
  selectedTimePeriod = 72;

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: WeatherHistoryOptions,
    private dialogRef: MatDialogRef<WeatherHistoryOptionsDialogComponent>,
    protected changeDetector: ChangeDetectorRef,
  ) {}

  ngAfterViewInit(): void {
    this.selectedMetric = this.data.chartDataSources.map(function(d) {
      return d.property;
    });

    this.selectedTimePeriod = this.data.historyLength;
  }

  selectedMetricChanged(selectedMetricIndex, ev) {
    const self = this;

    this.data.chartDataSources = this.selectedMetric.map(function(m) {
      return {
        property: m,
        title: self.metrics.find(function(mm) {
          return mm.value == m;
        }).title,
      };
    });
  }

  reportTimePeriodChanged() {
    this.data.historyLength = this.selectedTimePeriod;
  }

  isMetricSelected(selectedMetricIndex, metric) {
    return this.selectedMetric[selectedMetricIndex] == metric;
  }

  onAccept() {
    this.dialogRef.close(this.data);
  }

  get availableMetrics() {
    const self = this;

    return this.metrics.filter(function(m) {
      return self.data.includedSources.some(function(s) {
        return s.property == m.value;
      });
    });
  }
}
