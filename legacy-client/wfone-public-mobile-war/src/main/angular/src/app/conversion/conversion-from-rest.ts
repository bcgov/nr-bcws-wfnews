import {HttpErrorResponse} from "@angular/common/http";
import {ERROR_TYPE, ErrorState} from "../store/application/application.state";
import {UUID} from "angular2-uuid";
import {TitleCasePipe} from "@angular/common";
import {
    BanProhibitionsRSSFeedRsrc,
    BanProhibitionsRSSItemRsrc,
    FireStatsRsrc,
    StatsFeatureAttributeBaseRsrc,
    StatsFeatureBaseRsrc,
    NotificationRsrc,
    NotificationSettingRsrc
} from "./resources";
import {
    VmActiveFiresLastXDaysStat,
    VmActiveFiresStat,
    VmAdvisory,
    VmBanProhibition,
    VmBanProhibitionRSSFeed,
    VmBanProhibitionRSSItem,
    VmBarChartData,
    VmChart,
    VmCurrentYearFiresLastXDaysStat,
    VmCurrentYearFiresStat,
    VmFireCentre,
    VmFireCentreStat,
    VmFireChartInfo,
    VmFireStatus,
    VmOverviewActiveFireStats,
    VmOverviewCurrentYearFireStats,
    VmPieChartData,
    VmStageOfControlStat,
    VmSuspectedCauseStat,
    VmNotificationPreferences,
    VmNotificationDetail
} from "./models";
import {ENUM_CHART_TYPE, ENUM_GROUP_BY_TYPE, getChartSettings} from "../components/current-stats/current-stats-utils";
import {
    FIRE_BAN_TYPES,
    getFireCentreByContainsName,
    getFireCentreById,
    getFireCentreByName,
    removeCData
} from "../utils";
import {ChartCriteria} from "../store/current-stats/current-stats.state";
import {NgxXml2jsonService} from "ngx-xml2json";


export function convertToErrorState(error: Error, resourceName?: string): ErrorState {
    if (!error) { return null; }
    if (error instanceof HttpErrorResponse || error.name === 'HttpErrorResponse') {
        const err = error as HttpErrorResponse;
        if (err.status === 404) {
            return {
                uuid: UUID.UUID(),
                type: ERROR_TYPE.NOT_FOUND,
                status: err.status,
                statusText: err.statusText,
                message: resourceName ? `${resourceName} not found` : err.message,
                name: err.name,
                responseEtag : err.headers.get('ETag'),
            };
        }
        if (err.status === 412) {
            return {
                uuid: UUID.UUID(),
                type: ERROR_TYPE.FAILED_PRECONDITION,
                status: err.status,
                statusText: err.statusText,
                message: resourceName ? `${resourceName} has changed since last retrieve` : err.message,
                name: err.name,
                responseEtag : err.headers.get('ETag'),
            };
        }

        if (err.status >= 500 || err.status === 0) {
            return {
                uuid: UUID.UUID(),
                type: ERROR_TYPE.FATAL,
                status: err.status,
                statusText: err.statusText,
                message: resourceName ? `Unexpected error performing operation on ${resourceName}` : err.message,
                name: err.name,
                responseEtag : undefined,
            };
        }

        return {
            uuid: UUID.UUID(),
            type: err.status === 400 ? ERROR_TYPE.VALIDATION : ERROR_TYPE.FATAL,
            status: err.status,
            statusText: err.statusText,
            message: err.status === 400 ? 'Validation Error' : err.message,
            name: err.name,
            validationErrors: err.error.errors,
            responseEtag : err.headers.get('ETag'),
        };
    } else {
        throw error;
    }

}

