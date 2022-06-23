export const selectActiveNROF = () =>
  (state) => (state.nrofMap) ? state.nrofMap.activeNrof : null;

export const selectLastSyncDate = () =>
  (state) => (state.nrofMap && state.nrofMap.lastSyncDate)
    ? state.nrofMap.lastSyncDate : undefined;
