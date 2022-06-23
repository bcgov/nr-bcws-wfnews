import { RootState } from "..";
import {initialROFSearchState} from "./rof.state";

export const selectActiveROF = () =>
  (state) => (state.rof) ? state.rof.activeRof : null;

export const selectActiveROFComments = () =>
  (state) => (state.rof && state.rof.activeRofComments)
    ? state.rof.activeRofComments.comments : [];

export const selectLastSyncDate = () =>
  (state) => (state.rof && state.rof.lastSyncDate)
    ? state.rof.lastSyncDate : undefined;

export const selectAudibleAlertState = () =>
  (state: RootState) => state?.searchROFMap?.audibleAlert

export const selectRoFUnacknowledgedCount = () =>
  (state) => (state.rof && state.rof.unacknowledgedCount)
    ? state.rof.unacknowledgedCount : undefined;