export function convertToBanProhibition(banProhibitionRsrc: StatsFeatureAttributeBaseRsrc): VmBanProhibition {
    const titlecasePipe: TitleCasePipe = new TitleCasePipe();

    // console.log('convertToBanProhibitionItem: ', banProhibitionRsrc);
    if (!banProhibitionRsrc) { return null; }

    const comments = banProhibitionRsrc.Comments.split(',');
    const hasCategory2Prohibition = !!comments.find(comment => comment === FIRE_BAN_TYPES.OPEN_FIRES_CATEGORY_2.value);
    const hasCategory3Prohibition = !!comments.find(comment => comment === FIRE_BAN_TYPES.OPEN_FIRES_CATEGORY_3.value);
    const hasCampfireProhibition = !!comments.find(comment => comment === FIRE_BAN_TYPES.CAMP_FIRES.value);
    const hasForestUseRestriction = !!comments.find(comment => comment === FIRE_BAN_TYPES.FOREST_USE.value);

    let openFiresStatus: VmFireStatus = VmFireStatus.UNRESTRICTED;
    let openFiresStatusDesc: string;
    let openFireBanInEffect: boolean;

    if (hasCategory2Prohibition || hasCategory3Prohibition) {
        openFiresStatus = VmFireStatus.PROHIBITIONS;
        openFireBanInEffect = true;
    }
    openFiresStatusDesc = titlecasePipe.transform(VmFireStatus[openFiresStatus]);

    // console.log('openFiresStatus: ' + openFiresStatus);
    // console.log('openFiresStatusDesc: ' + openFiresStatusDesc);

    let campFireStatus: VmFireStatus = VmFireStatus.PERMITTED;
    let campFireStatusDesc: string;
    let campFireBanInEffect: boolean;

    if (hasCampfireProhibition) {
        campFireStatus = VmFireStatus.PROHIBITIONS;
        campFireBanInEffect = true;
    }
    campFireStatusDesc = titlecasePipe.transform(VmFireStatus[campFireStatus]);

    // console.log('campFireStatus: ' + campFireStatus);
    // console.log('campFireStatusDesc: ' + campFireStatusDesc);

    let forestUseStatus: VmFireStatus = VmFireStatus.UNRESTRICTED;
    let forestUseStatusDesc: string;
    let forestUseRestricionsInEffect: boolean;

    if (hasForestUseRestriction) {
        forestUseStatus = VmFireStatus.PROHIBITIONS;
        forestUseRestricionsInEffect = true;
    }
    forestUseStatusDesc = titlecasePipe.transform(VmFireStatus[forestUseStatus]);

    // console.log('forestUseStatus: ' + forestUseStatus);
    // console.log('forestUseStatusDesc: ' + forestUseStatusDesc);

    return {
            fireCentre: getFireCentreByName(banProhibitionRsrc.FireCentre),
            campfiresStatus: campFireStatus,
            campfiresStatusDesc: campFireStatusDesc,
            campFireBanInEffect: campFireBanInEffect,
            openFiresStatus: openFiresStatus,
            openFiresDesc: openFiresStatusDesc,
            openFireBanInEffect: openFireBanInEffect,
            forestUseStatus: forestUseStatus,
            forestUseDesc: forestUseStatusDesc,
            forestUseRestrictionsInEffect: forestUseRestricionsInEffect,
            hasProhibitions: true,
            prohibitionType: banProhibitionRsrc.Type,
            prohibitions: banProhibitionRsrc.Comments.split(',')
        };

}


export function convertToAdvisory(advisoryRsrc: StatsFeatureAttributeBaseRsrc): VmAdvisory {
    const titlecasePipe: TitleCasePipe = new TitleCasePipe();

    // console.log('convertToBanProhibitionItem: ', banProhibitionRsrc);
    if (!advisoryRsrc) { return null; }

    const comments = advisoryRsrc.Comments.split(',');
    const hasCategory2Prohibition = !!comments.find(comment => comment === FIRE_BAN_TYPES.OPEN_FIRES_CATEGORY_2.value);
    const hasCategory3Prohibition = !!comments.find(comment => comment === FIRE_BAN_TYPES.OPEN_FIRES_CATEGORY_3.value);
    const hasCampfireProhibition = !!comments.find(comment => comment === FIRE_BAN_TYPES.CAMP_FIRES.value);
    const hasForestUseRestriction = !!comments.find(comment => comment === FIRE_BAN_TYPES.FOREST_USE.value);

    let openFiresStatus: VmFireStatus = VmFireStatus.UNRESTRICTED;
    let openFiresStatusDesc: string;
    let openFireBanInEffect: boolean;

    if (hasCategory2Prohibition || hasCategory3Prohibition) {
        openFiresStatus = VmFireStatus.PROHIBITIONS;
        openFireBanInEffect = true;
    }
    openFiresStatusDesc = titlecasePipe.transform(VmFireStatus[openFiresStatus]);

    // console.log('openFiresStatus: ' + openFiresStatus);
    // console.log('openFiresStatusDesc: ' + openFiresStatusDesc);

    let campFireStatus: VmFireStatus = VmFireStatus.PERMITTED;
    let campFireStatusDesc: string;
    let campFireBanInEffect: boolean;

    if (hasCampfireProhibition) {
        campFireStatus = VmFireStatus.PROHIBITIONS;
        campFireBanInEffect = true;
    }
    campFireStatusDesc = titlecasePipe.transform(VmFireStatus[campFireStatus]);

    // console.log('campFireStatus: ' + campFireStatus);
    // console.log('campFireStatusDesc: ' + campFireStatusDesc);

    let forestUseStatus: VmFireStatus = VmFireStatus.UNRESTRICTED;
    let forestUseStatusDesc: string;
    let forestUseRestricionsInEffect: boolean;

    if (hasForestUseRestriction) {
        forestUseStatus = VmFireStatus.PROHIBITIONS;
        forestUseRestricionsInEffect = true;
    }
    forestUseStatusDesc = titlecasePipe.transform(VmFireStatus[forestUseStatus]);

    // console.log('forestUseStatus: ' + forestUseStatus);
    // console.log('forestUseStatusDesc: ' + forestUseStatusDesc);

    return {
        fireCentre: getFireCentreByName(advisoryRsrc.FireCentre),
        campfiresStatus: campFireStatus,
        campfiresStatusDesc: campFireStatusDesc,
        campFireBanInEffect: campFireBanInEffect,
        openFiresStatus: openFiresStatus,
        openFiresDesc: openFiresStatusDesc,
        openFireBanInEffect: openFireBanInEffect,
        forestUseStatus: forestUseStatus,
        forestUseDesc: forestUseStatusDesc,
        forestUseRestrictionsInEffect: forestUseRestricionsInEffect,
        hasProhibitions: true,
        prohibitionType: advisoryRsrc.Type,
        prohibitions: advisoryRsrc.Comments.split(',')
    };

}

