export const INCIDENT_COMPONENT_ID = "Incident";

export interface IncidentState { 
    currentIncident?: any;
}

export function getDefaultIncidentState(): IncidentState {
    return {
        currentIncident: null,
    };
}
