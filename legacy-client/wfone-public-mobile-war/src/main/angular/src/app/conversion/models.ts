export enum VmFireStatus {
  PROHIBITIONS,
  PERMITTED,
  UNRESTRICTED,
  RESTRICTED
}

export interface VmAdvisory {
    fireCentre: VmFireCentre;
    openFiresStatus: VmFireStatus;
    openFiresDesc: string;
    openFireBanInEffect: boolean;
    campfiresStatus: VmFireStatus;
    campfiresStatusDesc: string;
    campFireBanInEffect: boolean;
    forestUseStatus: VmFireStatus;
    forestUseDesc: string;
    forestUseRestrictionsInEffect: boolean;
    hasProhibitions: boolean;
    prohibitionType?: string;
    prohibitions?: string[];
    prohibitionsUrl?: string;
}

export interface VmBanProhibition {
  fireCentre: VmFireCentre;
  openFiresStatus: VmFireStatus;
  openFiresDesc: string;
  openFireBanInEffect: boolean;
  campfiresStatus: VmFireStatus;
  campfiresStatusDesc: string;
  campFireBanInEffect: boolean;
  forestUseStatus: VmFireStatus;
  forestUseDesc: string;
  forestUseRestrictionsInEffect: boolean;
  hasProhibitions: boolean;
  prohibitionType?: string;
  prohibitions?: string[];
  prohibitionsUrl?: string;
}

export interface VmActiveFiresStat {
  numFires: number;
}

export interface VmActiveFiresLastXDaysStat {
  numFires: number;
  lastXDays: number;
}

export interface VmOverviewActiveFireStats {
  firesStat: VmActiveFiresStat;
  firesLastXDaysStat: VmActiveFiresLastXDaysStat;
}

export interface VmFireCentreStat {
    fireCentre: VmFireCentre;
    numFires: number;
}

export interface VmSuspectedCauseStat {
    suspectedCause: string;
    numFires: number;
}

export interface VmStageOfControlStat {
    stageOfControl: string;
    numFires: number;
}

export interface VmFireChartInfo {
    stats: VmFireCentreStat[] | VmSuspectedCauseStat[] | VmStageOfControlStat[];
    chart?: VmChart;
}

export interface VmCurrentYearFiresStat {
  numFires: number;
}

export interface VmCurrentYearFiresLastXDaysStat {
  numFires: number;
  lastXDays: number;
}

export interface VmOverviewCurrentYearFireStats {
  firesStat: VmCurrentYearFiresStat;
  firesLastXDaysStat: VmCurrentYearFiresLastXDaysStat;
}

export interface VmBarChartSettings {
    view?: any[];
    customColours?: any[];
    showXAxis: boolean;
    showYAxis: boolean;
    gradient: boolean;
    showLegend: boolean;
    showXAxisLabel: boolean;
    xAxisLabel: string;
    showYAxisLabel: boolean;
    yAxisLabel: string;
    showDataLabel: boolean;
    rotateXAxisTicks: boolean;
}

export interface VmPieChartSettings {
    //view: any[];
    showLabels: boolean;
    showLegend: boolean;
}

export interface VmOption {
    desc: string;
    value: string;
}

export interface VmFireCentre {
    id: number;
    name: string;
    displayOrder: number;
}

export interface VmBarChartData {
    name: string;
    value: number;
}

export interface VmPieChartData {
    name: string;
    value: number;
}

export interface VmChart {
    chartSettings?: VmBarChartSettings | VmPieChartSettings;
    data: VmBarChartData[] | VmPieChartData[];
}

export interface VmBanProhibitionRSSItem {
    fireCentre: VmFireCentre;
    link: string;
    description: string;
    publishDate: string;
    title: string;
    openFireBanInEffect: boolean;
    campFireBanInEffect: boolean;
    forestUseRestrictionsInEffect: boolean;
}

export interface VmAdvisoryRSSItem {
    fireCentre: VmFireCentre;
    link: string;
    description: string;
    publishDate: string;
    title: string;
    openFireBanInEffect: boolean;
    campFireBanInEffect: boolean;
    forestUseRestrictionsInEffect: boolean;
}

export interface VmBanProhibitionRSSFeed {
    items: VmBanProhibitionRSSItem[];
}

export interface VmAdvisoryRSSFeed {
    items: VmAdvisoryRSSItem[];
}

export interface VmNotificationDetail {
  name: string;
  type: string;
  radius: number;
  preferences: string[];
  locationCoords: VmCoordinates;
  active: boolean;
  mapConfig?: Promise<any>;
}

export interface VmNotificationPreferences {
  subscriberGuid: string;
  subscriberToken: string;
  notificationToken: string;
  deviceType: string;
  notificationDetails: VmNotificationDetail[];
}

export interface VmCoordinates {
  long: number;
  lat: number;
}

export interface VmGeometry {
  type: string;
  coordinates: number[];
  crs: string;
}