export function convertToOverviewActiveFireStats(activeFiresStatRsrc: FireStatsRsrc,
                                                 activeFiresLastXDaysStatRsrc: FireStatsRsrc,
                                                 lastXDays: number): VmOverviewActiveFireStats {
    // console.log("convertToOverviewActiveFireStats: ", activeFiresStatRsrc);
    if (!activeFiresStatRsrc || !activeFiresLastXDaysStatRsrc) { return null; }

    const activeFireStat: VmActiveFiresStat = {
        numFires: activeFiresStatRsrc.features[0].attributes.value
    };
    // console.log("convertToOverviewActiveFireStats activeFireStat: ", activeFireStat);

    const activeFiresLastXDaysStat: VmActiveFiresLastXDaysStat = {
        numFires: activeFiresLastXDaysStatRsrc.features[0].attributes.value,
        lastXDays: lastXDays
    };
    // console.log("convertToOverviewActiveFireStats activeFiresLastXDaysStat: ", activeFiresLastXDaysStat);

    return {
        firesStat: activeFireStat,
        firesLastXDaysStat: activeFiresLastXDaysStat
    };

}

export function convertToOverviewCurrentYearFireStats(currentYearFiresStatRsrc: FireStatsRsrc,
                                                      currentYearFiresLastXDaysStatRsrc: FireStatsRsrc,
                                                      lastXDays: number): VmOverviewCurrentYearFireStats {
    // console.log("convertToOverviewCurrentYearFireStats: ", currentYearFiresStatRsrc);
    if (!currentYearFiresStatRsrc || !currentYearFiresLastXDaysStatRsrc) { return null; }

    const currentYearFireStat: VmCurrentYearFiresStat = {
        numFires: currentYearFiresStatRsrc.features[0].attributes.value
    };
    // console.log("convertToOverviewCurrentYearFireStats currentYearFireStat: ", currentYearFireStat);

    const currentYearFiresLastXDaysStat: VmCurrentYearFiresLastXDaysStat = {
        numFires: currentYearFiresLastXDaysStatRsrc.features[0].attributes.value,
        lastXDays: lastXDays
    };
    // console.log("convertToOverviewCurrentYearFireStats currentYearFiresLastXDaysStat: ", currentYearFiresLastXDaysStat);

    return {
        firesStat: currentYearFireStat,
        firesLastXDaysStat: currentYearFiresLastXDaysStat
    };

}

