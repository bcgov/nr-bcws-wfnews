import {Action} from "@ngrx/store";
import {CurrentStatsState, getDefaultCurrentStatsState} from "./current-stats.state";
import {
    LOAD_ACTIVE_FIRES_BY_FIRE_CENTRES_CHART_INFO_SUCCESS,
    LOAD_ACTIVE_FIRES_BY_STAGE_OF_CONTROL_CHART_INFO_SUCCESS,
    LOAD_ACTIVE_FIRES_BY_SUSPECTED_CAUSES_CHART_INFO_SUCCESS,
    LOAD_CURRENT_YEAR_FIRES_BY_FIRE_CENTRES_CHART_INFO_SUCCESS,
    LOAD_CURRENT_YEAR_FIRES_BY_STAGE_OF_CONTROL_CHART_INFO_SUCCESS,
    LOAD_CURRENT_YEAR_FIRES_BY_SUSPECTED_CAUSES_CHART_INFO_SUCCESS,
    LOAD_OVERVIEW_ACTIVE_FIRE_STATS_SUCCESS,
    LOAD_OVERVIEW_CURRENT_YEAR_FIRE_STATS_SUCCESS,
    LoadActiveFiresByFireCentresChartInfoSuccessAction,
    LoadActiveFiresByStageOfControlChartInfoSuccessAction,
    LoadActiveFiresBySuspectedCausesChartInfoSuccessAction,
    LoadCurrentYearFiresByFireCentresChartInfoSuccessAction,
    LoadCurrentYearFiresByStageOfControlChartInfoSuccessAction,
    LoadCurrentYearFiresBySuspectedCausesChartInfoSuccessAction,
    LoadOverviewActiveFireStatsSuccessAction,
    LoadOverviewCurrentYearFireStatsSuccessAction
} from "./current-stats.actions";

export function currentStatsReducer(state: CurrentStatsState = getDefaultCurrentStatsState(), action: Action): CurrentStatsState {
    switch (action.type) {

        case LOAD_OVERVIEW_ACTIVE_FIRE_STATS_SUCCESS: {
            const typedAction = <LoadOverviewActiveFireStatsSuccessAction>action;
            return {...state , overviewActiveFiresStats: typedAction.payload.value};
        }
        case LOAD_ACTIVE_FIRES_BY_FIRE_CENTRES_CHART_INFO_SUCCESS: {
            const typedAction = <LoadActiveFiresByFireCentresChartInfoSuccessAction>action;
            return {...state , selectedFireChartInfo: typedAction.payload.value};
        }
        case LOAD_ACTIVE_FIRES_BY_SUSPECTED_CAUSES_CHART_INFO_SUCCESS: {
            const typedAction = <LoadActiveFiresBySuspectedCausesChartInfoSuccessAction>action;
            return {...state , selectedFireChartInfo: typedAction.payload.value};
        }
        case LOAD_ACTIVE_FIRES_BY_STAGE_OF_CONTROL_CHART_INFO_SUCCESS: {
            const typedAction = <LoadActiveFiresByStageOfControlChartInfoSuccessAction>action;
            return {...state , selectedFireChartInfo: typedAction.payload.value};
        }
        case LOAD_OVERVIEW_CURRENT_YEAR_FIRE_STATS_SUCCESS: {
            const typedAction = <LoadOverviewCurrentYearFireStatsSuccessAction>action;
            return {...state , overviewCurrentYearFiresStats: typedAction.payload.value};
        }
        case LOAD_CURRENT_YEAR_FIRES_BY_FIRE_CENTRES_CHART_INFO_SUCCESS: {
            const typedAction = <LoadCurrentYearFiresByFireCentresChartInfoSuccessAction>action;
            return {...state , selectedFireChartInfo: typedAction.payload.value};
        }
        case LOAD_CURRENT_YEAR_FIRES_BY_SUSPECTED_CAUSES_CHART_INFO_SUCCESS: {
            const typedAction = <LoadCurrentYearFiresBySuspectedCausesChartInfoSuccessAction>action;
            return {...state , selectedFireChartInfo: typedAction.payload.value};
        }
        case LOAD_CURRENT_YEAR_FIRES_BY_STAGE_OF_CONTROL_CHART_INFO_SUCCESS: {
            const typedAction = <LoadCurrentYearFiresByStageOfControlChartInfoSuccessAction>action;
            return {...state , selectedFireChartInfo: typedAction.payload.value};
        }
        default: {
            return state;
        }
    }
}
