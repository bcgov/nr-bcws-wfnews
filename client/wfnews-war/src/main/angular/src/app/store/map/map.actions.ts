import {Action} from "@ngrx/store";
import {PublicReportOfFireResource, WildfireIncidentResource} from "@wf1/incidents-rest-api";
import { LonLat } from "../../services/wfnews-map.service/util";

export const SET_MAP_POSITION = '[ map ] set map position';
export const SET_MAP_POSITION_COMPLETE = '[ map ] set map position complete';
export const SET_ACTIVE_MAP_LOCATION = '[ map ] set active map location';
export const SET_ACTIVE_MAP_POLYGON = '[ map ] set active map polygon';
export const SET_MAP_POLYGON = '[ map ] set map polygon';
export const SET_MAP_POLYGON_COMPLETE = '[ map ] set map polygon complete';
export const CLEAR_MAP_SELECT_POINT = '[ map ] clear map select point';
export const CLEAR_MAP_SELECT_POINT_COMPLETE = '[ map ] clear map select point complete';
export const ACTIVATE_SELECT_POINT = '[ map ] activate map select point';
export const ACTIVATE_SELECT_POINT_COMPLETE = '[ map ] activate map select point complete';
export const CLEAR_MAP_SELECT_POLYGON = '[ map ] clear map select polygon';
export const CLEAR_MAP_SELECT_POLYGON_COMPLETE = '[ map ] clear map select polygon complete';
export const ACTIVATE_SELECT_POLYGON = '[ map ] activate map select polygon';
export const ACTIVATE_SELECT_POLYGON_COMPLETE = '[ map ] activate map select polygon complete';
export const LOAD_ROF_ITEM = '[ map ] load rof item';
export const LOAD_ROF_ITEM_COMPLETE = '[ map ] load rof item complete';
export const LOAD_NROF_ITEM = '[ map ] load nrof item';
export const LOAD_NROF_ITEM_COMPLETE = '[ map ] load nrof item complete';
export const LOAD_INCIDENT_ITEM = '[ map ] load incident item';
export const LOAD_INCIDENT_ITEM_COMPLETE = '[ map ] load incident item complete';

export class SetMapLocation {
	type = SET_MAP_POSITION;
	constructor(public location: LonLat) { }
}

export class SetMapLocationComplete {
  type = SET_MAP_POSITION_COMPLETE;
  constructor() { }
}

export class SetMapPolygon {
  type = SET_MAP_POLYGON;
  constructor(public polygon: any) {}
}

export class SetMapPolygonComplete {
  type = SET_MAP_POLYGON_COMPLETE;
  constructor() { }
}

export class SetActiveMapLocation {
	type = SET_ACTIVE_MAP_LOCATION;
	constructor(public location: LonLat) {}
}

export class SetActiveMapPolygon {
  type = SET_ACTIVE_MAP_POLYGON;
  constructor(public polygon: any) {}
}

export class ClearMapSelectPoint {
  type = CLEAR_MAP_SELECT_POINT;
  constructor() {}
}

export class ClearMapSelectPointComplete {
  type = CLEAR_MAP_SELECT_POINT_COMPLETE;
  constructor() {}
}

export class ActivateSelectTool {
  type = ACTIVATE_SELECT_POINT;
  constructor() {}
}

export class ActivateSelectComplete {
  type = ACTIVATE_SELECT_POINT_COMPLETE;
  constructor() {}
}

export class ClearMapSelectPolygon {
  type = CLEAR_MAP_SELECT_POLYGON;
  constructor() {}
}

export class ClearMapSelectPolygonComplete {
  type = CLEAR_MAP_SELECT_POLYGON_COMPLETE;
  constructor() {}
}

export class ActivateSelectPolygonTool {
  type = ACTIVATE_SELECT_POLYGON;
  constructor() {}
}

export class ActivateSelectPolygonComplete {
  type = ACTIVATE_SELECT_POLYGON_COMPLETE;
  constructor() {}
}

export interface LoadUserMapPrefsAction extends Action {
  key: string,
  payload: {
  }
}

export interface LoadUserMapPrefsSuccessAction extends Action {
  key: string,
  payload: {
    value: any;
  }
}

export interface LoadUserMapPrefsErrorAction extends Action {
  payload: {
    error: Error;
  }
}

export interface SaveUserMapPrefsAction extends Action {
  key: string,
  payload: {
    state:any
  }
}

export interface SaveUserMapPrefsSuccessAction extends Action {
  key: string,
  payload: {
  }
}

export interface SaveUserMapPrefsErrorAction extends Action {
  key: string,
  payload: {
    error: Error;
  }
}

export class LoadRoFItem {
  type = LOAD_ROF_ITEM;
  constructor( public rofItems: PublicReportOfFireResource[]) {}
}

export class LoadRoFItemComplete {
  type = LOAD_ROF_ITEM_COMPLETE
  constructor() {}
}

export class LoadNRoFItem {
  type = LOAD_NROF_ITEM;
  constructor( public nrofItem) {}
}

export class LoadNRoFItemComplete {
  type = LOAD_NROF_ITEM_COMPLETE
  constructor() {}
}

export class LoadIncidentItem {
  type = LOAD_INCIDENT_ITEM;
  constructor( public incidentItems: WildfireIncidentResource[]) {}
}

export class LoadIncidentItemComplete {
  type = LOAD_INCIDENT_ITEM_COMPLETE
  constructor() {}
}
