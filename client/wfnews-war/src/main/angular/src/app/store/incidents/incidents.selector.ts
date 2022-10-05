import { RootState } from '..';

export const selectCurrentIncidentsSearch = () => (state: RootState): any => ((state.incidents) ? state.incidents.currentIncidentsSearch : undefined);
