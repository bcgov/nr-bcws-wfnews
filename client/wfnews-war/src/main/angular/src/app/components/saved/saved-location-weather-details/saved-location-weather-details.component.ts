import { Component, Input, OnInit } from '@angular/core';
import { ActivatedRoute, ParamMap, Router } from '@angular/router';
import {
  PointIdService,
  WeatherDailyCondition,
  WeatherHourlyCondition,
  WeatherStationConditions,
} from '@app/services/point-id.service';
import {
  ResourcesRoutes,
  isMobileView,
  readableDate,
  readableHour,
} from '@app/utils';

@Component({
  selector: 'wfnews-saved-location-weather-details',
  templateUrl: './saved-location-weather-details.component.html',
  styleUrls: ['./saved-location-weather-details.component.scss'],
})
export class SavedLocationWeatherDetailsComponent implements OnInit {
  latitude: number;
  longitude: number;
  name: string;
  params: ParamMap;
  station: WeatherStationConditions;
  daily: WeatherDailyCondition;
  hourly: WeatherHourlyCondition;
  readableDate = readableDate;
  readableHour = readableHour;
  isMobileView = isMobileView;

  constructor(
    private route: ActivatedRoute,
    private pointIdService: PointIdService,
    private router: Router,
  ) {}

  ngOnInit(): void {
    this.route.queryParams.subscribe((params: ParamMap) => {
      this.params = params;
    });

    if (
      this.params &&
      this.params['latitude'] &&
      this.params['longitude'] &&
      this.params['name']
    ) {
      this.latitude = this.params['latitude'];
      this.longitude = this.params['longitude'];
      this.name = this.params['name'];
      this.fetchWeather(this.latitude, this.longitude);
    }
  }

  fetchWeather(latitude: number, longitude: number) {
    if (latitude && longitude) {
      this.pointIdService
        .fetchNearestWeatherStation(Number(latitude), Number(longitude))
        .then((response) => {
          if (response) {
            this.station = response;
            if (response.daily) {
this.daily = response.daily[0];
}
    if (response.hourly) {
      for (let i = 0; i < response.hourly.length; i++) {
        if (response.hourly[i].temp !== null) {
          this.hourly = response.hourly[i];
          break; // Exit the loop once a non-null temp is found
        }
      }
    }
          }
        })
        .catch((err) => console.error('Failed to fetch weather data: ' + err));
    }
  }

  back() {
    if (this.params['source'] && this.params['source'] === 'map') {
      this.router.navigate([ResourcesRoutes.ACTIVEWILDFIREMAP], {
        queryParams: {
          longitude: this.longitude,
          latitude: this.latitude,
        },
      });
    } else {
      this.router.navigate([ResourcesRoutes.SAVED_LOCATION], {
        queryParams: {
          name: this.name,
          latitude: this.latitude,
          longitude: this.longitude,
        },
      });
    }
  }
}
