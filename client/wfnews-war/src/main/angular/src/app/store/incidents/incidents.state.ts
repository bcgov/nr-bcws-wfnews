export interface IncidentsState {
    incidents?: any;
}

export function getDefaultIncidentsState(): IncidentsState {
    return {
        incidents: null
    }
}