import {Action} from "@ngrx/store";

import {ErrorState} from "../application/application.state";
import {VmFireChartInfo, VmOverviewActiveFireStats, VmOverviewCurrentYearFireStats} from "../../conversion/models";
import {ChartCriteria} from "./current-stats.state";

export const LOAD_OVERVIEW_ACTIVE_FIRE_STATS = 'LOAD_OVERVIEW_ACTIVE_FIRE_STATS';
export const LOAD_OVERVIEW_ACTIVE_FIRE_STATS_SUCCESS = 'LOAD_OVERVIEW_ACTIVE_FIRE_STATS_SUCCESS';
export const LOAD_OVERVIEW_ACTIVE_FIRE_STATS_ERROR = 'LOAD_OVERVIEW_ACTIVE_FIRE_STATS_ERROR';

export const LOAD_OVERVIEW_CURRENT_YEAR_FIRE_STATS = 'LOAD_OVERVIEW_CURRENT_YEAR_FIRE_STATS';
export const LOAD_OVERVIEW_CURRENT_YEAR_FIRE_STATS_SUCCESS = 'LOAD_OVERVIEW_CURRENT_YEAR_FIRE_STATS_SUCCESS';
export const LOAD_OVERVIEW_CURRENT_YEAR_FIRE_STATS_ERROR = 'LOAD_OVERVIEW_CURRENT_YEAR_FIRE_STATS_ERROR';

export const LOAD_ACTIVE_FIRES_BY_FIRE_CENTRES_CHART_INFO = 'LOAD_ACTIVE_FIRES_BY_FIRE_CENTRES_CHART_INFO';
export const LOAD_ACTIVE_FIRES_BY_FIRE_CENTRES_CHART_INFO_SUCCESS = 'LOAD_ACTIVE_FIRES_BY_FIRE_CENTRES_CHART_INFO_SUCCESS';
export const LOAD_ACTIVE_FIRES_BY_FIRE_CENTRES_CHART_INFO_ERROR = 'LOAD_ACTIVE_FIRES_BY_FIRE_CENTRES_CHART_INFO_ERROR';

export const LOAD_ACTIVE_FIRES_BY_SUSPECTED_CAUSES_CHART_INFO = 'LOAD_ACTIVE_FIRES_BY_SUSPECTED_CAUSES_CHART_INFO';
export const LOAD_ACTIVE_FIRES_BY_SUSPECTED_CAUSES_CHART_INFO_SUCCESS = 'LOAD_ACTIVE_FIRES_BY_SUSPECTED_CAUSES_CHART_INFO_SUCCESS';
export const LOAD_ACTIVE_FIRES_BY_SUSPECTED_CAUSES_CHART_INFO_ERROR = 'LOAD_ACTIVE_FIRES_BY_SUSPECTED_CAUSES_CHART_INFO_ERROR';

export const LOAD_ACTIVE_FIRES_BY_STAGE_OF_CONTROL_CHART_INFO = 'LOAD_ACTIVE_FIRES_BY_STAGE_OF_CONTROL_CHART_INFO';
export const LOAD_ACTIVE_FIRES_BY_STAGE_OF_CONTROL_CHART_INFO_SUCCESS = 'LOAD_ACTIVE_FIRES_BY_STAGE_OF_CONTROL_CHART_INFO_SUCCESS';
export const LOAD_ACTIVE_FIRES_BY_STAGE_OF_CONTROL_CHART_INFO_ERROR = 'LOAD_ACTIVE_FIRES_BY_STAGE_OF_CONTROL_CHART_INFO_ERROR';

export const LOAD_CURRENT_YEAR_FIRES_BY_FIRE_CENTRES_CHART_INFO = 'LOAD_CURRENT_YEAR_FIRES_BY_FIRE_CENTRES_CHART_INFO';
export const LOAD_CURRENT_YEAR_FIRES_BY_FIRE_CENTRES_CHART_INFO_SUCCESS =
    'LOAD_CURRENT_YEAR_FIRES_BY_FIRE_CENTRES_CHART_INFO_SUCCESS';
export const LOAD_CURRENT_YEAR_FIRES_BY_FIRE_CENTRES_CHART_INFO_ERROR = 'LOAD_CURRENT_YEAR_FIRES_BY_FIRE_CENTRES_CHART_INFO_ERROR';

