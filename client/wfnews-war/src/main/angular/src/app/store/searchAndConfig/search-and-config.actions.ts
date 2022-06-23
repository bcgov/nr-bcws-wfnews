import {Action} from '@ngrx/store';

// Models

export enum SearchAndConfigActionTypes {
  SAVE_USER_PREFS = 'SAVE_USER_PREFS',
  SAVE_USER_PREFS_SUCCESS = 'SAVE_USER_PREFS_SUCCESS',
  SAVE_USER_PREFS_ERROR = 'SAVE_USER_PREFS_ERROR',

  LOAD_USER_PREFS = 'LOAD_USER_PREFS',
  LOAD_USER_PREFS_SUCCESS = 'LOAD_USER_PREFS_SUCCESS',
  LOAD_USER_PREFS_ERROR = 'LOAD_USER_PREFS_ERROR',

  UPDATE_COLUMN_CONFIG = 'UPDATE_COLUMN_CONFIG',
}

export interface UpdateColumnConfigAction extends Action {
  componentId: string,
  payload: {
    value:string[]
  }
}

export interface LoadUserPrefsAction extends Action {
  payload: {
  }
}

export interface LoadUserPrefsSuccessAction extends Action {
  payload: {
    value: any;
  }
}

export interface LoadUserPrefsErrorAction extends Action {
  payload: {
    error: Error;
  }
}

export interface SaveUserPrefsAction extends Action {
  componentId: string,
  payload: {
    state?:any
  }
}

export interface SaveUserPrefsSuccessAction extends Action {
  componentId: string,
  payload: {
  }
}

export interface SaveUserPrefsErrorAction extends Action {
  componentId: string,
  payload: {
    error: Error;
  }
}


export function updateColumnConfig(componentId: string, value:string[]): UpdateColumnConfigAction {
  return {
    type: SearchAndConfigActionTypes.UPDATE_COLUMN_CONFIG,
    componentId: componentId,
    payload: {
      value:value
    }
  };
}

export function loadUserPrefs(): LoadUserPrefsAction {
  return {
    type: SearchAndConfigActionTypes.LOAD_USER_PREFS,
    payload: {
    }
  };
}

export function loadUserPrefsSuccess(response): LoadUserPrefsSuccessAction {
  return {
    type: SearchAndConfigActionTypes.LOAD_USER_PREFS_SUCCESS,
    payload: {
      value:response
    }
  };
}

export function loadUserPrefsError(error: Error): LoadUserPrefsErrorAction {
  return {
    type: SearchAndConfigActionTypes.LOAD_USER_PREFS_ERROR,
    payload: {
      error
    }
  };
}

export function saveUserPrefs(componentId: string, state?:any): SaveUserPrefsAction {
  return {
    type: SearchAndConfigActionTypes.SAVE_USER_PREFS,
    componentId: componentId,
    payload: {
      state:state?state:undefined
    }
  };
}

export function saveUserPrefsSuccess(componentId: string): SaveUserPrefsSuccessAction {
  return {
    type: SearchAndConfigActionTypes.SAVE_USER_PREFS_SUCCESS,
    componentId: componentId,
    payload: {
    }
  };
}

export function saveUserPrefsError(componentId: string, error: Error): SaveUserPrefsErrorAction {
  return {
    type: SearchAndConfigActionTypes.SAVE_USER_PREFS_ERROR,
    componentId: componentId,
    payload: {
      error
    }
  };
}

export type SearchAndConfigActions =
  SaveUserPrefsAction |
  SaveUserPrefsSuccessAction |
  SaveUserPrefsErrorAction |
  LoadUserPrefsAction |
  LoadUserPrefsSuccessAction |
  LoadUserPrefsErrorAction |
  UpdateColumnConfigAction
  ;
