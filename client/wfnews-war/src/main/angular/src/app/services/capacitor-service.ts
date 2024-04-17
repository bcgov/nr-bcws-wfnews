import { EventEmitter, Injectable, NgZone } from '@angular/core';
import { MatSnackBar, MatSnackBarConfig } from '@angular/material/snack-bar';
import { Router } from '@angular/router';
import { FCM } from '@capacitor-community/fcm';
import { App, AppState } from '@capacitor/app';
import { AppLauncher } from '@capacitor/app-launcher';
import { Browser } from '@capacitor/browser';
import { Device } from '@capacitor/device';
import { Geolocation, Position } from '@capacitor/geolocation';
import {
  PushNotificationSchema,
  PushNotifications,
} from '@capacitor/push-notifications';
import { Store } from '@ngrx/store';
import { BehaviorSubject, fromEvent } from 'rxjs';
import { environment } from '../../environments/environment';
import { RootState } from '../store';
import { ApplicationStateService } from './application-state.service';
import { EventEmitterService } from './event-emitter.service';

import { ResourcesRoutes } from '@app/utils';
import { NotificationSnackbarComponent } from '../components/notification-snackbar/notification-snackbar.component';
import { Preferences } from '@capacitor/preferences';

export interface CompassHeading {
  magneticHeading?: number; //The heading in degrees from 0-359.99 at a single moment in time. (Number)
  trueHeading?: number; //The heading relative to the geographic North Pole in degrees 0-359.99 at a single moment in time. A negative value indicates that the true heading can't be determined. (Number)
  headingAccuracy?: number; //The deviation in degrees between the reported heading and the true heading. (Number)
  timestamp?: string; //The time at which this heading was determined. (DOMTimeStamp)
  error?: string;
}

export interface LocationNotification {
  latitude: number;
  longitude: number;
  radius: number;
  featureId: string;
  featureType: string;
  fireYear?: number;
}

export interface ReportOfFireNotification {
  title: string;
  body: string;
}

export interface DeviceProperties {
  isIOSPlatform: boolean;
  isAndroidPlatform: boolean;
  isWebPlatform: boolean;
  isMobilePlatform: boolean;
  deviceId: string;
  isTwitterInstalled: boolean;
}

const UPDATE_AFTER_INACTIVE_MILLIS = 1000 * 60; // 1 minute
const REFRESH_INTERVAL_ACTIVE_MILLIS = 5 * 1000 * 60; // 5 minutes

@Injectable({
  providedIn: 'root',
})
export class CapacitorService {
  resume: BehaviorSubject<boolean>;
  initialized: Promise<any>;
  fbAppInstalled: boolean;
  twitterAppInstalled: boolean;
  appState: AppState;
  isIOSPlatform: boolean;
  isAndroidPlatform: boolean;
  isWebPlatform: boolean;
  deviceId: string;
  pnNav = null;
  notificationToken = null;
  updateMainMapLayers = new EventEmitter();
  currentHeadingPromise: Promise<CompassHeading>;
  locationNotifications = new EventEmitter<LocationNotification>();
  rofNotifications = new EventEmitter<ReportOfFireNotification>();
  inactiveStart: number;
  refreshTimer;
  locationNotificationsDelay = 5000;
  rofNotificationsDelay = 5000;
  notificationSnackbarPromise = Promise.resolve();
  registeredForNotifications = false;
  private devicePropertiesPromise: Promise<DeviceProperties>;

  constructor(
    private zone: NgZone,
    protected router: Router,
    protected store: Store<RootState>,
    protected eventEmitterService: EventEmitterService,
    protected stateService: ApplicationStateService,
    protected snackbar: MatSnackBar,
  ) {
    this.resume = new BehaviorSubject<boolean>(null);
    fromEvent(document, 'resume').subscribe((event) => {
      this.zone.run(() => {
        this.onResume();
      });
    });

    this.isIOSPlatform = false;
    this.isAndroidPlatform = false;
    this.isWebPlatform = false;
    this.fbAppInstalled = false;
    this.twitterAppInstalled = false;
    this.deviceId = '';

    this.initialized = this.checkDevice().then(() => {
      this.init();

      // use for testing notification at startup
      // this.emitLocationNotification( {
      //     coords: '[48.463259,-123.312635]',
      //     radius: '20',
      //     messageID: 'V65055',
      //     topicKey: 'BCWS_ActiveFires_PublicView',
      // } )
    });
  }

