import {VmBarChartSettings, VmOption, VmPieChartSettings} from "../../conversion/models";
import {ChartCriteria} from "../../store/current-stats/current-stats.state";
import {checkMobileResolution, convertRemToPixels, isLandscape} from "../../utils";

export enum ENUM_CHART_TYPE {
    BAR_CHART = 1,
    PIE_CHART = 2
}

export enum ENUM_REPORT_TYPE {
    ACTIVE_FIRES = 1,
    CURRENT_YEAR_FIRES = 2
}

export enum ENUM_GROUP_BY_TYPE {
    FIRE_CENTRE = 1,
    SUSPECTED_CAUSES = 2,
    STAGE_OF_CONTROL = 3
}


export const GROUP_BY_TYPES = {
    FIRE_CENTRE: {desc: 'Fire Centre', value: 'FC'} as VmOption,
    SUSPECTED_CAUSE: {desc: 'Suspected Cause', value: 'SC'} as VmOption,
    STAGE_OF_CONTROL: {desc: 'Stage of Control', value: 'SOC'} as VmOption,
};

export const REPORT_TYPES = {
    ACTIVE_FIRES: {desc: 'Active Fires', value: 'AF'} as VmOption,
    CURRENT_YEAR_FIRES: {desc: 'Current Year Fires', value: 'CYF'} as VmOption,
};

export const CHART_TYPES = {
    BAR_CHART: {desc: 'Bar Chart', value: 'BC'} as VmOption,
    PIE_CHART: {desc: 'Pie Chart', value: 'PC'} as VmOption,
};

export const CONSTANTS = {
    CURRENT_STATS_ACTIVE_FIRES_LAST_X_DAYS_QUERY_VAL: 2,
    CURRENT_STATS_CURRENT_YEAR_FIRES_LAST_X_DAYS_QUERY_VAL: 7,
    GROUP_BY_TYPES: [GROUP_BY_TYPES.FIRE_CENTRE, GROUP_BY_TYPES.SUSPECTED_CAUSE, GROUP_BY_TYPES.STAGE_OF_CONTROL],
    REPORT_TYPES: [REPORT_TYPES.ACTIVE_FIRES, REPORT_TYPES.CURRENT_YEAR_FIRES],
    CHART_TYPES: [CHART_TYPES.BAR_CHART, CHART_TYPES.PIE_CHART]
};

const BAR_CHART_SETTINGS_BASE: VmBarChartSettings = {
    gradient: false,
    showDataLabel: true,
    showLegend: false,
    showXAxis: true,
    showXAxisLabel: true,
    xAxisLabel: '',
    showYAxis: true,
    showYAxisLabel: true,
    yAxisLabel: '',
    rotateXAxisTicks: true
};

export const STAGE_OF_CONTROL_CUSTOM_COLOURS = [
    {
        name: 'Being Held',
        value: '#FFFF00'
    },
    {
        name: 'New',
        value: '#FFAA00'
    },
    {
        name: 'Out',
        value: '#999999'
    },
    {
        name: 'Under Control',
        value: '#98E600'
    },
    {
        name: 'Out of Control',
        value: '#ff0000'
    },
    {
        name: 'Fire of Note',
        value: '#a900e6'
    }
]

export const PIE_CHART_SETTINGS_BASE: VmPieChartSettings = {
    //view: [375, 425],
    showLabels: true,
    showLegend: false,
};

export function getEnumChartTypeFromTypeCode(typeCode: string): ENUM_CHART_TYPE {
    if (typeCode === CHART_TYPES.BAR_CHART.value) { return ENUM_CHART_TYPE.BAR_CHART; }
    if (typeCode === CHART_TYPES.PIE_CHART.value) { return ENUM_CHART_TYPE.PIE_CHART; }
    return null;
}

export function getEnumReportTypeFromTypeCode(typeCode: string): ENUM_REPORT_TYPE {
    if (typeCode === REPORT_TYPES.ACTIVE_FIRES.value) { return ENUM_REPORT_TYPE.ACTIVE_FIRES; }
    if (typeCode === REPORT_TYPES.CURRENT_YEAR_FIRES.value) { return ENUM_REPORT_TYPE.CURRENT_YEAR_FIRES; }
    return null;
}

export function getEnumGroupByTypeFromTypeCode(typeCode: string): ENUM_GROUP_BY_TYPE {
    if (typeCode === GROUP_BY_TYPES.FIRE_CENTRE.value) { return ENUM_GROUP_BY_TYPE.FIRE_CENTRE; }
    if (typeCode === GROUP_BY_TYPES.SUSPECTED_CAUSE.value) { return ENUM_GROUP_BY_TYPE.SUSPECTED_CAUSES; }
    if (typeCode === GROUP_BY_TYPES.STAGE_OF_CONTROL.value) { return ENUM_GROUP_BY_TYPE.STAGE_OF_CONTROL; }
    return null;
}

