import {RootState} from "../index";
import {VmBanProhibition} from "../../conversion/models";

export const selectCurrentBansProhibitions = () => (state: RootState): VmBanProhibition[] =>
    ((state.bansProhibitions) ? state.bansProhibitions.currentBansProhibitions : undefined);
