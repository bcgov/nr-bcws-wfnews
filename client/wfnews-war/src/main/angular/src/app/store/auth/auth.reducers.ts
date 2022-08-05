import {Action} from '@ngrx/store';

import * as AuthActions from './auth.actions';
import {AuthState, initialAuthState} from "./auth.state";

export function authReducer(state: AuthState = initialAuthState, action: Action) {
	switch (action.type) {
		case AuthActions.AuthActionTypes.SET_AUTH: {
			return { ...state, token: (<AuthActions.SetAuthAction> action).token };
		}
		default:
			return state;
	}
}
