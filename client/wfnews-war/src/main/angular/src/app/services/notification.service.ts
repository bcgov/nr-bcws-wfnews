import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { CapacitorService } from '@app/services/capacitor-service';
import { CommonUtilityService } from '@app/services/common-utility.service';
import { CapacitorHttp } from '@capacitor/core';
import { AppConfigService } from '@wf1/core-ui';

export interface NotificationSettingRsrc {
  deviceType: string;
  subscriberGuid: string;
  subscriberToken: string;
  notificationToken: string;
  notifications: NotificationRsrc[];
}

export interface NotificationRsrc {
  notificationName: string;
  notificationType: string;
  radius: number;
  point: VmGeometry;
  topics: string[];
  activeIndicator: boolean;
}

export interface VmGeometry {
  type: string;
  coordinates: number[];
  crs: string;
}

export interface VmNotificationPreferences {
  subscriberGuid: string;
  subscriberToken: string;
  notificationToken: string;
  deviceType: string;
  notificationDetails: VmNotificationDetail[];
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

export interface VmCoordinates {
  long: number;
  lat: number;
}

/** The API rejects a blank notification token. The add screen turns this into a reason. */
export const NOTIFICATION_TOKEN_MISSING = 'NOTIFICATION_TOKEN_MISSING';

export interface BoundingBox {
  latitude: number;
  longitude: number;
}

@Injectable({
  providedIn: 'root',
})
export class NotificationService {
  constructor(
    private appConfigService: AppConfigService,
    private httpClient: HttpClient,
    private capacitorService: CapacitorService,
    private commonUtilityService: CommonUtilityService,
  ) {}

  public updateUserNotificationPreferences(
    notificationSettings,
    savedNotification,
  ): Promise<any> {
    return this.capacitorService.deviceProperties.then((p) => {
      console.log('device properties:\'', p);
      const url = `${
        this.appConfigService.getConfig().rest['notification-api']
      }/notificationSettings/${p.deviceId}`;
      const headers = new HttpHeaders({
        apikey: this.appConfigService.getConfig().application['wfnewsApiKey'],
      });
      const token = this.capacitorService.getNotificationToken();
      if (!token) {
        return Promise.reject(new Error(NOTIFICATION_TOKEN_MISSING));
      }

      const notificationSettingRsrc =
        convertToNotificationSettingRsrc(notificationSettings);
      notificationSettingRsrc.subscriberGuid = p.deviceId;
      notificationSettingRsrc.notificationToken = token;
      notificationSettingRsrc.deviceType = p.isAndroidPlatform
        ? 'android'
        : 'ios';
      if (savedNotification.length) {
        savedNotification.forEach((notification) => {
          notificationSettingRsrc.notifications.push(notification);
        });
      }
      const notificationSettingsJSON: string = JSON.stringify(notificationSettingRsrc);
      if (this.commonUtilityService.hasSQLKeywords(notificationSettingsJSON)) {
        console.error("JSON blob contains SQL keywords. Potential SQL injection attempt.");
        return;
      }

      return this.httpClient
        .put<NotificationSettingRsrc>(url, notificationSettingRsrc, { headers })
        .toPromise();
    });
  }

  public getUserNotificationPreferences(): Promise<any> {
    return this.capacitorService.deviceProperties.then((p) => {
      const url = `${
        this.appConfigService.getConfig().rest['notification-api']
      }/notificationSettings/${p?.deviceId}`;
      const headers = new HttpHeaders({
        apikey: this.appConfigService.getConfig().application['wfnewsApiKey'],
      });
      return this.httpClient.get(url, { headers }).toPromise();
    });
  }

