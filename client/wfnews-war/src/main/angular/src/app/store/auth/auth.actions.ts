import {Action} from '@ngrx/store';

export enum AuthActionTypes {
	SET_AUTH = '[ Auth ] Set webade auth'
}

export class SetAuthAction implements Action {
	type = AuthActionTypes.SET_AUTH;
	constructor(public token: string) {}
}

export type AuthActions = SetAuthAction;
