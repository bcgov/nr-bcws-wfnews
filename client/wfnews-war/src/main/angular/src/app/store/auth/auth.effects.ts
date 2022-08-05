import {Injectable} from '@angular/core';
import {Actions} from '@ngrx/effects';

@Injectable()
export class AuthEffects {

	constructor(
		private actions$: Actions
	) {}

	/*@Effect()
	authSet$: Observable<Action> = this.actions$.pipe(
		ofType(AuthActions.AuthActionTypes.SET_AUTH),
		switchMap(
			() => [
				new CodeDataActions.GetCodeTableDataAction(),
				new CodeDataActions.GetOrgCodeTableDataAction(),
				new CodeDataActions.GetCodeHierarchyDataAction(),
        new CodeDataActions.GetOrgCodeHierarchyDataAction()
			]
		)
	);*/
}
