import {RootState} from "../index";
import {VmFireChartInfo, VmOverviewActiveFireStats, VmOverviewCurrentYearFireStats} from "../../conversion/models";

export const selectOverviewActiveFiresStats = () => (state: RootState): VmOverviewActiveFireStats =>
    ((state.currentStats) ? state.currentStats.overviewActiveFiresStats : undefined);

export const selectOverviewCurrentYearFiresStats = () => (state: RootState): VmOverviewCurrentYearFireStats =>
    ((state.currentStats) ? state.currentStats.overviewCurrentYearFiresStats : undefined);

export const selectActiveFiresByFireCentresChartInfo = () => (state: RootState): VmFireChartInfo =>
    ((state.currentStats) ? state.currentStats.selectedFireChartInfo : undefined);