export function convertToChartInfo(chartCriteria: ChartCriteria, fireStatRsrc: FireStatsRsrc,
): VmFireChartInfo {
    // console.log('convertToChartInfo: ', fireStatRsrc);
    if (!fireStatRsrc) { return null; }

    let chartInfo: VmFireChartInfo;
    // console.log('chart criteria: ', chartCriteria);

    if (chartCriteria.groupByType === ENUM_GROUP_BY_TYPE.SUSPECTED_CAUSES) {
        chartInfo = convertToSuspectedCauseChartInfo(chartCriteria, fireStatRsrc);
    } else if (chartCriteria.groupByType === ENUM_GROUP_BY_TYPE.FIRE_CENTRE) {
        chartInfo = convertToFireCentresChartInfo(chartCriteria, fireStatRsrc);
    } else if (chartCriteria.groupByType === ENUM_GROUP_BY_TYPE.STAGE_OF_CONTROL) {
        chartInfo = convertToStageOfControlChartInfo(chartCriteria, fireStatRsrc);
    }

    // console.log('vmchartInfo: ', chartInfo);
    return chartInfo;
}

export function convertToBanProhibitionRSSFeed(ngxXml2jsonService: NgxXml2jsonService, response: string): VmBanProhibitionRSSFeed {
    const sanitizedResponse = removeCData(response);
    const parser = new DOMParser();
    const xml = parser.parseFromString(sanitizedResponse, 'text/xml');
    // console.log('xml: ', xml);
    const rssFeedRsrc: BanProhibitionsRSSFeedRsrc = ngxXml2jsonService.xmlToJson(xml) as BanProhibitionsRSSFeedRsrc;
    // console.log('rssFeedRsrc: ', rssFeedRsrc);

    const feedItems: VmBanProhibitionRSSItem[] = [];

    rssFeedRsrc.rss.channel.item.forEach((item: BanProhibitionsRSSItemRsrc) => {
        // console.log('item: ', item);

        const feedItem: VmBanProhibitionRSSItem = {
           fireCentre: getFireCentreByContainsName(item.title),
           link: item.link.trim(),
           description: item.description.trim(),
           title: item.title.trim(),
           publishDate: item.pubDate.trim(),
           openFireBanInEffect: false,
           campFireBanInEffect: false,
           forestUseRestrictionsInEffect: false
       };

       if (feedItem.description.match(/open fire bans are currently in effect/gi)) {
           // console.log('open fire ban found');
           feedItem.openFireBanInEffect = true;
       }

        if (feedItem.description.match(/campfire ban is currently in effect/gi)) {
            // console.log('campfire ban found');
            feedItem.campFireBanInEffect = true;
        }

        if (feedItem.description.match(/forest use restrictions are currently in effect/gi)) {
            // console.log('forest use restrictions found');
            feedItem.forestUseRestrictionsInEffect = true;
        }

        feedItems.push(feedItem);
    });

    const result: VmBanProhibitionRSSFeed = {
        items: feedItems
    };

    // console.log('result: ', result);

    return result;
}


export function convertToAdvisoryRSSFeed(ngxXml2jsonService: NgxXml2jsonService, response: string): VmBanProhibitionRSSFeed {
    const sanitizedResponse = removeCData(response);
    const parser = new DOMParser();
    const xml = parser.parseFromString(sanitizedResponse, 'text/xml');
    // console.log('xml: ', xml);
    const rssFeedRsrc: BanProhibitionsRSSFeedRsrc = ngxXml2jsonService.xmlToJson(xml) as BanProhibitionsRSSFeedRsrc;
    // console.log('rssFeedRsrc: ', rssFeedRsrc);

    const feedItems: VmBanProhibitionRSSItem[] = [];

    rssFeedRsrc.rss.channel.item.forEach((item: BanProhibitionsRSSItemRsrc) => {
        // console.log('item: ', item);

        const feedItem: VmBanProhibitionRSSItem = {
            fireCentre: getFireCentreByContainsName(item.title),
            link: item.link.trim(),
            description: item.description.trim(),
            title: item.title.trim(),
            publishDate: item.pubDate.trim(),
            openFireBanInEffect: false,
            campFireBanInEffect: false,
            forestUseRestrictionsInEffect: false
        };

        if (feedItem.description.match(/open fire bans are currently in effect/gi)) {
            // console.log('open fire ban found');
            feedItem.openFireBanInEffect = true;
        }

        if (feedItem.description.match(/campfire ban is currently in effect/gi)) {
            // console.log('campfire ban found');
            feedItem.campFireBanInEffect = true;
        }

        if (feedItem.description.match(/forest use restrictions are currently in effect/gi)) {
            // console.log('forest use restrictions found');
            feedItem.forestUseRestrictionsInEffect = true;
        }

        feedItems.push(feedItem);
    });

    const result: VmBanProhibitionRSSFeed = {
        items: feedItems
    };

    // console.log('result: ', result);

    return result;
}

