import { Component, OnDestroy } from '@angular/core';

@Component({
  selector: 'weather-panel',
  templateUrl: './weather-panel.component.html',
  styleUrls: ['./weather-panel.component.scss'],
})
export class WeatherPanelComponent implements OnDestroy {
  public stationData;
  public hourly;
  public tempWindData;
  public precipHumidityData;

  ngOnDestroy(): void {
    (
      document.getElementsByClassName('smk-sidepanel').item(0) as HTMLElement
    ).style.removeProperty('width');
  }

  setWeatherStation(station) {
    this.stationData = station;
    this.hourly = station.hourly[0].temperature
      ? station.hourly[0]
      : station.hourly[1];

    this.tempWindData = [];
    this.precipHumidityData = [];

    const tempWindDataHolder = [];
    const precipHumidityDataHolder = [];
    const temp = {
      name: 'Temperature',
      series: [],
    };
    const humidity = {
      name: 'Relative Humidity',
      series: [],
    };
    const precip = {
      name: 'Precipitation',
      series: [],
    };
    const wind = {
      name: 'Windspeed',
      series: [],
    };
    tempWindDataHolder.push(...[temp, wind]);
    precipHumidityDataHolder.push(...[humidity, precip]);
    for (const hour of station.hourly) {
      const name = this.convertName(hour.hour);
      if (hour.temp) {
        temp.series.push({
          name,
          value: hour.temp || 0,
        });
      }
      if (hour.relativeHumidity) {
        humidity.series.push({
          name,
          value: hour.relativeHumidity || 0,
        });
      }
      if (hour.precipitation) {
        precip.series.push({
          name,
          value: hour.precipitation || 0,
        });
      }
      if (hour.windSpeed) {
        wind.series.push({
          name,
          value: hour.windSpeed || 0,
        });
      }
    }

    // Workaround to force update
    this.tempWindData = [...tempWindDataHolder];
    this.precipHumidityData = [...precipHumidityDataHolder];
  }

  convertName(name: string) {
    return (
      name.substring(4, 6) +
      '-' +
      name.substring(6, 8) +
      ' ' +
      name.substring(8, 10) +
      ':00'
    );
  }
}