  init() {
    const startRefreshTimer = () => {
      stopRefreshTimer();

      this.refreshTimer = setTimeout(() => {
        this.updateMainMapLayers.emit();
        startRefreshTimer();
      }, REFRESH_INTERVAL_ACTIVE_MILLIS);
    };

    const stopRefreshTimer = () => {
      if (!this.refreshTimer) {
return;
}

      clearTimeout(this.refreshTimer);
      this.refreshTimer = null;
    };

    startRefreshTimer();

    App.addListener('appStateChange', (state) => {
      if (state.isActive) {
        startRefreshTimer();

        if (!this.inactiveStart) {
return;
}

        const inactiveDuration = Date.now() - this.inactiveStart;
        this.inactiveStart = null;

        if (inactiveDuration > UPDATE_AFTER_INACTIVE_MILLIS) {
          this.updateMainMapLayers.emit();
        }
      } else {
        if (!this.inactiveStart) {
this.inactiveStart = Date.now();
}

        stopRefreshTimer();
      }
    }).catch((error) => {
      console.error(error);
    });

    if (this.isWebPlatform) {
      this.notificationToken = 'FakeForWeb';
      return;
    }

    this.checkInstalledApps();

    if (this.isAndroidPlatform) {
      App.addListener('backButton', (state) => {
        this.eventEmitterService.androidBackButtonPressed();
      }).catch((error) => {
        console.error(error);
      });
    }

    // Request permission to use push notifications
    this.registerForNotifications()
      .then((registered) => {
        console.log('registeredForNotifications', registered);
        this.registeredForNotifications = registered;
      })
      .catch((error) => {
        console.error(error);
      });

    // On success, we should be able to receive notifications
    PushNotifications.addListener('registration', (token) => {
      console.log('PNN REgister success ' + token.value);
      if (this.isAndroidPlatform) {
        this.notificationToken = token.value;
      } else if (this.isIOSPlatform) {
        FCM.getToken()
          .then((response) => {
            this.notificationToken = response.token;
          })
          .catch((error) => {
            console.error(error);
          });
      }
    }).catch((error) => {
      console.error(error);
    });

    // Some issue with our setup and push will not work
    PushNotifications.addListener('registrationError', (error) => {
      console.log('PNN REgister fail ' + error);
    }).catch((err) => {
      console.error(err);
    });

    // Show us the notification payload if the app is open on our device
    PushNotifications.addListener(
      'pushNotificationReceived',
      (notification) => {
        console.log('pushNotificationReceived', notification);
        this.handleRofPushNotification(notification);
      },
    ).catch((error) => {
      console.error(error);
    });

    // Method called when tapping on a notification
    PushNotifications.addListener('pushNotificationActionPerformed', (ev) => {
      const data = ev.notification.data;
      console.log('pushNotificationActionPerformed', data);

      this.emitLocationNotification(data);
    }).catch((error) => {
      console.error(error);
    });
  }

  async registerForNotifications(): Promise<boolean> {
    let status = await PushNotifications.checkPermissions();
    if (status.receive === 'prompt') {
      status = await PushNotifications.requestPermissions();
    }

    if (status.receive !== 'granted') {
      return false;
    }

    await PushNotifications.register();
    return true;
  }

  handleRofPushNotification(notification: PushNotificationSchema) {
    this.notificationSnackbarPromise = this.notificationSnackbarPromise.then(
      () => new Promise((res, rej) => {
          const sb = this.showNotificationSnackbar(notification);

          sb.onAction().subscribe(() => {
            this.emitLocationNotification(notification.body);
          });

          sb.afterDismissed().subscribe(() => {
            res();
          });
        }),
    );

    return true;
  }

