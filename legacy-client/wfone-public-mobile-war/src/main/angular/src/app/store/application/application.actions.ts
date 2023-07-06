import {Action} from "@ngrx/store";
import {NearMeItem} from "../../services/point-id.service";

export const LOAD_WELCOME = 'LOAD_WELCOME';
export const SET_NEAR_ME_HIGHLIGHT = 'SET_NEAR_ME_HIGHLIGHT';
export const CLEAR_NEAR_ME_HIGHLIGHT = 'CLEAR_NEAR_ME_HIGHLIGHT';


// WELCOME
export interface LoadWelcomeAction extends Action {
}


export function loadWelcome(): LoadWelcomeAction {
  return {
    type: LOAD_WELCOME
  };
}

export interface SetNearMeHighlightAction extends Action {
  payload:{
    nearMeItem: NearMeItem,
    backRoute: string
  };
}


export function setNearMeHighlight(nearMeItem:NearMeItem, backRoute:string): SetNearMeHighlightAction {
  return {
    type: SET_NEAR_ME_HIGHLIGHT,
    payload: {
      nearMeItem: nearMeItem,
      backRoute: backRoute
    }
  };
}


export interface ClearNearMeHighlightAction extends Action {
}


export function clearNearMeHighlight(): ClearNearMeHighlightAction {
  return {
    type: CLEAR_NEAR_ME_HIGHLIGHT
  };
}
