import { EventEmitter, Injectable, NgZone } from '@angular/core';
import { MatSnackBar, MatSnackBarConfig } from '@angular/material';
import { Router } from '@angular/router';
import { FCM } from '@capacitor-community/fcm';
import { Store } from '@ngrx/store';
import { BehaviorSubject, fromEvent } from 'rxjs';
import { EventEmitterService } from 'src/app/services/event-emitter.service';
import { environment } from "../../environments/environment";
import { RootState } from '../store';
import { ApplicationStateService } from './application-state.service';
import { App, AppState } from '@capacitor/app';
import { Network } from '@capacitor/network';
import { Device } from '@capacitor/device';
import { Geolocation, Position } from '@capacitor/geolocation';
import { Browser } from '@capacitor/browser';
import { PushNotification, PushNotifications } from '@capacitor/push-notifications';
import { AppLauncher } from '@capacitor/app-launcher';
import { AndroidPostNotificationPermission } from 'android-post-notification-permission';
import { NotificationConfig, NotificationSnackbarComponent } from '../components/notification-snackbar/notification-snackbar.component';

export interface CompassHeading {
    magneticHeading?: number //The heading in degrees from 0-359.99 at a single moment in time. (Number)
    trueHeading?: number //The heading relative to the geographic North Pole in degrees 0-359.99 at a single moment in time. A negative value indicates that the true heading can't be determined. (Number)
    headingAccuracy?: number //The deviation in degrees between the reported heading and the true heading. (Number)
    timestamp?: string //The time at which this heading was determined. (DOMTimeStamp)
    error?: string
}

export interface LocationNotification {
    latitude: number,
    longitude: number
    radius: number
    featureId: string
    featureType: string
    fireYear?: number
}

export interface DeviceProperties {
    isIOSPlatform: boolean;
    isAndroidPlatform: boolean;
    isWebPlatform: boolean;
    isMobilePlatform: boolean;
    deviceId: string;
    isTwitterInstalled: boolean;
}

// export interface TweetNotification {
//     tweetId: string
// }

const UPDATE_AFTER_INACTIVE_MILLIS = 1000 * 60 // 1 minute
const REFRESH_INTERVAL_ACTIVE_MILLIS = 5 * 1000 * 60 // 5 minutes

@Injectable({
    providedIn: 'root',
})
export class CapacitorService {
    resume: BehaviorSubject<boolean>;
    initialized: Promise<any>;
    appState: AppState;
    private notificationTokenPromiseResolve
    private notificationTokenPromise = new Promise<string>( ( res, rej ) => {
        this.notificationTokenPromiseResolve = res
    } );
    updateMainMapLayers = new EventEmitter();
    currentHeadingPromise: Promise<CompassHeading>
    locationNotifications = new EventEmitter<LocationNotification>()
    inactiveStart: number;
    private refreshTimer
    private locationNotificationsDelay = 5000
    private notificationSnackbarPromise = Promise.resolve()
    registeredForNotifications = false
    private devicePropertiesPromise: Promise<DeviceProperties>

    constructor(
        private zone: NgZone,
        protected router: Router,
        protected store: Store<RootState>,
        protected eventEmitterService: EventEmitterService,
        protected stateService: ApplicationStateService,
        protected snackbar: MatSnackBar
    ) {
        this.resume = new BehaviorSubject<boolean>(null);
        fromEvent(document, 'resume').subscribe(event => {
            this.zone.run(() => {
                this.onResume();
            });
        });

        this.initialized = this.init()
    }

