import {initialPointIdState, PointIdState} from "./point-id.state";
import {
  PointIdAction,
  PointIdActionTypes,
  PointIdGeographyErrorAction,
  PointIdGeographySuccessAction,
  PointIdOwnershipErrorAction,
  PointIdOwnershipSuccessAction,
  PointIdWeatherErrorAction,
  PointIdWeatherSuccessAction
} from "./point-id.actions";

export function pointIdReducer(state: PointIdState = initialPointIdState, action: PointIdAction): PointIdState {
  switch(action.type) {
    case PointIdActionTypes.POINT_ID_GEOGRAPHY: {
      let newGeography = { ...state.geography };
      newGeography.geography = null;
      newGeography.loading = true;
      return {
        ...state,
        geography: newGeography,
      };
    }

    case PointIdActionTypes.POINT_ID_GEOGRAPHY_SUCCESS: {
      let newGeography = { ...state.geography };
      newGeography.geography = (action as PointIdGeographySuccessAction).geography;
      newGeography.loading = false;
      return {
        ...state,
        geography: newGeography,
      };
    }

    case PointIdActionTypes.POINT_ID_GEOGRAPHY_ERROR: {
      let newGeography = { ...state.geography };
      newGeography.geography = null;
      newGeography.errorMessage = (action as PointIdGeographyErrorAction).errorMessage;
      newGeography.errorDetail = (action as PointIdGeographyErrorAction).errorDetail;
      newGeography.loading = false;
      return {
        ...state,
        geography: newGeography,
      };
    }

    case PointIdActionTypes.POINT_ID_WEATHER: {
      let newWeather = { ...state.weather };
      newWeather.weather = null;
      newWeather.loading = true;
      return {
        ...state,
        weather: newWeather,
      };
    }

    case PointIdActionTypes.POINT_ID_WEATHER_SUCCESS: {
      let newWeather = { ...state.weather };
      newWeather.weather = (action as PointIdWeatherSuccessAction).weather;
      newWeather.loading = false;
      return {
        ...state,
        weather: newWeather,
      };
    }

    case PointIdActionTypes.POINT_ID_WEATHER_ERROR: {
      let newWeather = { ...state.weather };
      newWeather.weather = null;
      newWeather.errorMessage = (action as PointIdWeatherErrorAction).errorMessage;
      newWeather.errorDetail = (action as PointIdWeatherErrorAction).errorDetail;
      newWeather.loading = false;
      return {
        ...state,
        weather: newWeather,
      };
    }

    case PointIdActionTypes.POINT_ID_OWNERSHIP: {
      let newOwnership = { ...state.ownership };
      newOwnership.ownership = null;
      newOwnership.loading = true;
      return {
        ...state,
        ownership: newOwnership,
      };
    }

    case PointIdActionTypes.POINT_ID_OWNERSHIP_SUCCESS: {
      let newOwnership = { ...state.ownership };
      newOwnership.ownership = (action as PointIdOwnershipSuccessAction).ownership;
      newOwnership.loading = false;
      return {
        ...state,
        ownership: newOwnership,
      };
    }

    case PointIdActionTypes.POINT_ID_OWNERSHIP_ERROR: {
      let newOwnership = { ...state.ownership };
      newOwnership.ownership = null;
      newOwnership.errorMessage = (action as PointIdOwnershipErrorAction).errorMessage;
      newOwnership.errorDetail = (action as PointIdOwnershipErrorAction).errorDetail;
      newOwnership.loading = false;
      return {
        ...state,
        ownership: newOwnership,
      };
    }

    case PointIdActionTypes.POINT_ID_CLEAR_DATA: {
      return initialPointIdState;
    }

    default: {
      return state;
    }
  }
}
