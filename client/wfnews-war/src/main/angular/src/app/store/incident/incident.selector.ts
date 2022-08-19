import { RootState } from "..";

export const selectCurrentIncident = () => (state: RootState): any => ((state.incident) ? state.incident.currentIncident : undefined);
