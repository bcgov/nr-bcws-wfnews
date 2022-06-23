import {Action} from '@ngrx/store';

import * as UIActions from './ui.actions';

export interface UIState {
	errors: { [errorId: string]: { type: string, data: any }};
	loading: { [loadingId: string]: any };
	activeRof: { id: number };
}

export const uiInitialState: UIState = {
	errors: {},
	loading: {},
	activeRof: { id: null }
};

export function uiReducer(state: UIState = uiInitialState, action: Action) {
	switch (action.type) {
		case UIActions.ADD_ERROR: {
			const newError = (<UIActions.AddError> action);
			const errors = { ...state.errors };
			errors[newError.errorId] = newError.data;
			return { ...state, errors: { ...errors } };
		}
		case UIActions.REMOVE_ERROR: {
			const oldError = (<UIActions.RemoveError> action);
			const errors = { ...state.errors };
			delete errors[oldError.errorId];
			return { ...state, errors: { ...errors } };
		}
		case UIActions.ADD_LOADING: {
			const newLoading = (<UIActions.AddLoading> action);
			const loading = { ...state.loading };
			loading[newLoading.loadingId] = newLoading.data;
			return { ...state, loading: { ...loading } };
		}
		case UIActions.REMOVE_LOADING: {
			const oldLoading = (<UIActions.RemoveLoading> action);
			const loading = { ...state.loading };
			delete loading[oldLoading.loadingId];
			return { ...state, loading: { ...loading } };
		}
		case UIActions.FOCUS_OPEN_ROF: {
			return { ...state, activeRof: { id: (<UIActions.FocusOpenRof> action).id } };
		}
    case UIActions.CLEAR_ERRORS: {
      return { ...state, errors: {} };
    }
		default:
			return state;
	}
}
