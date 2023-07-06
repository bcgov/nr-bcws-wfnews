import {VmBanProhibition} from "../../conversion/models";

export interface BansProhibitionsState {
    currentBansProhibitions?: VmBanProhibition[];
}

const EMPTY_BANS_PROHIBITIONS: VmBanProhibition[] = [];

export function getDefaultBanProhibitionsState(): BansProhibitionsState {
    return {
        currentBansProhibitions: EMPTY_BANS_PROHIBITIONS,
    };
}
