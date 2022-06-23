export interface GeographyResult {
  errorCount: number;
  errorMsg: string;
  errorDetail: string;
  lat: number;
  lon: number;
  timestamp: string;
  fuelType: string;
  slope: number;
  aspect: number;
  elevation: number;
  mapsheet: string;
  vegLabel: string;
  bioGeoClimaticZone: string;
}

export interface Weather {
  index: number;
  temp: number;
  relativeHumidity: number;
  windSpeed: number,
  windDirection: number,
  windCardinalDir: string;
  precipitation: number;
  fineFuelMoistureCode: number;
  initialSpreadIndex: number;
  fireWeatherIndex: number;
}

export interface HourlyWeather extends Weather {
  hour: string;
}

export interface DailyWeather {
  day: string
}

export interface Station {
  stationCode: number;
  stationName: string;
  lat: number;
  lon: number;
  elevation: number;
  hourly: HourlyWeather[];
  daily: DailyWeather[];
}

export interface WeatherResult {
  errorCount: number;
  errorMsg: string;
  errorDetail: string;
  lat: number;
  lon: number;
  timestamp: string;
  stations: Station[];
}

export interface OwnershipResult {
  errorCount: number;
  errorMsg: string;
  errorDetail: string;
  lat: number;
  lon: number;
  timestamp: string;
  fireCentre: string;
  fireZone: string;
  resourceDistrict: string;
  pid: string;
  ownershipClass: string;
  protectedLand: string;
  municipality: string;
  regionalDistrict: string;
  clientAssetAreaName: string;
  clientAssetAreaType: string;
  clientAssetAreaContact: string;
  clientAssetLineName: string;
  clientAssetLineType: string;
  clientAssetLineContact: string;
  clientAssetPointName: string;
  clientAssetPointType: string;
  clientAssetPointContact: string;
  tenureTFL: string;
  tenureManagedForest: string;
  fnReserve: string;
  fnTitle: string;
  watershed: string;
  fireDept: string;
}

export interface ResourceState {
  loading: boolean;
  errorMessage?: string;
  errorDetail?: string;
}

export interface GeographyState extends ResourceState {
  geography?: GeographyResult;
}

export interface WeatherState extends ResourceState {
  weather?: WeatherResult;
}

export interface OwnershipState extends ResourceState {
  ownership?: OwnershipResult;
}

export interface PointIdState {
  geography: GeographyState;
  weather: WeatherState;
  ownership: OwnershipState;
}

export const initialPointIdState: PointIdState = {
  geography: { loading: false },
  weather: { loading: false },
  ownership: { loading: false },
};
