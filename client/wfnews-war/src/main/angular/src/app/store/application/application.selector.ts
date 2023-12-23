import { SearchState } from '@wf1/core-ui';
import { RootState } from '..';
import { ErrorState, LoadState } from './application.state';

export const selectSearchState =
  (componentId) =>
  (state: RootState): SearchState =>
    state[componentId] ? state[componentId] : undefined;

export const selectIncidentsLoadState =
  () =>
  (state: RootState): LoadState =>
    state.application && state.application.loadStates.incidents
      ? state.application.loadStates.incidents
      : undefined;
export const selectIncidentsErrorState =
  () =>
  (state: RootState): ErrorState[] =>
    state.application && state.application.errorStates.incidents
      ? state.application.errorStates.incidents
      : undefined;

export const selectWildfiresLoadState =
  () =>
  (state: RootState): LoadState =>
    state.application && state.application.loadStates.wildfires
      ? state.application.loadStates.wildfires
      : undefined;
export const selectWildfiresErrorState =
  () =>
  (state: RootState): ErrorState[] =>
    state.application && state.application.errorStates.wildfires
      ? state.application.errorStates.wildfires
      : undefined;

//------ code table cache ----
export const selectFormStatesUnsaved =
  (componentIds: string[]) =>
  (state: RootState): boolean => {
    let ret = false;
    if (componentIds && componentIds.length) {
      componentIds.forEach((componentId) => {
        const formUnsaved = state.application.formStates[componentId]
          ? state.application.formStates[componentId].isUnsaved
          : false;
        ret = ret || formUnsaved;
      });
    }
    return ret;
  };
