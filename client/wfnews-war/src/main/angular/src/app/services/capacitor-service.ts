import { EventEmitter, Injectable, NgZone } from '@angular/core';
import { MatSnackBar, MatSnackBarConfig } from '@angular/material/snack-bar';
import { Router } from '@angular/router';
import { FCM } from '@capacitor-community/fcm';
import { App, AppState } from '@capacitor/app';
import { AppLauncher } from '@capacitor/app-launcher';
import { Browser } from '@capacitor/browser';
import { Device } from '@capacitor/device';
import { Geolocation, PermissionStatus, Position } from '@capacitor/geolocation';
import { StatusBar, Style } from '@capacitor/status-bar';
import { NotificationSettings } from '@app/services/notification-settings.plugin';
import {
  PushNotifications,
  PushNotificationSchema,
} from '@capacitor/push-notifications';
import { Store } from '@ngrx/store';
import { BehaviorSubject, fromEvent } from 'rxjs';
import { environment } from '../../environments/environment';
import { RootState } from '../store';
import { ApplicationStateService } from './application-state.service';
import { EventEmitterService } from './event-emitter.service';

import { ResourcesRoutes } from '@app/utils';
import { Preferences } from '@capacitor/preferences';
import {
  AndroidSettings,
  IOSSettings,
  NativeSettings,
} from 'capacitor-native-settings';
import { NotificationSnackbarComponent } from '../components/notification-snackbar/notification-snackbar.component';

export interface CompassHeading {
  //The heading in degrees from 0-359.99 at a single moment in time. (Number)
  magneticHeading?: number;

  // The heading relative to the geographic North Pole in degrees 0-359.99 at a single moment in time. 
  // A negative value indicates that the true heading can't be determined. (Number)
  trueHeading?: number;

  //The deviation in degrees between the reported heading and the true heading. (Number)
  headingAccuracy?: number;

  //The time at which this heading was determined. (DOMTimeStamp)
  timestamp?: string;
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

export type PushPermissionState =
  | 'granted'
  | 'denied'
  | 'prompt'
  | 'unsupported';

/**
 * Location fails one way more than push does. `services-off` means the app has the
 * permission but the phone has location turned off, and no prompt can correct that.
 * It needs a different settings page. See LOCATION_AND_STARTUP_PLAN_STE.md section 5.2.
 */
export type LocationPermissionState =
  | 'granted'
  | 'denied'
  | 'denied-once'
  | 'prompt'
  | 'services-off'
  | 'unsupported';

export interface DeviceProperties {
  isIOSPlatform: boolean;
  isAndroidPlatform: boolean;
  isWebPlatform: boolean;
  isMobilePlatform: boolean;
  deviceId: string;
}

// The plugin reports the phone location setting with these codes: 0007 on both
// platforms, and 0016/0017 from an Android position request.
const LOCATION_OFF_CODES = [
  'OS-PLUG-GLOC-0007',
  'OS-PLUG-GLOC-0016',
  'OS-PLUG-GLOC-0017',
];

const UPDATE_AFTER_INACTIVE_MILLIS = 1000 * 60; // 1 minute
const REFRESH_INTERVAL_ACTIVE_MILLIS = 5 * 1000 * 60; // 5 minutes

@Injectable({
  providedIn: 'root',
})
export class CapacitorService {
  resume: BehaviorSubject<boolean>;
  initialized: Promise<any>;
  fbAppInstalled: boolean;
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
  rofNotificationsDelay = 5000;
  notificationSnackbarPromise = Promise.resolve();
  pushPermission = new BehaviorSubject<PushPermissionState>('prompt');
  locationPermission = new BehaviorSubject<LocationPermissionState>('prompt');
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

  get isMobile(): Promise<boolean> {
    return this.deviceProperties.then((p) => p.isMobilePlatform);
  }

