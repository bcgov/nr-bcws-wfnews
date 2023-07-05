import {Injectable} from "@angular/core";
import {MatSnackBar} from "@angular/material";
import {Router} from "@angular/router";
import {Action, Store} from "@ngrx/store";
import {RootState} from "../../store";

@Injectable()
export class BaseContainer {

    constructor(
        protected store: Store<RootState>,
        protected router: Router,
        public snackBar: MatSnackBar,
    ) {
    }

    onFormActions(actions: Action[]) {
        // whenever form (child) component emits event with actions as payload, dispatch them
        actions.forEach(this.store.dispatch.bind(this.store));
    }
}
