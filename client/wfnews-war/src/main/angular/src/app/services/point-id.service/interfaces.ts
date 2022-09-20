import { Type } from "@angular/core";

export interface WeatherHourlyCondition {
    hour: string;
    index: number;
    // forecastInd: string;
    temp: number;
    relativeHumidity: number;
    windSpeed: number;
    windDirection: number;
    windCardinalDir: string;
    precipitation: number;
    // buildupIndex: number;
    fineFuelMoistureCode: number;
    initialSpreadIndex: number;
    fireWeatherIndex: number;
}

export interface WeatherDailyCondition {
    day: string;
    index: number;
    forecastInd: boolean;
    temp: number;
    relativeHumidity: number;
    windSpeed: number;
    windDirection: number;
    windCardinalDir: string;
    precipitation: number;
    buildupIndex: number;
    fineFuelMoistureCode: number;
    initialSpreadIndex: number;
    fireWeatherIndex: number;
}

export interface WeatherStation {
    stationCode: string;
    stationName: string;
    lat?: string;
    lon?: string;
    elevation: string;
    distance: string;
    [ key: string ]: any;
}

export interface WeatherStationConditions extends WeatherStation {
    hourly: WeatherHourlyCondition[];
    daily: WeatherDailyCondition[];
}

export interface WeatherStationResult {
    stations: WeatherStationConditions[];
    [ key: string ]: any;
}
