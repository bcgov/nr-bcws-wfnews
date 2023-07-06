import {PublicAppHeaderActionItem} from "@wf1/core-ui/lib/public-application-header.module";

export const stub_header_items: PublicAppHeaderActionItem[] = [
    {
        icon: 'message',
        label: 'Messages',
        badge: 5,
        callBackFunction: null,
        menuItems: [{label: 'Message 1', icon: 'star_rate'},
            {label: 'Message 2', icon: 'star_rate'},
            {label: 'Message 3', icon: 'star_rate'}]
    },
    {icon: 'notifications_none',
        label: 'Notifications',
        badge: 2,
        callBackFunction: null,
        menuItems: [{label: 'Notification 1', icon: 'note'},
            {label: 'Notification 2', icon: 'note'},
            {label: 'Notification 3', icon: 'note'},
            {label: 'Notification 4', icon: 'note'}]
    },
    {icon: 'account_circle_outline',
        label: 'My Account',
        badge: 0,
        callBackFunction: null,
        menuItems: [{label: 'Donald Duck'},
            {label: 'Account', icon: 'account_box'},
            {label: 'Settings', icon: 'settings'},
            {label: 'Company Profile', icon: 'account_box'},
            {label: 'Sign Out', icon: 'power_settings_new'}]
    }
];
