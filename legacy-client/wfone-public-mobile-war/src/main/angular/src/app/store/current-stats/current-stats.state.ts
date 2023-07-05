import {VmFireChartInfo, VmOverviewActiveFireStats, VmOverviewCurrentYearFireStats} from "../../conversion/models";
import {
    ENUM_CHART_TYPE,
    ENUM_GROUP_BY_TYPE,
    ENUM_REPORT_TYPE
} from "../../components/current-stats/current-stats-utils";

export interface CurrentStatsState {
    overviewActiveFiresStats?: VmOverviewActiveFireStats;
    overviewCurrentYearFiresStats?: VmOverviewCurrentYearFireStats;
    selectedFireChartInfo?: VmFireChartInfo;
}

const EMPTY_OVERVIEW_ACTIVE_FIRES_STATS: VmOverviewActiveFireStats = {
    firesStat: null,
    firesLastXDaysStat: null
};

const EMPTY_OVERVIEW_CURRENT_YEAR_FIRES_STATS: VmOverviewCurrentYearFireStats = {
    firesStat: null,
    firesLastXDaysStat: null
};

const EMPTY_FIRE_CHART_INFO: VmFireChartInfo = {
    stats: null,
    chart: null
};

export function getDefaultCurrentStatsState(): CurrentStatsState {
    return {
        overviewActiveFiresStats: EMPTY_OVERVIEW_ACTIVE_FIRES_STATS,
        overviewCurrentYearFiresStats: EMPTY_OVERVIEW_CURRENT_YEAR_FIRES_STATS,
        selectedFireChartInfo: EMPTY_FIRE_CHART_INFO
    };
}

export interface ChartCriteria {
    chartType: ENUM_CHART_TYPE;
    reportType: ENUM_REPORT_TYPE;
    groupByType: ENUM_GROUP_BY_TYPE;
}
