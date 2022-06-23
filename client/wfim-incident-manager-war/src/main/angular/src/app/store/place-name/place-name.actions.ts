import {Action} from '@ngrx/store';
import {PlaceNameResults} from "./place-name.state";

export enum PlaceNameActionTypes {
	PLACE_NAME_SEARCH = '[ Place Name ] Place Name search',
  PLACE_NAME_SEARCH_SUCCESS = '[ Place Name ] Place Name search success',
  PLACE_NAME_SEARCH_ERROR = '[ Place Name ] Place Name search error',

	ROAD_NAME_SEARCH = '[ Place Name ] Road Name search',
  ROAD_NAME_SEARCH_SUCCESS = '[ Place Name ] Road Name search success',
  ROAD_NAME_SEARCH_ERROR = '[ Place Name ] Road Name search error',

	INTERSECTION_SEARCH = '[ Place Name ] Intersection search',
  INTERSECTION_SEARCH_SUCCESS = '[ Place Name ] Intersection search success',
  INTERSECTION_SEARCH_ERROR = '[ Place Name ] Intersection search error',

  START_LISTENING_FOR_RESULTS = '[ Place Name ] Start listening for results',
  START_LISTENING_FOR_RESULTS_SUCCESS = '[ Place Name ] Start listening success',
  START_LISTENING_FOR_RESULTS_ERROR = '[ Place Name ] Start listening error',
  STOP_LISTENING_FOR_RESULTS = '[ Place Name ] Stop listening for results',
  STOP_LISTENING_FOR_RESULTS_SUCCESS = '[ Place Name ] Stop listening success',
  STOP_LISTENING_FOR_RESULTS_ERROR = '[ Place Name ] Stop listening error',
  SEARCH_RESULTS = '[ Place Name ] Results returned',
}

export abstract class PlaceNameAction implements Action {
	protected constructor(public type) {}
}

export class PlaceNameSearchAction extends PlaceNameAction {
  constructor(public placeName) {
    super(PlaceNameActionTypes.PLACE_NAME_SEARCH);
  }
}

export class PlaceNameSearchSuccessAction extends PlaceNameAction {
	constructor(public placeName) {
	  super(PlaceNameActionTypes.PLACE_NAME_SEARCH_SUCCESS);
  }
}

export class PlaceNameSearchErrorAction extends PlaceNameAction {
	constructor(public placeName, public error) {
    super(PlaceNameActionTypes.PLACE_NAME_SEARCH_ERROR);
  }
}

export class RoadNameSearchAction extends PlaceNameAction {
	constructor(public roadName) {
    super(PlaceNameActionTypes.ROAD_NAME_SEARCH);
  }
}

export class RoadNameSearchSuccessAction extends PlaceNameAction {
	constructor(public roadName) {
    super(PlaceNameActionTypes.ROAD_NAME_SEARCH_SUCCESS);
  }
}

export class RoadNameSearchErrorAction extends PlaceNameAction {
	constructor(public roadName, public error) {
    super(PlaceNameActionTypes.ROAD_NAME_SEARCH_ERROR);
  }
}

export class IntersectionSearchAction extends PlaceNameAction {
  constructor(public roadName, public intersectionName) {
    super(PlaceNameActionTypes.INTERSECTION_SEARCH);
  }
}

export class IntersectionSearchSuccessAction extends PlaceNameAction {
  constructor(public roadName, public intersectionName) {
    super(PlaceNameActionTypes.INTERSECTION_SEARCH_SUCCESS);
  }
}

export class IntersectionSearchErrorAction extends PlaceNameAction {
  constructor(public roadName, public intersectionName, public error) {
    super(PlaceNameActionTypes.INTERSECTION_SEARCH_ERROR);
  }
}

export class StartListeningForResultsAction extends PlaceNameAction {
  constructor() {
    super(PlaceNameActionTypes.START_LISTENING_FOR_RESULTS);
  }
}

export class StartListeningForResultsSuccessAction extends PlaceNameAction {
  constructor() {
    super(PlaceNameActionTypes.START_LISTENING_FOR_RESULTS_SUCCESS);
  }
}

export class StartListeningForResultsErrorAction extends PlaceNameAction {
  constructor(public error) {
    super(PlaceNameActionTypes.START_LISTENING_FOR_RESULTS_ERROR);
  }
}

export class StopListeningForResultsAction extends PlaceNameAction {
  constructor() {
    super(PlaceNameActionTypes.STOP_LISTENING_FOR_RESULTS);
  }
}

export class StopListeningForResultsSuccessAction extends PlaceNameAction {
  constructor() {
    super(PlaceNameActionTypes.STOP_LISTENING_FOR_RESULTS_SUCCESS);
  }
}

export class StopListeningForResultsErrorAction extends PlaceNameAction {
  constructor(public error) {
    super(PlaceNameActionTypes.STOP_LISTENING_FOR_RESULTS_ERROR);
  }
}

export class SearchResultsAction extends PlaceNameAction {
  constructor(public results: PlaceNameResults) {
    super(PlaceNameActionTypes.SEARCH_RESULTS);
  }
}
