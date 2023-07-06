import { routerReducer } from "@ngrx/router-store";
import { ActionReducerMap } from "@ngrx/store";
import { ShowSnackbarEffects } from './snackBar/snackBar.effects';

import { ApplicationEffects } from "./application/application.effects";
import { applicationReducer } from "./application/application.reducer";
import { ApplicationState } from "./application/application.state";
import { BansProhibitionsEffects } from "./bans-prohibitions/bans-prohibitions.effects";
import { bansProhibitionsReducer } from "./bans-prohibitions/bans-prohibitions.reducer";
import { BansProhibitionsState } from "./bans-prohibitions/bans-prohibitions.state";
import { CurrentStatsEffects } from "./current-stats/current-stats.effects";
import { currentStatsReducer } from "./current-stats/current-stats.reducer";
import { CurrentStatsState } from "./current-stats/current-stats.state";

export const rootReducers: ActionReducerMap<any> = {
    router: routerReducer,
    application: applicationReducer,
    bansProhibitions: bansProhibitionsReducer,
    currentStats: currentStatsReducer,
};

export interface RootState {
    application?: ApplicationState;
    bansProhibitions?: BansProhibitionsState;
    currentStats?: CurrentStatsState;
}

export const initialRootState: RootState = {

};

export const rootEffects: any[] = [
    ApplicationEffects,
    BansProhibitionsEffects,
    CurrentStatsEffects,
    ShowSnackbarEffects
];
