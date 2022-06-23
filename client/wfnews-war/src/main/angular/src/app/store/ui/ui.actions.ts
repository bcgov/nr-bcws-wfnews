export const ADD_LOADING = '[ ui ] add loading';
export const REMOVE_LOADING = '[ ui ] remove loading';

export const ADD_ERROR = '[ ui ] add error';
export const REMOVE_ERROR = '[ ui ] add remove';
export const CLEAR_ERRORS = '[ ui ] clear errors';

export const FOCUS_OPEN_ROF = '[ ui ] focus rof number';

export class AddLoading {
	type = ADD_LOADING;
	constructor(
		public loadingId: string,
		public data: { type: string, data: any}
	) { }
}

export class RemoveLoading {
	type = REMOVE_LOADING;
	constructor(
		public loadingId: string
	) { }
}

export class AddError {
	type = ADD_ERROR;
	constructor(
		public errorId: string,
		public data: { type: string, data: any}
	) { }
}

export class RemoveError {
	type = REMOVE_ERROR;
	constructor(
		public errorId: string
	) { }
}

export class ClearErrors {
  type = CLEAR_ERRORS;
  constructor(
  ) { }
}

export class FocusOpenRof {
	type = FOCUS_OPEN_ROF;
	constructor( public id: number ) {}
}

