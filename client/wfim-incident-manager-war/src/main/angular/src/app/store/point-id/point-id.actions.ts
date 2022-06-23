import {Action} from '@ngrx/store';
import { LonLat } from '../../services/wfim-map.service/util';
import {GeographyResult, OwnershipResult, WeatherResult} from "./point-id.state";

export enum PointIdActionTypes {
  POINT_ID_WEATHER = '[ Point ID ] Weather search',
  POINT_ID_WEATHER_SUCCESS = '[ Point ID ] Weather search success',
  POINT_ID_WEATHER_ERROR = '[ Point ID ] Weather search error',

  POINT_ID_GEOGRAPHY = '[ Point ID ] Geography search',
  POINT_ID_GEOGRAPHY_SUCCESS = '[ Point ID ] Geography search success',
  POINT_ID_GEOGRAPHY_ERROR = '[ Point ID ] Geography search error',

  POINT_ID_OWNERSHIP = '[ Point ID ] Ownership search',
  POINT_ID_OWNERSHIP_SUCCESS = '[ Point ID ] Ownership search success',
  POINT_ID_OWNERSHIP_ERROR = '[ Point ID ] Ownership search error',

  POINT_ID_CLEAR_DATA = '[ Point ID ] Clear results',
}

export abstract class PointIdAction implements Action {
  protected constructor(public type) {}
}

export class PointIdWeatherAction extends PointIdAction {
  constructor(public location: LonLat) {
    super(PointIdActionTypes.POINT_ID_WEATHER);
  }
}

export class PointIdWeatherSuccessAction extends PointIdAction {
  constructor(public weather: WeatherResult) {
    super(PointIdActionTypes.POINT_ID_WEATHER_SUCCESS);
  }
}

export class PointIdWeatherErrorAction extends PointIdAction {
  constructor(public errorMessage: string, public errorDetail: string) {
    super(PointIdActionTypes.POINT_ID_WEATHER_ERROR);
  }
}

export class PointIdGeographyAction extends PointIdAction {
  constructor(public location: LonLat) {
    super(PointIdActionTypes.POINT_ID_GEOGRAPHY);
  }
}

export class PointIdGeographySuccessAction extends PointIdAction {
  constructor(public geography: GeographyResult) {
    super(PointIdActionTypes.POINT_ID_GEOGRAPHY_SUCCESS);
  }
}

export class PointIdGeographyErrorAction extends PointIdAction {
  constructor(public errorMessage: string, public errorDetail: string) {
    super(PointIdActionTypes.POINT_ID_GEOGRAPHY_ERROR);
  }
}

export class PointIdOwnershipAction extends PointIdAction {
  constructor(public location: LonLat) {
    super(PointIdActionTypes.POINT_ID_OWNERSHIP);
  }
}

export class PointIdOwnershipSuccessAction extends PointIdAction {
  constructor(public ownership: OwnershipResult) {
    super(PointIdActionTypes.POINT_ID_OWNERSHIP_SUCCESS);
  }
}

export class PointIdOwnershipErrorAction extends PointIdAction {
  constructor(public errorMessage: string, public errorDetail: string) {
    super(PointIdActionTypes.POINT_ID_OWNERSHIP_ERROR);
  }
}

export class PointIdClearAction extends PointIdAction {
  constructor() {
    super(PointIdActionTypes.POINT_ID_CLEAR_DATA);
  }
}
