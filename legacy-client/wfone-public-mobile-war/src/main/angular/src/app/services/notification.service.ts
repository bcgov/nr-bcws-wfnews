import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { convertToNotifications } from '../conversion/conversion-from-rest';
import { convertToNotificationSettingRsrc } from '../conversion/conversion-to-rest';
import { VmNotificationPreferences } from '../conversion/models';
import { NotificationSettingRsrc } from './../conversion/resources';
import { AppConfigService } from './app-config.service';
import { CapacitorService } from './capacitor-service';

@Injectable({
    providedIn: 'root'
})
export class NotificationService {
    private notificationServiceUrl: string;
    private notificationsApiKey: string;

    constructor(
        private http: HttpClient,
        private appConfig: AppConfigService,
        private capacitorService: CapacitorService
    ) {
        this.appConfig.loadAppConfig().then(() => {
            this.notificationServiceUrl = this.appConfig.getAppResourcesConfig().notificationsApiUrl
            this.notificationsApiKey = this.appConfig.getConfig().applicationResources['notifications-api-key'];
        })
    }

    getUserNotificationPreferences(): Promise<VmNotificationPreferences> {
        return this.capacitorService.deviceProperties
            .then(p => {
                let url = `${this.notificationServiceUrl}/notificationSettings/${p.deviceId}`
                let headers = new HttpHeaders({
                    'apikey': this.notificationsApiKey,
                })

                return this.http.get<NotificationSettingRsrc>(url, { headers }).toPromise()
            })
            .then(resp => {
                let notificationInfo = convertToNotifications(resp)

                return notificationInfo
            })
    }

    updateUserNotificationPreferences(notificationSettings: VmNotificationPreferences) {
        return this.capacitorService.deviceProperties.then(p => {
            return this.capacitorService.notificationToken.then(t => {
                let url = `${this.notificationServiceUrl}/notificationSettings/${p.deviceId}`
                let headers = new HttpHeaders({
                    'apikey': this.notificationsApiKey,
                })

                const notificationSettingRsrc = convertToNotificationSettingRsrc(notificationSettings)
                notificationSettingRsrc.notificationToken = t
                notificationSettingRsrc.deviceType = p.isAndroidPlatform ? 'android' : 'ios'

                return this.http.put<NotificationSettingRsrc>(url, notificationSettingRsrc, { headers }).toPromise()
            })
        })
    }
}
