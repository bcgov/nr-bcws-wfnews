import { RootState } from "..";

export const selectIncidents = () => (state: RootState): any => ((state.incidents) ? state.incidents.incidents : null);
