import { Component } from '@angular/core';
import { formatWeatherHourRelative } from '@app/utils';
import { IdentifyCardBase } from '../identify-card-base';

@Component({
  selector: 'wfnews-identify-weather-station-card',
  templateUrl: './identify-weather-station-card.component.html',
})
export class IdentifyWeatherStationCardComponent extends IdentifyCardBase {
  get hour(): string {
    // Supplies its own "Today at"/"Yesterday at" prefix where one applies.
    return formatWeatherHourRelative(this.item?.data?.validHour?.hour);
  }
}
