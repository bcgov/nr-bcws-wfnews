import { VmNotificationPreferences } from './models';
import { NotificationSettingRsrc } from './resources';

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
