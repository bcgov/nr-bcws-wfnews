import {RootState} from "../index";

export const selectActiveIncident = () =>
  (state) => (state.incidentManagementMap) ? state.incidentManagementMap.activeIncident : null;

export const selectActiveIncidentComments = () =>
  (state) => (state.incidentManagementMap && state.incidentManagementMap.activeIncidentComments)
    ? state.incidentManagementMap.activeIncidentComments.comments : [];


export const selectActiveIncidentRofs = () =>
  (state) => (state.incidentManagementMap && state.incidentManagementMap.activeIncidentRofs)
    ? state.incidentManagementMap.activeIncidentRofs : [];

export const selectCurrentlyEditingIncidentResource = () => (state:RootState) => ((state.incidentManagement.editingRsrc) ? state.incidentManagement.editingRsrc : null);
export const selectCurrentlyEditingIncidentResourceEtag = () => (state:RootState) => ((state.incidentManagement.editingRsrcEtag) ? state.incidentManagement.editingRsrcEtag : null);
export const selectSavedColumnsIM = () => (state:RootState) => ((state.searchIM) ? state.searchIM.columns : null);
