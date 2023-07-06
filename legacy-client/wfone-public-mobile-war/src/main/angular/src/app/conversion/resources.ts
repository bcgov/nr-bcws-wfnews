import { VmGeometry } from './models';

export interface StatsFeatureAttributeBaseRsrc {
  value?: any;
  FIRE_CENTRE?: number;
  FIRE_CAUSE?: number;
  FIRE_STATUS?: string;
  ORG_UNIT_NAME?: string;
  DateDeactivated?: string;
  FireCentre?: string;
  Name?: string;
  Shape__Area?: number;
  Shape__Length?: number;
  URL?: string;
  MOF_FIRE_ZONE_NAME?: string;
  OBJECTID?: number;
  Type?: string;
  Status?: number;
  Comments?: string;
  DateActive?: number;
}

export interface StatsFeatureBaseRsrc {
  attributes: StatsFeatureAttributeBaseRsrc;
}

export interface FireStatsRsrc {
  fields: any[];
  geometryType: string;
  objectIdFieldName: string;
  uniqueIdField: any;
  spatialReference: any;
  globalIdFieldName: any;
  features: StatsFeatureBaseRsrc[];
}

export interface BanProhibitionsRSSItemRsrc {
  text: string[];
  description: string;
  link: string;
  pubDate: string;
  title: string;
}

export interface BanProhibitionsRSSRsrc {
  text: string[];
  channel: {
    text: string[];
    copyright: string;
    description: string;
    item: BanProhibitionsRSSItemRsrc[];
  };
}

export interface BanProhibitionsRSSFeedRsrc {
  rss: BanProhibitionsRSSRsrc;
}

export interface NotificationRsrc {
  notificationName: string;
  notificationType: string;
  radius: number;
  point: VmGeometry;
  topics: string[];
  activeIndicator: boolean;
}

export interface NotificationSettingRsrc {
  deviceType: string;
  subscriberGuid: string;
  subscriberToken: string;
  notificationToken: string;
  notifications: NotificationRsrc[];
}