  /**
   * The registration listener only holds the token in memory, so the stored one goes stale
   * when FCM rotates it. Every screen that reads the settings brings the two back in step.
   *
   * Pass the resolved body of getUserNotificationPreferences. It is sent back unchanged
   * except for the token, because the PUT replaces the saved locations with what it is given.
   */
  public syncNotificationToken(settings: NotificationSettingRsrc): Promise<any> {
    const deviceToken = this.capacitorService.getNotificationToken();

    // A blank token fails validation, and a missing list would delete every saved location.
    if (
      !settings ||
      !deviceToken ||
      !Array.isArray(settings.notifications) ||
      settings.notificationToken === deviceToken
    ) {
      return Promise.resolve(null);
    }

    return this.capacitorService.deviceProperties
      .then((p) => {
        // Only the mobile app makes a subscriber. The web has no row and no real token.
        if (!p?.deviceId || p.isWebPlatform) {
          return null;
        }

        const url = `${
          this.appConfigService.getConfig().rest['notification-api']
        }/notificationSettings/${p.deviceId}`;
        const headers = new HttpHeaders({
          apikey: this.appConfigService.getConfig().application['wfnewsApiKey'],
        });

        const body: NotificationSettingRsrc = {
          ...settings,
          subscriberGuid: p.deviceId,
          notificationToken: deviceToken,
          deviceType: p.isAndroidPlatform ? 'android' : 'ios',
        };

        return this.httpClient
          .put<NotificationSettingRsrc>(url, body, { headers })
          .toPromise();
      })
      .catch((error) => {
        // The next screen that reads the settings tries again.
        console.warn('syncNotificationToken failed', error);
        return null;
      });
  }

  public getFireCentreByLocation(bbox: BoundingBox[]): Promise<any> {
    const formattedString = bbox
      .map((pair) => `${pair.longitude} ${pair.latitude}`)
      .join(',');
    let url = (this.appConfigService.getConfig() as any).mapServices[
      'openmapsBaseUrl'
    ] as string;
    url +=
      '?service=WFS&version=1.1.0&request=GetFeature&srsName=EPSG:4326&typename=pub:WHSE_LEGAL_ADMIN_BOUNDARIES.DRP_MOF_FIRE_CENTRES_SP&outputformat=application/json&cql_filter=INTERSECTS(GEOMETRY,SRID=4326;POLYGON((';
    url += formattedString + ')))';
    return this.capacitorService.isMobile.then((isMobile) => {
      if (isMobile) {
        const options = {
          url,
          params: null,
        };
        const resp = CapacitorHttp.get(options);
        return resp;
      } else {
        const resp = this.httpClient.get(url).toPromise();
        return resp;
      }
    });
  }

  public getDangerRatingByLocation(bbox: BoundingBox[]): Promise<any> {
    const formattedString = bbox
      .map((pair) => `${pair.longitude} ${pair.latitude}`)
      .join(',');
    let url = (this.appConfigService.getConfig() as any).mapServices[
      'openmapsBaseUrl'
    ] as string;
    url +=
      '?service=WFS&version=1.1.0&request=GetFeature&srsName=EPSG:4326&typename=pub:WHSE_LAND_AND_NATURAL_RESOURCE.PROT_DANGER_RATING_SP&outputformat=application/json&cql_filter=INTERSECTS(SHAPE,SRID=4326;POLYGON((';
    url += formattedString + ')))';
    return this.capacitorService.isMobile.then((isMobile) => {
      if (isMobile) {
        const options = {
          url,
          params: null,
        };
        const resp = CapacitorHttp.get(options);
        return resp;
      } else {
        const resp = this.httpClient.get(url).toPromise();
        return resp;
      }
    });
  }
}

export function convertToNotificationSettingRsrc(
  np: any,
): NotificationSettingRsrc {
  const notificationTopics = [];
  if (np?.pushNotificationsFireBans) {
    notificationTopics.push('British_Columbia_Bans_and_Prohibition_Areas');
    notificationTopics.push('British_Columbia_Area_Restrictions');
  }
  if (np?.pushNotificationsWildfires) {
    notificationTopics.push('BCWS_ActiveFires_PublicView');
    notificationTopics.push('Evacuation_Orders_and_Alerts');
  }
  return {
    '@type': 'http://notifications.wfone.nrs.gov.bc.ca/v1/notificationSettings',
    notifications: np
      ? [
          {
            '@type': 'http://notifications.wfone.nrs.gov.bc.ca/v1/notification',
            notificationName: np.notificationName,
            notificationType: 'nearme',
            radius: np.radius,
            point: {
              type: 'Point',
              coordinates: [np.longitude, np.latitude],
              crs: null,
            },
            activeIndicator: true,
            topics: notificationTopics,
          },
        ]
      : [],
    notificationToken: null,
    subscriberToken: 'subscriberTpken',
    subscriberGuid: null,
    deviceType: null,
  } as unknown as NotificationSettingRsrc;
}
