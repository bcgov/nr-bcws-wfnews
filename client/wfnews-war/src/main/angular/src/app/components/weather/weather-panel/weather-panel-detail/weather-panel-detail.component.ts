import { Component, Input, ViewEncapsulation } from '@angular/core';
import {
  formatWeatherDailyObservation,
  readableDate,
  readableHour,
} from '@app/utils';

@Component({
  selector: 'wfnews-weather-panel-detail',
  templateUrl: './weather-panel-detail.component.html',
  styleUrls: ['./weather-panel-detail.component.scss'],
})
export class WeatherPanelDetailComponent {
  @Input() hourly: any;
  @Input() daily: any;
  @Input() latitude: any;
  @Input() longitude: any;
  @Input() stationData: any;

  readableDate = readableDate;
  readableHour = readableHour;
  formatWeatherDailyObservation = formatWeatherDailyObservation;
}