  emitRofNotification(title, body) {
    setTimeout(() => {
      try {
        this.rofNotifications.emit({ title, body });

        this.rofNotificationsDelay = 0;
      } catch (e) {
        console.warn('push notification not handled:', e, title + ': ' + body);
      }
    }, this.rofNotificationsDelay);
  }

  handleLocationPushNotification(notification: PushNotificationSchema) {
    this.notificationSnackbarPromise = this.notificationSnackbarPromise.then(
      () => new Promise((res, rej) => {
          const sb = this.showNotificationSnackbar(notification);

          sb.onAction().subscribe(() => {
            const c = JSON.parse(notification.data['coords']);
              const r = JSON.parse(notification.data['radius']);
            this.router.navigate([ResourcesRoutes.ACTIVEWILDFIREMAP], {
              queryParams: {
                latitude: c[0],
                longitude: c[1],
                radius: r,
                featureId: notification.data['messageID'],
                featureType: notification.data['topicKey'],
                identify: true,
                notification: true,
                time: Date.now(),
              },
            });
          });

          sb.afterDismissed().subscribe(() => {
            res();
          });
        }),
    );

    return true;
  }

  emitLocationNotification(data) {
    setTimeout(() => {
      try {
        const c = JSON.parse(data['coords']);
          const r = JSON.parse(data['radius']);

        this.locationNotifications.emit({
          latitude: c[0],
          longitude: c[1],
          radius: r,
          featureId: data['messageID'],
          featureType: data['topicKey'],
        });

        this.locationNotificationsDelay = 0;
      } catch (e) {
        console.warn('push notification not handled:', e, data);
      }
    }, this.locationNotificationsDelay);
  }

  showNotificationSnackbar(notification: any) {
    const cfg: MatSnackBarConfig<any> = {
      data: { notification },
      // need to change back to 10 sec. Using 60 sec for testing purpose in case QA missed it.
      duration: 60 * 1000,
      verticalPosition: 'top',
    };

    return this.snackbar.openFromComponent(NotificationSnackbarComponent, cfg);
  }

  checkDevice() {
    // const deviceInfo = <DeviceInfo>
    return Device.getInfo()
      .then((devInfo) => {
        console.log(devInfo);
        if (!devInfo) {
return;
}

        this.isIOSPlatform = devInfo.platform === 'ios';
        this.isAndroidPlatform = devInfo.platform === 'android';
        this.isWebPlatform =
          devInfo.platform !== 'ios' && devInfo.platform !== 'android';

        return Device.getId();
      })
      .then((deviceId) => {
        console.log(deviceId);
        this.deviceId = deviceId.identifier;
      });
  }

  async getCurrentPosition(options?: PositionOptions): Promise<Position> {
    const coordinates = Geolocation.getCurrentPosition(options);
    return coordinates;
  }

  checkInstalledApps() {
    this.checkTwitterAppInstalled().then(
      (result) => {
        this.twitterAppInstalled = result;
      },
      (error) => {
        this.twitterAppInstalled = false;
      },
    );

    this.checkFbAppInstalled().then(
      (result) => {
        this.fbAppInstalled = result;
      },
      (error) => {
        this.fbAppInstalled = false;
      },
    );
  }

  onResume(): void {
    this.resume.next(true);
  }

  openLinkInAppBrowser(url: string) {
    Browser.open({
      url,
      toolbarColor: '#f7f7f9',
    }).catch((error) => {
      console.error(error);
    });
  }

  private async checkTwitterAppInstalled(): Promise<boolean> {
    if (this.isMobilePlatform()) {
      const scheme = this.isIOSPlatform ? 'twitter://' : 'com.twitter.android';
      const ret = await AppLauncher.canOpenUrl({ url: scheme });
      return ret.value;
    }
    return false;
  }

  private async checkFbAppInstalled(): Promise<boolean> {
    if (this.isMobilePlatform()) {
      const scheme = this.isIOSPlatform ? 'fb://' : 'com.facebook.katana';
      const ret = await AppLauncher.canOpenUrl({ url: scheme });
      return ret.value;
    }
    return false;
  }

