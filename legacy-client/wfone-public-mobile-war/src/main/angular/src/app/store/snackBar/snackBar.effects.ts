import { ErrorMessages } from './../../utils/error-messages';
import { ShowSnackbarAction } from './snackBar.actions';
import { CapacitorService } from './../../services/capacitor-service';
import { Observable, of } from 'rxjs';
import { Action, Store } from '@ngrx/store';
import { Injectable } from "@angular/core";
import { Actions, Effect, ofType } from '@ngrx/effects';
import { RootState } from '..';

import { mergeMap, map, switchMap, catchError } from 'rxjs/operators';
import { MatSnackBar } from '@angular/material';



@Injectable()
export class ShowSnackbarEffects {
    constructor(
        private actions: Actions,
        private store$: Store<RootState>,
        private snackbarService: MatSnackBar
    ) {
    }

    @Effect() 
    public showSnackBar = this.actions.pipe(
    ofType('SHOW_SNACKBAR_ERROR'),
    switchMap((snackBarAction: ShowSnackbarAction) => {
        console.log("IN HERE")
      this.snackbarService.open(snackBarAction.payload.error,
      '', {duration: snackBarAction.payload.time, panelClass: 'full-snack-bar-offline'});

      return of({ type: 'noop' });
    }));
}
