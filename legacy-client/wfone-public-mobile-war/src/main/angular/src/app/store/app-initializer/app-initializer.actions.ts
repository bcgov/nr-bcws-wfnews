import {Action} from "@ngrx/store";

export const APP_INITIALIZER_START = '[APP INIT] Start App Initializer';
export const APP_INITIALIZER_FINISH = '[APP INIT] Finish App Initializer';


export interface AppInitializerStart extends Action {
}

export function appInitializerStart(): AppInitializerStart {
  return {
    type: APP_INITIALIZER_START
  };
}


export interface AppInitializerFinish extends Action {
}

export function appInitializerFinish(): AppInitializerFinish {
  return {
    type: APP_INITIALIZER_FINISH
  };
}