  private async appIsInstalled(scheme: string): Promise<boolean> {
    const ret = await AppLauncher.canOpenUrl({ url: scheme });
    return ret.value;
  }

  initOfflinePageSettings() {
    App.addListener('appStateChange', (state: AppState) => {
      this.appState = state;
    }).catch((error) => {
      console.error(error);
    });
  }

  public isMobilePlatform(): boolean {
    if (this.isIOSPlatform || this.isAndroidPlatform) {
      return true;
    }
    return !!environment['is_mobile_platform'];
  }

  getPnUrl() {
    return this.pnNav;
  }

  public getNotificationToken() {
    return this.notificationToken;
  }

  public setNotificationToken(token: string) {
    this.notificationToken = token;
  }

  openUrlInApp(url: string) {
    let scheme;
    let schemeUrl;
    // twitter
    if (url.indexOf('twitter.com/') !== -1) {
      scheme = this.isIOSPlatform ? 'twitter://' : 'com.twitter.android';
      schemeUrl = 'twitter://user?screen_name=' + url.split('twitter.com/')[1];
    }

    if (scheme && schemeUrl) {
      AppLauncher.openUrl({ url: schemeUrl }).catch((error) => {
        console.error(error);
      });
    }
  }

  isAndroid() {
    return this.isAndroidPlatform;
  }

  isIOS() {
    return this.isIOSPlatform;
  }

  getCurrentHeading(): Promise<CompassHeading> {
    const compass = navigator['compass'];
    if (!compass) {
return Promise.reject(Error('navigator.compass not available'));
} else {
      const currentHeading = new Promise((res, rej) => {
        compass.getCurrentHeading(
          (heading: CompassHeading) => {
            res(heading);
            this.currentHeadingPromise = null;
          },
          (error) => {
            rej(Error('Failed to get heading: ' + JSON.stringify(error)));
            this.currentHeadingPromise = null;
          },
        );
      });

      this.currentHeadingPromise = currentHeading;

      return this.currentHeadingPromise;
    }
  }

  async checkDeviceSystem() {
    // const deviceInfo = <DeviceInfo>
    try {
      const deviceInfo = await Device.getInfo();
      return deviceInfo;
    } catch (error) {
      console.error('Error getting device info:', error);
    }
  }

  get deviceProperties(): Promise<DeviceProperties> {
    if (!this.devicePropertiesPromise) {
this.devicePropertiesPromise = Device.getInfo()
        .then((devInfo) => Device.getId().then((deviceId) => {

            const p = devInfo && devInfo.platform;
              const prop: DeviceProperties = {
                isIOSPlatform: p == 'ios',
                isAndroidPlatform: p == 'android',
                isWebPlatform: p != 'ios' && p != 'android',
                isMobilePlatform:
                  p == 'ios' ||
                  p == 'android' ||
                  !!environment['is_mobile_platform'],
                deviceId: deviceId.identifier,
                isTwitterInstalled: false,
              };
            const scheme = prop.isIOSPlatform
              ? 'twitter://'
              : 'com.twitter.android';
            return AppLauncher.canOpenUrl({ url: scheme })
              .then((canOpen) => {
                prop.isTwitterInstalled = canOpen.value;
                return prop;
              })
              .catch((e) => {
                console.warn(e);
                return prop;
              });
          }))
        .catch((e) => {
          console.warn(e);
          return {
            isIOSPlatform: false,
            isAndroidPlatform: false,
            isWebPlatform: false,
            isMobilePlatform: false,
            deviceId: '',
            isTwitterInstalled: false,
          };
        });
}

    return this.devicePropertiesPromise;
  }

  get isMobile(): Promise<boolean> {
    return this.deviceProperties.then((p) => p.isMobilePlatform);
  }

  async saveData(key: string, value: string) {
    await Preferences.set({
      key: key,
      value: value
    });
  }
  
  async getData(key: string) {
    const response = await Preferences.get({ key: key });
    return response.value;
  }

  async removeData(key: string) {
    await Preferences.remove({ key: key })
  }
}


