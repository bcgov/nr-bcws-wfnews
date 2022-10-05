import { RootState } from '..';

export const selectCurrentWildfiresSearch = () => (state: RootState): any => ((state.wildfires) ? state.wildfires.currentWildfiresSearch : undefined);
