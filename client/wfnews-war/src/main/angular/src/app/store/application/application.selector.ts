import { RootState } from "..";
import { ErrorState, LoadState } from "./application.state";


export const selectIncidentsLoadState = () => (state: RootState): LoadState => ((state.application.loadStates.incidents) ? state.application.loadStates.incidents : undefined);
export const selectIncidentsErrorState = () => (state: RootState): ErrorState[] => ((state.application.errorStates.incidents) ? state.application.errorStates.incidents : undefined);

//------ code table cache ----
export const selectFormStatesUnsaved = (componentIds: string[]) => (state: RootState): boolean => {
    let ret = false;
    if (componentIds && componentIds.length) {
        componentIds.forEach(componentId => {
            let formUnsaved = state.application.formStates[componentId] ? state.application.formStates[componentId].isUnsaved : false;
            ret = ret || formUnsaved;
        });
    }
    return ret;
};