export const LOAD_CURRENT_YEAR_FIRES_BY_SUSPECTED_CAUSES_CHART_INFO = 'LOAD_CURRENT_YEAR_FIRES_BY_SUSPECTED_CAUSES_CHART_INFO';
export const LOAD_CURRENT_YEAR_FIRES_BY_SUSPECTED_CAUSES_CHART_INFO_SUCCESS =
                'LOAD_CURRENT_YEAR_FIRES_BY_SUSPECTED_CAUSES_CHART_INFO_SUCCESS';
export const LOAD_CURRENT_YEAR_FIRES_BY_SUSPECTED_CAUSES_CHART_INFO_ERROR = 'LOAD_CURRENT_YEAR_FIRES_BY_SUSPECTED_CAUSES_CHART_INFO_ERROR';

export const LOAD_CURRENT_YEAR_FIRES_BY_STAGE_OF_CONTROL_CHART_INFO = 'LOAD_CURRENT_YEAR_FIRES_BY_STAGE_OF_CONTROL_CHART_INFO';
export const LOAD_CURRENT_YEAR_FIRES_BY_STAGE_OF_CONTROL_CHART_INFO_SUCCESS =
    'LOAD_CURRENT_YEAR_FIRES_BY_STAGE_OF_CONTROL_CHART_INFO_SUCCESS';
export const LOAD_CURRENT_YEAR_FIRES_BY_STAGE_OF_CONTROL_CHART_INFO_ERROR = 'LOAD_CURRENT_YEAR_FIRES_BY_STAGE_OF_CONTROL_CHART_INFO_ERROR';


// tslint:disable-next-line:no-empty-interface
export interface LoadOverviewActiveFireStatsAction extends Action {
}

export interface LoadOverviewActiveFireStatsSuccessAction extends Action {
    payload: {
        value: VmOverviewActiveFireStats;
    };
}

export interface LoadOverviewActiveFireStatsErrorAction extends Action {
    payload: {
        error: ErrorState;
    };
}


export function loadOverviewActiveFireStats(): LoadOverviewActiveFireStatsAction {
    return {
        type: LOAD_OVERVIEW_ACTIVE_FIRE_STATS
    };
}

export function loadOverviewActiveFireStatsSuccess(value: VmOverviewActiveFireStats): LoadOverviewActiveFireStatsSuccessAction {
    return {
        type: LOAD_OVERVIEW_ACTIVE_FIRE_STATS_SUCCESS,
        payload: {
            value
        }
    };
}

export function loadOverviewActiveFireStatsError(error: ErrorState): LoadOverviewActiveFireStatsErrorAction {
    return {
        type: LOAD_OVERVIEW_ACTIVE_FIRE_STATS_ERROR,
        payload: {
            error
        }
    };
}

// tslint:disable-next-line:no-empty-interface
export interface LoadActiveFiresByFireCentresChartInfoAction extends Action {
    payload: {
        value: ChartCriteria
    };
}

export interface LoadActiveFiresByFireCentresChartInfoSuccessAction extends Action {
    payload: {
        value: VmFireChartInfo;
    };
}

export interface LoadActiveFiresByFireCentresChartInfoErrorAction extends Action {
    payload: {
        error: ErrorState;
    };
}

export function loadActiveFiresByFireCentresChartInfo(value: ChartCriteria): LoadActiveFiresByFireCentresChartInfoAction {
    return {
        type: LOAD_ACTIVE_FIRES_BY_FIRE_CENTRES_CHART_INFO,
        payload: {
            value
        }
    };
}

export function loadActiveFiresByFireCentresChartInfoSuccess(value: VmFireChartInfo):
                    LoadActiveFiresByFireCentresChartInfoSuccessAction {
    return {
        type: LOAD_ACTIVE_FIRES_BY_FIRE_CENTRES_CHART_INFO_SUCCESS,
        payload: {
            value
        }
    };
}

export function loadActiveFiresByFireCentresChartInfoError(error: ErrorState): LoadActiveFiresByFireCentresChartInfoErrorAction {
    return {
        type: LOAD_ACTIVE_FIRES_BY_FIRE_CENTRES_CHART_INFO_ERROR,
        payload: {
            error
        }
    };
}


// tslint:disable-next-line:no-empty-interface
export interface LoadActiveFiresBySuspectedCausesChartInfoAction extends Action {
    payload: {
        value: ChartCriteria
    };
}

export interface LoadActiveFiresBySuspectedCausesChartInfoSuccessAction extends Action {
    payload: {
        value: VmFireChartInfo;
    };
}