  get deviceProperties(): Promise<DeviceProperties> {
    if (!this.devicePropertiesPromise) {
      this.devicePropertiesPromise = Device.getInfo()
        .then((devInfo) => Device.getId().then((deviceId) => {

          const p = devInfo && devInfo.platform;
          const prop: DeviceProperties = {
            isIOSPlatform: p === 'ios',
            isAndroidPlatform: p === 'android',
            isWebPlatform: p !== 'ios' && p !== 'android',
            isMobilePlatform:
              p === 'ios' ||
              p === 'android' ||
              !!environment['is_mobile_platform'],
            deviceId: deviceId.identifier,
          };
          return prop;
        }))
        .catch((e) => {
          console.warn(e);
          return {
            isIOSPlatform: false,
            isAndroidPlatform: false,
            isWebPlatform: false,
            isMobilePlatform: false,
            deviceId: '',
          };
        });
    }

    return this.devicePropertiesPromise;
  }

  init() {
    this.setStatusBarStyle();

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
        this.onReturnToForeground();

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
      this.pushPermission.next('unsupported');
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

    // Register only. The permission prompt belongs to the first saved location.
    this.registerIfPermitted().catch((error) => {
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

  /** Read the phone permission and publish it. The saved screen banner reads this. */
  async refreshPushPermission(): Promise<PushPermissionState> {
    if (this.isWebPlatform) {
      this.pushPermission.next('unsupported');
      return 'unsupported';
    }

    try {
      const status = await PushNotifications.checkPermissions();
      let state: PushPermissionState;

      if (status.receive === 'granted') {
        state = 'granted';
      } else if (status.receive === 'denied') {
        state = 'denied';
      } else {
        state = 'prompt';
      }

      // Below Android 13 the plugin answers "granted" without looking, because
      // POST_NOTIFICATIONS is a runtime permission only from 13. It also cannot see a
      // blocked channel on any version. Ask the phone itself.
      if (state === 'granted' && this.isAndroidPlatform) {
        state = (await this.areNotificationsEnabled()) ? 'granted' : 'denied';
      }

      if (state !== this.pushPermission.value) {
        this.pushPermission.next(state);
      }
      return state;
    } catch (error) {
      console.error(error);
      return this.pushPermission.value;
    }
  }

  /** Will the phone show our notifications? A missing plugin is not a No. */
  private async areNotificationsEnabled(): Promise<boolean> {
    try {
      const { enabled } = await NotificationSettings.areEnabled();
      return enabled;
    } catch (error) {
      console.error(error);
      return true;
    }
  }

  /** Get the token when the permission is already there. It shows no prompt. */
  async registerIfPermitted(): Promise<PushPermissionState> {
    const state = await this.refreshPushPermission();

    if (state === 'granted') {
      await PushNotifications.register();
    }
    return state;
  }

  /**
   * Ask the phone for the permission. It shows its prompt approximately one time, so a
   * denied state can only be repaired in the phone settings.
   */
  async requestPushPermission(): Promise<PushPermissionState> {
    if (this.isWebPlatform) {
      return 'unsupported';
    }

    try {
      let status = await PushNotifications.checkPermissions();

      if (status.receive !== 'granted' && status.receive !== 'denied') {
        status = await PushNotifications.requestPermissions();
      }

      if (status.receive === 'granted') {
        await PushNotifications.register();
      }
    } catch (error) {
      console.error(error);
    }

    return this.refreshPushPermission();
  }

  /** A denied permission can only be repaired here. The phone shows no second prompt. */
  async openAppSettings(): Promise<void> {
    try {
      if (this.isIOSPlatform) {
        await NativeSettings.openIOS({ option: IOSSettings.App });
      } else if (this.isAndroidPlatform) {
        await NativeSettings.openAndroid({
          option: AndroidSettings.ApplicationDetails,
        });
      }
    } catch (error) {
      console.error(error);
    }
  }

  /**
   * The app is white on every screen. A phone in night mode gives the status bar white
   * icons, and they disappear against the app. Style.Light means dark icons.
   */
  private setStatusBarStyle(): void {
    if (this.isWebPlatform) {
      return;
    }
    StatusBar.setStyle({ style: Style.Light }).catch((error) => {
      console.error(error);
    });
  }

  /**
   * Read the phone location permission and publish it. The banners read this.
   * `checkPermissions` also reports the phone setting: it rejects with 0007 when
   * location is off. That is the fast way, and the only reliable one. A position
   * request cannot answer, because with the setting off the plugin never replies.
   */
  async refreshLocationPermission(): Promise<LocationPermissionState> {
    if (this.isWebPlatform) {
      this.publishLocationPermission('unsupported');
      return 'unsupported';
    }

    let status: PermissionStatus;
    try {
      status = await Geolocation.checkPermissions();
    } catch (error) {
      if (LOCATION_OFF_CODES.includes(error?.code)) {
        this.publishLocationPermission('services-off');
        return 'services-off';
      }
      console.error(error);
      return this.locationPermission.value;
    }

    const granted =
      status.location === 'granted' || status.coarseLocation === 'granted';

    let state: LocationPermissionState;
    if (granted) {
      state = 'granted';
    } else if (status.location === 'denied') {
      state = 'denied';
    } else if (status.location === 'prompt-with-rationale') {
      // The user refused once. Android will ask again, so the way back is a prompt
      // and not the settings page.
      state = 'denied-once';
    } else {
      state = 'prompt';
    }

    this.publishLocationPermission(state);
    return state;
  }


  /**
   * Ask the phone for the permission. Android shows its prompt approximately one time,
   * so a denied state can only be repaired in the settings.
   */
  async requestLocationPermission(): Promise<LocationPermissionState> {
    if (this.isWebPlatform) {
      return 'unsupported';
    }

    try {
      const status = await Geolocation.checkPermissions();
      if (status.location !== 'granted' && status.location !== 'denied') {
        await Geolocation.requestPermissions();
      }
    } catch (error) {
      console.error(error);
    }

    return this.refreshLocationPermission();
  }

  /**
   * Location fails two ways, and each way has its own page. Sending a user to the
   * application page when the phone setting is the problem makes the app look broken.
   */
  async openLocationSettings(state: LocationPermissionState): Promise<void> {
    try {
      if (this.isIOSPlatform) {
        await NativeSettings.openIOS({
          option:
            state === 'services-off'
              ? IOSSettings.LocationServices
              : IOSSettings.App,
        });
      } else if (this.isAndroidPlatform) {
        await NativeSettings.openAndroid({
          option:
            state === 'services-off'
              ? AndroidSettings.Location
              : AndroidSettings.ApplicationDetails,
        });
      }
    } catch (error) {
      console.error(error);
    }
  }

  private publishLocationPermission(state: LocationPermissionState): void {
    if (state !== this.locationPermission.value) {
      this.locationPermission.next(state);
    }
  }

  /** A permission granted in the phone settings needs a register to give us a token. */
  private onReturnToForeground(): void {
    const before = this.pushPermission.value;

    this.refreshPushPermission()
      .then((after) => {
        if (after === 'granted' && before !== 'granted') {
          return PushNotifications.register();
        }
        return undefined;
      })
      .catch((error) => {
        console.error(error);
      });

    // The user may have come back from the location settings page.
    this.refreshLocationPermission().catch((error) => {
      console.error(error);
    });
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

      } catch (e) {
        console.warn('push notification not handled:', e, data);
      }
    }, 0);
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

    if (scheme && schemeUrl) {
      AppLauncher.openUrl({ url: schemeUrl }).catch((error) => {
        console.error(error);
      });
    }
  }

  redirect(url: string, internal = false) {
    if (this.isMobilePlatform() && internal) {
      this.router.navigateByUrl(url);
    } else {
      window.open(url, '_blank');
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

  async saveData(key: string, value: string) {
    await Preferences.set({
      key,
      value
    });
  }

  async getData(key: string) {
    const response = await Preferences.get({ key });
    return response.value;
  }

  async removeData(key: string) {
    await Preferences.remove({ key });
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

}


