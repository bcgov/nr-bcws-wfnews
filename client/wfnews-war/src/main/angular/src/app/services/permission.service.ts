import { Injectable } from '@angular/core';
import {
  CapacitorService,
  LocationPermissionState,
} from '@app/services/capacitor-service';
import {
  CommonUtilityService,
  Position,
} from '@app/services/common-utility.service';

export type PermissionKind = 'location';

/** A position, or the state that explains why there is none. */
export interface LocateResult {
  state: PermissionState;
  position?: Position;
}

/**
 * One state for every permission on every platform. `prompt` means asking can still
 * work; `denied` and `services-off` need a setting changed outside the app.
 * `no-position` is a timeout: location is on, but no position came back yet.
 */
export type PermissionState =
  | 'granted'
  | 'prompt'
  | 'denied'
  | 'services-off'
  | 'no-position'
  | 'unsupported';

// The browser timeout starts after the user answers its prompt.
const BROWSER_POSITION_LIMIT = 10 * 1000;
const BROWSER_GPS_POSITION_LIMIT = 60 * 1000;
const BROWSER_POSITION_AGE = 30 * 1000;

/** Reads, asks for and repairs permissions. `check` never asks; `request` can prompt. */
@Injectable({ providedIn: 'root' })
export class PermissionService {
  constructor(
    private capacitorService: CapacitorService,
    private commonUtilityService: CommonUtilityService,
  ) {}

  get isWeb(): boolean {
    return this.capacitorService.isWebPlatform;
  }

  /**
   * One position. The app never prompts here; a browser prompts on `prompt`, so call
   * it from a tap there. Offline, it waits longer, because only GPS can answer.
   */
  async locate(offline = false): Promise<LocateResult> {
    if (this.isWeb) {
      return this.locateInBrowser(offline);
    }
    const state = await this.check('location');
    if (state !== 'granted') {
      return { state };
    }
    const position = offline
      ? await this.commonUtilityService.getGpsPositionIfPermitted()
      : await this.commonUtilityService.getPositionIfPermitted();
    return position ? { state, position } : { state: 'no-position' };
  }

  async check(kind: PermissionKind): Promise<PermissionState> {
    if (this.isWeb) {
      return this.checkBrowserLocation();
    }
    return fromLocationState(
      await this.capacitorService.refreshLocationPermission(),
    );
  }

  async request(kind: PermissionKind): Promise<PermissionState> {
    if (this.isWeb) {
      return this.requestBrowserLocation();
    }
    return fromLocationState(
      await this.capacitorService.requestLocationPermission(),
    );
  }

  /** Only the app can open a settings page. A browser keeps its settings to itself. */
  canOpenSettings(kind: PermissionKind, state: PermissionState): boolean {
    return (
      kind === 'location' &&
      !this.isWeb &&
      (state === 'denied' || state === 'services-off')
    );
  }

  async openSettings(kind: PermissionKind, state: PermissionState): Promise<void> {
    if (this.canOpenSettings(kind, state)) {
      // canOpenSettings passes only `denied` and `services-off`.
      await this.capacitorService.openLocationSettings(
        state as LocationPermissionState,
      );
    }
  }

  /** The one action that can repair the state: ask again, or open the settings. */
  async enable(
    kind: PermissionKind,
    state: PermissionState,
  ): Promise<PermissionState> {
    if (this.canOpenSettings(kind, state)) {
      await this.openSettings(kind, state);
      return state;
    }
    return this.request(kind);
  }

  /**
   * Reads the browser permission with no prompt. Undefined when the browser has no
   * query (Safari before 16): then only a request can tell.
   */
  async readBrowserLocation(): Promise<PermissionState | undefined> {
    if (!navigator.geolocation) {
      return 'unsupported';
    }
    try {
      const status = await navigator.permissions.query({ name: 'geolocation' });
      return status.state as PermissionState;
    } catch {
      return undefined;
    }
  }

  private async checkBrowserLocation(): Promise<PermissionState> {
    return (await this.readBrowserLocation()) ?? 'prompt';
  }

  private async requestBrowserLocation(): Promise<PermissionState> {
    return (await this.locateInBrowser(false)).state;
  }

  private locateInBrowser(offline: boolean): Promise<LocateResult> {
    if (!navigator.geolocation) {
      return Promise.resolve({ state: 'unsupported' });
    }
    return new Promise((resolve) => {
      navigator.geolocation.getCurrentPosition(
        (position) => resolve({ state: 'granted', position }),
        async (error) => resolve({ state: await this.fromPositionError(error) }),
        {
          enableHighAccuracy: offline,
          timeout: offline ? BROWSER_GPS_POSITION_LIMIT : BROWSER_POSITION_LIMIT,
          maximumAge: BROWSER_POSITION_AGE,
        },
      );
    });
  }

  /** A timeout is not a blocked device: location is on, and the fix is slow. */
  private async fromPositionError(
    error: GeolocationPositionError,
  ): Promise<PermissionState> {
    switch (error.code) {
      case error.PERMISSION_DENIED:
        // A prompt closed with no answer also fails here, and the site is not blocked.
        return (await this.readBrowserLocation()) === 'prompt' ? 'prompt' : 'denied';
      case error.TIMEOUT:
        return 'no-position';
      default:
        return 'services-off';
    }
  }
}

export function fromLocationState(
  state: LocationPermissionState,
): PermissionState {
  return state === 'denied-once' ? 'prompt' : state;
}
