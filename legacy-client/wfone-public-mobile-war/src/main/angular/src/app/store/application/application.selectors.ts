import {RootState} from "../index";
import {NearMeItem} from "../../services/point-id.service";

export const selectCurrentNearMeHighlight = () => (state: RootState): NearMeItem =>
    ((state.application && state.application.landingState && state.application.landingState.currentNearMeHighlight) ? state.application.landingState.currentNearMeHighlight : undefined);

export const selectCurrentBackRoute = () => (state: RootState): string =>
    ((state.application && state.application.landingState && state.application.landingState.currentBackRoute) ? state.application.landingState.currentBackRoute : undefined);
