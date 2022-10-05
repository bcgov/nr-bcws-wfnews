import {Injectable} from '@angular/core';
import {Actions} from '@ngrx/effects';
import {Store} from '@ngrx/store';
import {RootState} from '../index';
import {ApplicationStateService} from '../../services/application-state.service';

@Injectable()
export class ApplicationEffects {

    constructor(
        private actions: Actions,
        private store: Store<RootState>,
        private applicationStateService: ApplicationStateService,
    ) {

    }


}