    init() {
        // console.log('init - 1');
        let startRefreshTimer = () => {
            stopRefreshTimer()

            this.refreshTimer = setTimeout( () => {
                this.updateMainMapLayers.emit();
                startRefreshTimer()
            }, REFRESH_INTERVAL_ACTIVE_MILLIS )
        }

        let stopRefreshTimer = () => {
            if ( !this.refreshTimer ) return

            clearTimeout( this.refreshTimer )
            this.refreshTimer = null
        }

        startRefreshTimer()

        App.addListener('appStateChange', (state) => {
            if ( state.isActive ) {
                startRefreshTimer()

                if ( !this.inactiveStart ) return

                let inactiveDuration = Date.now() - this.inactiveStart
                this.inactiveStart = null

                if ( inactiveDuration > UPDATE_AFTER_INACTIVE_MILLIS ) {
                    this.updateMainMapLayers.emit();
                }
            }
            else {
                if ( !this.inactiveStart ) this.inactiveStart = Date.now()

                stopRefreshTimer()
            }
        } )

        return this.deviceProperties.then( p => {
            if (p.isWebPlatform) {
                this.notificationTokenPromiseResolve( "FakeForWeb" )
                return
            }

            if (p.isAndroidPlatform) {
                App.addListener('backButton', (state) => {
                    this.eventEmitterService.androidBackButtonPressed();
                })
            }

            // Request permission to use push notifications
            this.registerForNotifications().then( registered => {
                console.log('registeredForNotifications',registered)
                this.registeredForNotifications = registered
            } )

            // On success, we should be able to receive notifications
            PushNotifications.addListener('registration', (token) => {
                console.log('PNN REgister success ' + token.value);

                if (p.isAndroidPlatform) {
                    this.notificationTokenPromiseResolve( token.value )
                }
                else if (p.isIOSPlatform) {
                    FCM.getToken().then((response) => {
                        this.notificationTokenPromiseResolve( response.token )
                    });
                }
            } );

            // Some issue with our setup and push will not work
            PushNotifications.addListener('registrationError', (error) => {
                console.log('PNN REgister fail ' + error);
            });

            // Show us the notification payload if the app is open on our device
            PushNotifications.addListener('pushNotificationReceived', (notification) => {
                // let data = notification.data
                console.log('pushNotificationReceived', notification)

                // this.handleTweetPushNotification( notification )
                this.handleLocationPushNotification( notification )
            });

            // Method called when tapping on a notification
            PushNotifications.addListener('pushNotificationActionPerformed', (ev) => {
                let data = ev.notification.data
                console.log('pushNotificationActionPerformed', data)

                // if (data.type == 'tweet') {
                //     this.tweetNotifications.emit({
                //         tweetId: data['tweetId']
                //     })
                // }
                // else {
                    this.emitLocationNotification( data )
                // }
            });
        } )
        .then( () => {
            // use for testing notification at startup
            // this.emitLocationNotification( {
            //     coords: '[48.463259,-123.312635]',
            //     radius: '20',
            //     messageID: 'V65055',
            //     topicKey: 'BCWS_ActiveFires_PublicView',
            // } )
        } )

    }

    registerForNotifications(): Promise<boolean> {
        return this.deviceProperties.then( p => {
            if ( p.isAndroidPlatform ) {
                return AndroidPostNotificationPermission.checkPermissions()
                    .then( ( status ) => {
                        console.log('android registerForNotifications status 1',status)
                        if ( status.postNotifications == 'prompt' )
                            return AndroidPostNotificationPermission.requestPermissions()

                        return status
                    } )
                    .then( ( status ) => {
                        console.log('android registerForNotifications status 2',status)
                        if ( status.postNotifications == 'granted' )
                            return PushNotifications.register()
                                .then( () => { return true } )

                        return false
                    } )
            }
            else if ( p.isIOSPlatform ) {
                return PushNotifications.checkPermissions()
                    .then( ( status ) => {
                        console.log('ios registerForNotifications status 1',status)
                        if ( status.receive == 'prompt' )
                            return PushNotifications.requestPermissions()

                        return status
                    } )
                    .then( ( status ) => {
                        console.log('ios registerForNotifications status 2',status)
                        if ( status.receive == 'granted' )
                            return PushNotifications.register()
                                .then( () => { return true } )

                        return false
                    } )
            }
        } )
        .catch( ( e ) => {
            console.warn( e )
            return false
        })
    }

    // handleTweetPushNotification( notification: PushNotification ) {
    //     if ( notification.data.type != 'tweet' ) return false

    //     this.snackbar.open('A new tweet is available ', 'View Tweet')
    //         .onAction().subscribe( () => {
    //             this.tweetNotifications.emit({
    //                 tweetId: notification.data['tweetId']
    //             })
    //         } )

    //     return true
    // }

    handleLocationPushNotification( notification: PushNotification ) {
        // if ( notification.data.type == 'tweet' ) return false

        this.notificationSnackbarPromise = this.notificationSnackbarPromise.then( () => {
            return new Promise( ( res, rej ) => {
                let sb = this.showNotificationSnackbar( notification.title, notification.body )

                sb.onAction().subscribe( () => {
                    this.emitLocationNotification( notification.data )
                } )

                sb.afterDismissed().subscribe( () => {
                    res()
                } )
            } )
        } )

        return true
    }

    emitLocationNotification( data ) {
        setTimeout(() => {
            try {
                let c = JSON.parse(data['coords']),
                    r = JSON.parse(data['radius'])

                this.locationNotifications.emit({
                    latitude: c[0],
                    longitude: c[1],
                    radius: r,
                    featureId: data['messageID'],
                    featureType: data['topicKey']
                })

                this.locationNotificationsDelay = 0
            }
            catch (e) {
                console.warn('push notification not handled:', e, data)
            }
        }, this.locationNotificationsDelay );
    }

    showNotificationSnackbar( title: string, body: string ) {
        let cfg: MatSnackBarConfig<NotificationConfig> = {
            data: { title, body },
            // duration: 20 * 1000,
            verticalPosition: 'top',
            panelClass: 'wfone-notification-snackbar'
        }

        return this.snackbar.openFromComponent( NotificationSnackbarComponent, cfg )
    }

