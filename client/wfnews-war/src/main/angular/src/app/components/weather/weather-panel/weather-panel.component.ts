import { ChangeDetectorRef, Component, OnDestroy } from '@angular/core';
import { hidePanel, showPanel } from '@app/utils';

@Component({
  selector: 'weather-panel',
  templateUrl: './weather-panel.component.html',
  styleUrls: ['./weather-panel.component.scss'],
})
export class WeatherPanelComponent implements OnDestroy {
  public stationData;
  public hourly;
  public daily;
  public tempWindData;
  public precipHumidityData;
  public latitude;
  public longitude;

  constructor(
    protected cdr: ChangeDetectorRef,
  ) {}

  isDetailView = false;

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

    this.latitude = this.stationData.latitude;
    this.longitude = this.stationData.longitude;

    this.daily = station.daily && station.daily[0] ? station.daily[0] : null;

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
    this.cdr.detectChanges()
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

  formatHourlyData() {
    if (this.hourly?.hour){
      const year = parseInt(this.hourly.hour.substring(0, 4));
      const month = parseInt(this.hourly.hour.substring(4, 6)) - 1;
      const day = parseInt(this.hourly.hour.substring(6, 8));
      const hour = parseInt(this.hourly.hour.substring(8, 10));
      // JavaScript months are 0-based
    
      const date = new Date(year, month, day, hour);
      const now = new Date();
    
      // Calculate the difference in days
      const diffTime = Math.abs(now.getTime() - date.getTime());
      const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    
      let formattedDate = `${this.hourly.hour.substring(8, 10)}:00`;
    
      if (diffDays === 0) {
        formattedDate = `Today at ${formattedDate}`;
      } else if (diffDays === 1) {
        formattedDate = `Yesterday at ${formattedDate}`;
      } else {
        formattedDate = `${year}-${month + 1}-${day} at ${formattedDate}`;
      }
    
      return formattedDate;
    }
  }

  closePanel() {
    this.isDetailView = false;
    hidePanel('desktop-preview');
    this.cdr.detectChanges();
  }
  goBack(){
    if (this.isDetailView){
      this.isDetailView = !this.isDetailView
    }
    else{
      showPanel('identify-panel-wrapper')
      hidePanel('desktop-preview');
    }
  }

  enterFullDetail(){
    this.isDetailView = true;
  }
}
