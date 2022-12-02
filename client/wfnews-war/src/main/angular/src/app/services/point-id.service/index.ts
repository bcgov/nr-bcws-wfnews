import { Injectable } from "@angular/core";
import { HttpClient, HttpHeaders } from "@angular/common/http";
import { AppConfigService } from '@wf1/core-ui';
import { WeatherStationConditions, WeatherStationResult } from "./interfaces";

export { WeatherHourlyCondition, WeatherDailyCondition, WeatherStation, WeatherStationConditions, WeatherStationResult } from './interfaces'

const MAX_CACHE_AGE = 60 * 1000 //ms

@Injectable({ providedIn: 'root' })
export class PointIdService {
  baseAPIUrl
  cache = {}

  constructor(
    private http: HttpClient,
    private appConfigService: AppConfigService
  ) {
    this.baseAPIUrl = this.appConfigService.getConfig().rest.pointId;
  }

  fetch(url: string) {
    const self = this

    const now = Date.now()

    if (this.cache[url] && (now - this.cache[url].ts) < MAX_CACHE_AGE)
      return this.cache[url].result

    Object.keys(this.cache).forEach(function (url) {
      if ((now - self.cache[url].ts) < MAX_CACHE_AGE) return
      delete self.cache[url]
    })

    this.cache[url] = {
      ts: now,
      result: this.http.get(url, {
        headers: new HttpHeaders({
          // 'x-api-key': this.apiKey
        }),
      }).toPromise()
    }

    return this.cache[url].result
  }

  fetchWeatherStation(weatherStationId: string): Promise<WeatherStationConditions> {
    return this.fetch(`${this.baseAPIUrl}/weatherStation?code=${weatherStationId}&duration=3`)
      .then(function (resp: WeatherStationResult) {
        return resp.stations[0]
      })
  }

  fetchNearestWeatherStation(latitude: number, longitude: number): Promise<WeatherStationConditions> {
    return this.fetch(`${this.baseAPIUrl}/weather?lat=${latitude.toFixed(3)}&lon=${longitude.toFixed(3)}&duration=3`)
      .then(function (resp: WeatherStationResult) {
        return resp.stations[0]
      })
  }
}