    get deviceProperties(): Promise<DeviceProperties> {
        if ( !this.devicePropertiesPromise ) this.devicePropertiesPromise = Device.getInfo()
            .then( devInfo => {
                console.log(devInfo)

                return Device.getId()
                    .then( deviceId => {
                        console.log(deviceId)

                        let p = devInfo && devInfo.platform,
                            prop: DeviceProperties = {
                                isIOSPlatform: p == 'ios',
                                isAndroidPlatform: p == 'android',
                                isWebPlatform: p != 'ios' && p != 'android',
                                isMobilePlatform: p == 'ios' || p == 'android' || !!environment['is_mobile_platform'],
                                deviceId: deviceId.uuid,
                                isTwitterInstalled: false
                            }

                        const scheme = prop.isIOSPlatform ? 'twitter://' : 'com.twitter.android';
                        return AppLauncher.canOpenUrl( { url: scheme } )
                            .then( canOpen => {
                                prop.isTwitterInstalled = canOpen.value
                                return prop
                            } )
                            .catch( e => {
                                console.warn(e)
                                return prop
                            } )
                    } )
            } )
            .catch( e => {
                console.warn(e)
                return {
                    isIOSPlatform: false,
                    isAndroidPlatform: false,
                    isWebPlatform: false,
                    isMobilePlatform: false,
                    deviceId: '',
                    isTwitterInstalled: false
                }
            } )

        return this.devicePropertiesPromise
    }

    get notificationToken(): Promise<string>{
        return this.notificationTokenPromise
    }

    async getCurrentPosition(options?: PositionOptions): Promise<Position> {
        const coordinates = <Position>await Geolocation.getCurrentPosition(options);
        return coordinates;
    }

    onResume(): void {
        this.resume.next(true);
    }

    initOfflinePageSettings() {
        App.addListener('appStateChange', (state: AppState) => {
            this.appState = state;
        });

        let handler = Network.addListener('networkStatusChange', (status) => {

            if (status.connected === true) {
            } else {
            }
        });
    }

    openUrlInApp(url: string) {
        // let scheme;
        let schemeUrl;
        // twitter
        if (url.indexOf('twitter.com/') !== -1) {
            // scheme = this.isIOSPlatform ? 'twitter://' : 'com.twitter.android';
            schemeUrl = 'twitter://user?screen_name=' + url.split('twitter.com/')[1];
        }

        if ( schemeUrl ) {
            AppLauncher.openUrl({ url: schemeUrl });
        }

    }

    get isAndroid(): Promise<boolean> {
        return this.deviceProperties.then( p => p.isAndroidPlatform )
    }

    get isIOS(): Promise<boolean> {
        return this.deviceProperties.then( p => p.isIOSPlatform )
    }

    get isMobile(): Promise<boolean> {
        return this.deviceProperties.then( p => p.isMobilePlatform )
    }

    get isWeb(): Promise<boolean> {
        return this.deviceProperties.then( p => p.isWebPlatform )
    }

    openUrl( url: string, forTwitter: boolean = false ): Promise<void> {
        return this.deviceProperties.then( p => {
            if ( p.isAndroidPlatform || p.isIOSPlatform ) {
                if ( !forTwitter || !p.isTwitterInstalled ) {
                    return Browser.open( {
                        url: url,
                        toolbarColor: '#f7f7f9'
                    } )
                }

                return this.openUrlInApp( url )
            }

            window.open( url, '_blank' );
        } )
    }

    // handleNotification(notification: PushNotificationActionPerformed) {
    //     if (!this.stateService.getIsLoadedUp()) {
    //         if (notification.notification.data.type === 'tweet') {
    //             this.pnNav = {
    //                 tweetId: notification.notification.data.tweetId
    //             };
    //         }
    //         else {
    //             this.pnNav = {
    //                 coords: notification.notification.data.coords,
    //                 radius: notification.notification.data.radius,
    //                 messageId: notification.notification.data.messageId,
    //                 topic: notification.notification.data.topic
    //             };
    //         }
    //     }
    //     else {
    //         if (notification.notification.data.type === 'tweet') {
    //             this.router.navigate([WFOnePublicMobileRoutes.LATEST_NEWS_DETAIL], {
    //                 queryParams: {
    //                     tweetId: notification.notification.data.tweetId
    //                 }
    //             } );
    //         }
    //         else {
    //             let time = Date.now();
    //             this.router.navigate([WFOnePublicMobileRoutes.LANDING], {
    //                 queryParams: {
    //                     coords: notification.notification.data.coords,
    //                     radius: notification.notification.data.radius,
    //                     messageId: notification.notification.data.messageId,
    //                     topic: notification.notification.data.topic,
    //                     time: time
    //                 }
    //             } );
    //         }
    //     }
    // }

    getCurrentHeading(): Promise<CompassHeading> {
        let compass = navigator['compass']
        if (!compass) return Promise.reject(Error('navigator.compass not available'))

        if (!this.currentHeadingPromise)
            this.currentHeadingPromise = new Promise((res, rej) => {
                compass.getCurrentHeading(
                    (heading: CompassHeading) => {
                        res(heading)
                        this.currentHeadingPromise = null
                    },
                    (error) => {
                        rej(Error('Failed to get heading: ' + JSON.stringify(error)))
                        this.currentHeadingPromise = null
                    }
                )
            })

        return this.currentHeadingPromise
    }
}
