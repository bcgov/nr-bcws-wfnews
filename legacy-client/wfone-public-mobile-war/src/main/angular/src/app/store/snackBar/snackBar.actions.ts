import { Action } from "@ngrx/store";
import { ErrorState } from '../application/application.state';


export interface ShowSnackbarAction extends Action {
    payload: {
        error: string;
        time: number;
    };
}

export function showSnackbarError(error: string, time: number): ShowSnackbarAction {
    console.log('ERROR!! snackbar says: '+ error);
    return {
        type: 'SHOW_SNACKBAR_ERROR',
        payload: {
            error,
            time
        }
    };
}