export interface LoadActiveFiresBySuspectedCausesChartInfoErrorAction extends Action {
    payload: {
        error: ErrorState;
    };
}

export function loadActiveFiresBySuspectedCausesChartInfo(value: ChartCriteria): LoadActiveFiresBySuspectedCausesChartInfoAction {
    return {
        type: LOAD_ACTIVE_FIRES_BY_SUSPECTED_CAUSES_CHART_INFO,
        payload: {
            value
        }
    };
}

export function loadActiveFiresBySuspectedCausesChartInfoSuccess(value: VmFireChartInfo):
    LoadActiveFiresBySuspectedCausesChartInfoSuccessAction {
    return {
        type: LOAD_ACTIVE_FIRES_BY_SUSPECTED_CAUSES_CHART_INFO_SUCCESS,
        payload: {
            value
        }
    };
}

export function loadActiveFiresBySuspectedCausesChartInfoError(error: ErrorState): LoadActiveFiresBySuspectedCausesChartInfoErrorAction {
    return {
        type: LOAD_ACTIVE_FIRES_BY_SUSPECTED_CAUSES_CHART_INFO_ERROR,
        payload: {
            error
        }
    };
}


// tslint:disable-next-line:no-empty-interface
export interface LoadActiveFiresByStageOfControlChartInfoAction extends Action {
    payload: {
        value: ChartCriteria
    };
}

export interface LoadActiveFiresByStageOfControlChartInfoSuccessAction extends Action {
    payload: {
        value: VmFireChartInfo;
    };
}

export interface LoadActiveFiresByStageOfControlChartInfoErrorAction extends Action {
    payload: {
        error: ErrorState;
    };
}

export function loadActiveFiresByStageOfControlChartInfo(value: ChartCriteria): LoadActiveFiresByStageOfControlChartInfoAction {
    return {
        type: LOAD_ACTIVE_FIRES_BY_STAGE_OF_CONTROL_CHART_INFO,
        payload: {
            value
        }
    };
}

export function loadActiveFiresByStageOfControlChartInfoSuccess(value: VmFireChartInfo):
    LoadActiveFiresByStageOfControlChartInfoSuccessAction {
    return {
        type: LOAD_ACTIVE_FIRES_BY_STAGE_OF_CONTROL_CHART_INFO_SUCCESS,
        payload: {
            value
        }
    };
}

export function loadActiveFiresByStageOfControlChartInfoError(error: ErrorState): LoadActiveFiresByStageOfControlChartInfoErrorAction {
    return {
        type: LOAD_ACTIVE_FIRES_BY_STAGE_OF_CONTROL_CHART_INFO_ERROR,
        payload: {
            error
        }
    };
}


// tslint:disable-next-line:no-empty-interface
export interface LoadOverviewCurrentYearFireStatsAction extends Action {
}

export interface LoadOverviewCurrentYearFireStatsSuccessAction extends Action {
    payload: {
        value: VmOverviewCurrentYearFireStats;
    };
}

export interface LoadOverviewCurrentYearFireStatsErrorAction extends Action {
    payload: {
        error: ErrorState;
    };
}


export function loadOverviewCurrentYearFireStats(): LoadOverviewCurrentYearFireStatsAction {
    return {
        type: LOAD_OVERVIEW_CURRENT_YEAR_FIRE_STATS
    };
}

export function loadOverviewCurrentYearFireStatsSuccess(value: VmOverviewCurrentYearFireStats):
    LoadOverviewCurrentYearFireStatsSuccessAction {
    return {
        type: LOAD_OVERVIEW_CURRENT_YEAR_FIRE_STATS_SUCCESS,
        payload: {
            value
        }
    };
}

export function loadOverviewCurrentYearFireStatsError(error: ErrorState): LoadOverviewCurrentYearFireStatsErrorAction {
    return {
        type: LOAD_OVERVIEW_CURRENT_YEAR_FIRE_STATS_ERROR,
        payload: {
            error
        }
    };
}

// tslint:disable-next-line:no-empty-interface
export interface LoadCurrentYearFiresByFireCentresChartInfoAction extends Action {
    payload: {
        value: ChartCriteria
    };
}

export interface LoadCurrentYearFiresByFireCentresChartInfoSuccessAction extends Action {
    payload: {
        value: VmFireChartInfo;
    };
}