function convertToFireCentresChartInfo(chartCriteria: ChartCriteria, fireStatRsrc: FireStatsRsrc): VmFireChartInfo {
    const fireCentreStats: VmFireCentreStat[] = [];
    const chartData: any[] = [];

    fireStatRsrc.features.forEach((featureRsrc: StatsFeatureBaseRsrc) => {
        const fireCentre: VmFireCentre = getFireCentreById(featureRsrc.attributes.FIRE_CENTRE);
        const fireCentreStat: VmFireCentreStat = {
            fireCentre: fireCentre,
            numFires: featureRsrc.attributes.value
        };
        fireCentreStats.push(fireCentreStat);

        if (chartCriteria.chartType === ENUM_CHART_TYPE.BAR_CHART) {
            chartData.push({name: fireCentre.name, value: featureRsrc.attributes.value} as VmBarChartData);
        } else {
            chartData.push({name: fireCentre.name, value: featureRsrc.attributes.value} as VmPieChartData);
        }
    });

    const chart: VmChart = {
        chartSettings: getChartSettings(chartCriteria),
        data: chartData
    };

    return {
        stats: fireCentreStats,
        chart: chart
    };

}

function convertToSuspectedCauseChartInfo(chartCriteria: ChartCriteria, fireStatRsrc: FireStatsRsrc): VmFireChartInfo {
    const suspectedCauseStats: VmSuspectedCauseStat[] = [];
    const chartData: any[] = [];

    fireStatRsrc.features.forEach((featureRsrc: StatsFeatureBaseRsrc) => {
        const suspectedCauseStat: VmSuspectedCauseStat = {
            suspectedCause: featureRsrc.attributes.FIRE_CAUSE.toString(),
            numFires: featureRsrc.attributes.value
        };
        suspectedCauseStats.push(suspectedCauseStat);

        if (chartCriteria.chartType === ENUM_CHART_TYPE.BAR_CHART) {
            chartData.push({name: suspectedCauseStat.suspectedCause, value: featureRsrc.attributes.value} as VmBarChartData);
        } else {
            chartData.push({name: suspectedCauseStat.suspectedCause, value: featureRsrc.attributes.value} as VmPieChartData);
        }
    });

    const chart: VmChart = {
        chartSettings: getChartSettings(chartCriteria),
        data: chartData
    };

    return {
        stats: suspectedCauseStats,
        chart: chart
    };

}


function convertToStageOfControlChartInfo(chartCriteria: ChartCriteria, fireStatRsrc: FireStatsRsrc): VmFireChartInfo {
    const stageOfControlStats: VmStageOfControlStat[] = [];
    const chartData: any[] = [];

    fireStatRsrc.features.forEach((featureRsrc: StatsFeatureBaseRsrc) => {
        const stageOfControlStat: VmStageOfControlStat = {
            stageOfControl: featureRsrc.attributes.FIRE_STATUS.toString(),
            numFires: featureRsrc.attributes.value
        };
        stageOfControlStats.push(stageOfControlStat);

        if (chartCriteria.chartType === ENUM_CHART_TYPE.BAR_CHART) {
            chartData.push({name: stageOfControlStat.stageOfControl, value: featureRsrc.attributes.value} as VmBarChartData);
        } else {
            chartData.push({name: stageOfControlStat.stageOfControl, value: featureRsrc.attributes.value} as VmPieChartData);
        }
    });

    const chart: VmChart = {
        chartSettings: getChartSettings(chartCriteria),
        data: chartData
    };

    return {
        stats: stageOfControlStats,
        chart: chart
    };

}

export function convertToNotifications(notificationSettingRsrc: NotificationSettingRsrc): VmNotificationPreferences {
    const details: VmNotificationDetail[] = [];
    notificationSettingRsrc.notifications.forEach((notificationRsrc: NotificationRsrc) => {
        const detail: VmNotificationDetail = {
            name: notificationRsrc.notificationName,
            type: notificationRsrc.notificationType,
            radius: notificationRsrc.radius,
            preferences: notificationRsrc.topics,
            locationCoords: {long: notificationRsrc.point.coordinates[0], lat: notificationRsrc.point.coordinates[1]},
            active: notificationRsrc.activeIndicator,
        };
        details.push(detail);
    });

    return {
        subscriberGuid: notificationSettingRsrc.subscriberGuid,
        subscriberToken: notificationSettingRsrc.subscriberToken,
        deviceType: notificationSettingRsrc.deviceType,
        notificationToken: notificationSettingRsrc.notificationToken,
        notificationDetails: details
    };
}
