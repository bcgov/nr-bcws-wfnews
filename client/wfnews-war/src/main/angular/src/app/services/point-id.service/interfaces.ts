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
  [key: string]: any;
  stationCode: string;
  stationName: string;
  lat?: string;
  lon?: string;
  elevation: string;
  distance: string;
}

export interface WeatherStationConditions extends WeatherStation {
  hourly: WeatherHourlyCondition[];
  daily: WeatherDailyCondition[];
}

export interface WeatherStationResult {
  [key: string]: any;
  stations: WeatherStationConditions[];
}