export function getChartSettings(chartCriteria: ChartCriteria):
    VmBarChartSettings | VmPieChartSettings {

    if (chartCriteria.chartType === ENUM_CHART_TYPE.BAR_CHART) {
        const barChartSettings: VmBarChartSettings = BAR_CHART_SETTINGS_BASE;
        let h = undefined;
        let w = undefined;
        //mobile portrait
        barChartSettings.rotateXAxisTicks = true;
        if(checkMobileResolution()){
            if(isLandscape()) {
                h = (window.innerHeight - 154);
                w = (window.innerWidth - 236);
                barChartSettings.rotateXAxisTicks = false;
            }else {
                h = (window.innerHeight - 300);
                w = (window.innerWidth - 50);

            }
        }else{
            h = (window.innerHeight - 30 - convertRemToPixels(4) - 185 - 24 - 33);
            let containerWidth = window.innerWidth > 560? 560: window.innerWidth;
            w = (containerWidth - 50);
        }

        if(h && w){
            if(w == 332 && h == 166){
                h = 170;
            }
            barChartSettings.view = undefined;
        }else{
            barChartSettings.view = undefined;
        }
        //console.log("barChartSettings.rotateXAxisTicks" , barChartSettings.rotateXAxisTicks);
        if (chartCriteria.reportType === ENUM_REPORT_TYPE.ACTIVE_FIRES && chartCriteria.groupByType === ENUM_GROUP_BY_TYPE.FIRE_CENTRE) {
            barChartSettings.xAxisLabel = 'Fire Centres';
            barChartSettings.yAxisLabel = 'Number of Fires';
            return barChartSettings;
        } else if (chartCriteria.reportType === ENUM_REPORT_TYPE.ACTIVE_FIRES &&
            chartCriteria.groupByType === ENUM_GROUP_BY_TYPE.SUSPECTED_CAUSES) {
                barChartSettings.xAxisLabel = 'Suspected Causes';
                barChartSettings.yAxisLabel = 'Number of Fires';
                return barChartSettings;
        } else if (chartCriteria.reportType === ENUM_REPORT_TYPE.ACTIVE_FIRES &&
            chartCriteria.groupByType === ENUM_GROUP_BY_TYPE.STAGE_OF_CONTROL) {
            barChartSettings.xAxisLabel = 'Stage of Control';
            barChartSettings.yAxisLabel = 'Number of Fires';
            barChartSettings.customColours = STAGE_OF_CONTROL_CUSTOM_COLOURS;
            return barChartSettings;
        } else if (chartCriteria.reportType === ENUM_REPORT_TYPE.CURRENT_YEAR_FIRES
            && chartCriteria.groupByType === ENUM_GROUP_BY_TYPE.FIRE_CENTRE) {
            barChartSettings.xAxisLabel = 'Fire Centres';
            barChartSettings.yAxisLabel = 'Number of Fires';
            return barChartSettings;
        } else if (chartCriteria.reportType === ENUM_REPORT_TYPE.CURRENT_YEAR_FIRES
            && chartCriteria.groupByType === ENUM_GROUP_BY_TYPE.SUSPECTED_CAUSES) {
            barChartSettings.xAxisLabel = 'Suspected Causes';
            barChartSettings.yAxisLabel = 'Number of Fires';
            return barChartSettings;
        } else if (chartCriteria.reportType === ENUM_REPORT_TYPE.CURRENT_YEAR_FIRES
            && chartCriteria.groupByType === ENUM_GROUP_BY_TYPE.STAGE_OF_CONTROL) {
            barChartSettings.xAxisLabel = 'Stage of Control';
            barChartSettings.yAxisLabel = 'Number of Fires';
            barChartSettings.customColours = STAGE_OF_CONTROL_CUSTOM_COLOURS;
            return barChartSettings;
        } else { return null; }
    } else if (chartCriteria.chartType === ENUM_CHART_TYPE.PIE_CHART) {
        const pieChartSettings: VmPieChartSettings = PIE_CHART_SETTINGS_BASE;
        // if (window.innerHeight > 640 && window.innerWidth > 360) {
        //     const h = (window.innerHeight - 640) / 2;
        //     const w = (window.innerWidth - 360) / 2;
        //     pieChartSettings.view = [350 + w, 400 + h];
        // } else if (window.innerHeight >= 360 && window.innerWidth >= 640) {
        //     const h = (window.innerWidth - 640) / 2;
        //     const w = (window.innerHeight - 360) / 2;
        //     pieChartSettings.view = [375 + w, 225 + h];
        // }
        if ((chartCriteria.reportType === ENUM_REPORT_TYPE.ACTIVE_FIRES
            && chartCriteria.groupByType === ENUM_GROUP_BY_TYPE.FIRE_CENTRE)
            || (chartCriteria.reportType === ENUM_REPORT_TYPE.ACTIVE_FIRES
                && chartCriteria.groupByType === ENUM_GROUP_BY_TYPE.SUSPECTED_CAUSES)
            || (chartCriteria.reportType === ENUM_REPORT_TYPE.ACTIVE_FIRES
                && chartCriteria.groupByType === ENUM_GROUP_BY_TYPE.STAGE_OF_CONTROL)
            || (chartCriteria.reportType === ENUM_REPORT_TYPE.CURRENT_YEAR_FIRES
                && chartCriteria.groupByType === ENUM_GROUP_BY_TYPE.FIRE_CENTRE)
            || (chartCriteria.reportType === ENUM_REPORT_TYPE.CURRENT_YEAR_FIRES
                && chartCriteria.groupByType === ENUM_GROUP_BY_TYPE.SUSPECTED_CAUSES)
            || (chartCriteria.reportType === ENUM_REPORT_TYPE.CURRENT_YEAR_FIRES
                && chartCriteria.groupByType === ENUM_GROUP_BY_TYPE.STAGE_OF_CONTROL)) {
            return pieChartSettings;
        } else { return null; }
    }

    return null;
}

