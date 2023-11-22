import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { CapacitorService } from '@app/services/capacitor-service';
import { AppConfigService, TokenService } from "@wf1/core-ui";

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
  

@Injectable({
    providedIn: 'root'
})

export class NotificationService {
  constructor(private appConfigService: AppConfigService, private httpClient: HttpClient, private capacitorService: CapacitorService) {  }

    public updateUserNotificationPreferences(notificationSettings) {
        return this.capacitorService.deviceProperties.then(p => {
                const url = `${this.appConfigService.getConfig().rest['notification-api']}/notificationSettings/${p.deviceId}`
                let headers = new HttpHeaders({
                    'apikey': this.appConfigService.getConfig().application['wfnewsApiKey'],
                })
                const token = this.capacitorService.getNotificationToken();
                const notificationSettingRsrc = convertToNotificationSettingRsrc(notificationSettings)
                notificationSettingRsrc.notificationToken = token
                notificationSettingRsrc.deviceType = p.isAndroidPlatform ? 'android' : 'ios'

                return this.httpClient.put<NotificationSettingRsrc>(url, notificationSettingRsrc, { headers }).toPromise()
        })
    }
}

export function convertToNotificationSettingRsrc(np: VmNotificationPreferences): NotificationSettingRsrc {
    return {
        '@type': 'http://notifications.wfone.nrs.gov.bc.ca/v1/notificationSettings',
        notifications: np.notificationDetails.map( nd => {
            return {
                '@type': 'http://notifications.wfone.nrs.gov.bc.ca/v1/notification',
                notificationName: nd.name,
                notificationType: nd.type,
                radius: nd.radius,
                topics: nd.preferences,
                point: {
                    type: 'Point',
                    coordinates: [ nd.locationCoords.long, nd.locationCoords.lat ],
                    crs: null
                },
                activeIndicator: nd.active
            }
        } ),
        notificationToken: null,
        subscriberToken: np.subscriberToken || 'subscriberToken',
        subscriberGuid: np.subscriberGuid,
        deviceType: null,
    } as NotificationSettingRsrc;
}

