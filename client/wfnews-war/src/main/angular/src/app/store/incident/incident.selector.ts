import { RootState } from '..';

export const selectCurrentIncident = () => (state: RootState): any => ((state.incident) ? state.incident.currentIncident : undefined);
export const selectCurrentIncidentCause = () => (state: RootState): any => ((state.incident) ? state.incident.currentIncidentCause : undefined);

