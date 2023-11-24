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
  constructor(private appConfigService: AppConfigService, private http: HttpClient, private capacitorService: CapacitorService) {  }

    public updateUserNotificationPreferences(notificationSettings): Promise<any> {
        return this.capacitorService.deviceProperties.then(p => {
                console.log("device properties:'",p)
                const url = `${this.appConfigService.getConfig().rest['notification-api']}/notificationSettings/${p.deviceId}`
                let headers = new HttpHeaders({
                    'apikey': this.appConfigService.getConfig().application['wfnewsApiKey'],
                })
                const token = this.capacitorService.getNotificationToken();
                const notificationSettingRsrc = convertToNotificationSettingRsrc(notificationSettings)
                notificationSettingRsrc.subscriberGuid = p.deviceId
                notificationSettingRsrc.notificationToken = token
                notificationSettingRsrc.deviceType = p.isAndroidPlatform ? 'android' : 'ios'

                return this.http.put<NotificationSettingRsrc>(url, notificationSettingRsrc, { headers }).toPromise()
            })
    }
}


export function convertToNotificationSettingRsrc(np: any): NotificationSettingRsrc {
    let notificationTopics = [];
    if (np.pushNotificationsFireBans) {
        notificationTopics.push("British_Columbia_Bans_and_Prohibition_Areas");
        notificationTopics.push("British_Columbia_Area_Restrictions");
    }
    if (np.pushNotificationsWildfires) {
        notificationTopics.push("BCWS_ActiveFires_PublicView");
        notificationTopics.push("Evacuation_Orders_and_Alerts");
    }
    return {
        '@type': 'http://notifications.wfone.nrs.gov.bc.ca/v1/notificationSettings',
        notifications: [
            {
                '@type': 'http://notifications.wfone.nrs.gov.bc.ca/v1/notification',
                notificationName: np.notificationName,
                notificationType: 'nearme',
                radius: np.radius,
                point: {
                    type: 'Point',
                    coordinates: [np.longitude, np.latitude],
                    crs: null
                },
                activeIndicator: true,
                topics:notificationTopics
            }
        ],
        notificationToken: null,
        subscriberToken: 'subscriberTpken',
        subscriberGuid: null,
        deviceType: null,
    } as unknown as NotificationSettingRsrc;
}