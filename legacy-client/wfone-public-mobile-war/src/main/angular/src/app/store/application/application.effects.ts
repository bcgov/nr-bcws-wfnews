import {Injectable} from "@angular/core";
import {Actions} from "@ngrx/effects";
import {Store} from "@ngrx/store";
import {RootState} from "../index";

@Injectable()
export class ApplicationEffects {

    constructor(
        private actions: Actions,
        private store$: Store<RootState>,

    ) {
    }

}