export interface LoadCurrentYearFiresByFireCentresChartInfoErrorAction extends Action {
    payload: {
        error: ErrorState;
    };
}

export function loadCurrentYearFiresByFireCentresChartInfo(value: ChartCriteria):
    LoadCurrentYearFiresByFireCentresChartInfoAction {
    return {
        type: LOAD_CURRENT_YEAR_FIRES_BY_FIRE_CENTRES_CHART_INFO,
        payload: {
            value
        }
    };
}

export function loadCurrentYearFiresByFireCentresChartInfoSuccess(value: VmFireChartInfo):
    LoadCurrentYearFiresByFireCentresChartInfoSuccessAction {
    return {
        type: LOAD_CURRENT_YEAR_FIRES_BY_FIRE_CENTRES_CHART_INFO_SUCCESS,
        payload: {
            value
        }
    };
}

export function loadCurrentYearFiresByFireCentresChartInfoError(error: ErrorState):
    LoadCurrentYearFiresByFireCentresChartInfoErrorAction {
    return {
        type: LOAD_CURRENT_YEAR_FIRES_BY_FIRE_CENTRES_CHART_INFO_ERROR,
        payload: {
            error
        }
    };
}

// tslint:disable-next-line:no-empty-interface
export interface LoadCurrentYearFiresBySuspectedCausesChartInfoAction extends Action {
    payload: {
        value: ChartCriteria
    };
}

export interface LoadCurrentYearFiresBySuspectedCausesChartInfoSuccessAction extends Action {
    payload: {
        value: VmFireChartInfo;
    };
}

export interface LoadCurrentYearFiresBySuspectedCausesChartInfoErrorAction extends Action {
    payload: {
        error: ErrorState;
    };
}

export function loadCurrentYearFiresBySuspectedCausesChartInfo(value: ChartCriteria):
    LoadCurrentYearFiresBySuspectedCausesChartInfoAction {
    return {
        type: LOAD_CURRENT_YEAR_FIRES_BY_SUSPECTED_CAUSES_CHART_INFO,
        payload: {
            value
        }
    };
}

export function loadCurrentYearFiresBySuspectedCausesChartInfoSuccess(value: VmFireChartInfo):
    LoadCurrentYearFiresBySuspectedCausesChartInfoSuccessAction {
    return {
        type: LOAD_CURRENT_YEAR_FIRES_BY_SUSPECTED_CAUSES_CHART_INFO_SUCCESS,
        payload: {
            value
        }
    };
}

export function loadCurrentYearFiresBySuspectedCausesChartInfoError(error: ErrorState):
    LoadCurrentYearFiresBySuspectedCausesChartInfoErrorAction {
    return {
        type: LOAD_CURRENT_YEAR_FIRES_BY_SUSPECTED_CAUSES_CHART_INFO_ERROR,
        payload: {
            error
        }
    };
}


// tslint:disable-next-line:no-empty-interface
export interface LoadCurrentYearFiresByStageOfControlChartInfoAction extends Action {
    payload: {
        value: ChartCriteria
    };
}

export interface LoadCurrentYearFiresByStageOfControlChartInfoSuccessAction extends Action {
    payload: {
        value: VmFireChartInfo;
    };
}

export interface LoadCurrentYearFiresByStageOfControlChartInfoErrorAction extends Action {
    payload: {
        error: ErrorState;
    };
}

export function loadCurrentYearFiresByStageOfControlChartInfo(value: ChartCriteria):
    LoadCurrentYearFiresByStageOfControlChartInfoAction {
    return {
        type: LOAD_CURRENT_YEAR_FIRES_BY_STAGE_OF_CONTROL_CHART_INFO,
        payload: {
            value
        }
    };
}

export function loadCurrentYearFiresByStageOfControlChartInfoSuccess(value: VmFireChartInfo):
    LoadCurrentYearFiresByStageOfControlChartInfoSuccessAction {
    return {
        type: LOAD_CURRENT_YEAR_FIRES_BY_STAGE_OF_CONTROL_CHART_INFO_SUCCESS,
        payload: {
            value
        }
    };
}

export function loadCurrentYearFiresByStageOfControlChartInfoError(error: ErrorState):
    LoadCurrentYearFiresByStageOfControlChartInfoErrorAction {
    return {
        type: LOAD_CURRENT_YEAR_FIRES_BY_STAGE_OF_CONTROL_CHART_INFO_ERROR,
        payload: {
            error
        }
    };
}

