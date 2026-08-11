import { ChangeDetectorRef, Component, OnDestroy } from '@angular/core';
import { formatWeatherHourRelative, hidePanel, showPanel } from '@app/utils';

@Component({
  selector: 'weather-panel',
  templateUrl: './weather-panel.component.html',
  styleUrls: ['./weather-panel.component.scss'],
})
export class WeatherPanelComponent implements OnDestroy {
  public stationData;
  public hourly;
  public daily;
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

    this.cdr.detectChanges()
  }

  formatHourlyData() {
    return formatWeatherHourRelative(this.hourly?.hour);
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
