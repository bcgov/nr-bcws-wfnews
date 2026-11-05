import { Injectable } from '@angular/core';
import {
  MatSnackBar,
  MatSnackBarRef,
  TextOnlySnackBar,
} from '@angular/material/snack-bar';
import {
  PERMISSION_BANNER,
  PERMISSION_DIALOG,
} from '@app/components/common/permission-banner/permission-banner.constants';
import { Geolocation } from '@capacitor/geolocation';

const MAX_CACHE_AGE = 30 * 1000;
const POSITION_LIMIT = 10 * 1000;
// MDN: a GPS fix "can take a minute or more". With no network, only GPS can answer.
const GPS_POSITION_LIMIT = 60 * 1000;
// A cached position answers before this, so only a real wait shows the notice.
const SEARCHING_NOTICE_DELAY = 300;
const NO_POSITION_DURATION = 10 * 1000;
const SEARCHING = PERMISSION_BANNER.location.reportOfFire.searching;
const SEARCHING_NOTICE = `${SEARCHING.heading}. ${SEARCHING.message}`;

/**
 * The Android plugin does not apply its own `timeout`. A request measured on a
 * Pixel XL was still pending after 100 002 ms with the device Location setting
 * off, so the limit must be here. See PIXEL_XL_FINDINGS_STE.md section 6.3.
 */
function withLimit<T>(work: Promise<T>, limit: number): Promise<T> {
  return new Promise<T>((resolve, reject) => {
    const timer = setTimeout(
      () => reject(new Error('The location request took too long.')),
      limit,
    );
    work.then(
      (value) => {
        clearTimeout(timer);
        resolve(value);
      },
      (error) => {
        clearTimeout(timer);
        reject(error);
      },
    );
  });
}

export interface Coordinates {
  readonly accuracy: number;
  readonly altitude: number | null;
  readonly altitudeAccuracy: number | null;
  readonly heading: number | null;
  readonly latitude: number;
  readonly longitude: number;
  readonly speed: number | null;
}

export interface Position {
  readonly coords: Coordinates;
  readonly timestamp: number;
}

/** The device position. Nothing here asks for the permission; the caller does that. */
@Injectable({
  providedIn: 'root',
})
export class LocationService {
  private locationTime: number;
  private location: Promise<Position>;
  private gpsRequest: Promise<Position | undefined>;

  constructor(private snackbarService: MatSnackBar) {}

  /**
   * A position, but only when the permission is already granted. It never raises the
   * Android dialog. A screen that draws itself with a position must use this, so that
   * it does not ask on load. See LOCATION_AND_STARTUP_PLAN_STE.md section 5.1.
   */
  async getPositionIfPermitted(): Promise<Position | undefined> {
    return this.ifPermitted(() => this.getCurrentLocationPromise());
  }

  /**
   * The same, with time for a cold GPS fix. Offline the Play services check fails,
   * so only the fallback reaches the GPS provider (plugin README).
   */
  getGpsPositionIfPermitted(): Promise<Position | undefined> {
    // A page and a tap can ask at the same time; one request answers both.
    if (!this.gpsRequest) {
      this.gpsRequest = this.ifPermitted(() =>
        withLimit(
          Geolocation.getCurrentPosition({
            enableHighAccuracy: true,
            enableLocationFallback: true,
            maximumAge: MAX_CACHE_AGE,
            timeout: GPS_POSITION_LIMIT,
          }),
          GPS_POSITION_LIMIT,
        ),
      ).finally(() => (this.gpsRequest = undefined));
    }
    return this.gpsRequest;
  }

  /**
   * A position for a tap, after the permission is granted. It tells the user while it
   * waits, and what to do when no position comes. An abort ends it with no message.
   */
  async findPosition(signal?: AbortSignal): Promise<Position | undefined> {
    if (signal?.aborted) {
      return undefined;
    }
    let notice: MatSnackBarRef<TextOnlySnackBar>;
    const timer = setTimeout(() => {
      notice = this.snackbarService.open(SEARCHING_NOTICE);
    }, SEARCHING_NOTICE_DELAY);
    const aborted = new Promise<undefined>((resolve) =>
      signal?.addEventListener('abort', () => resolve(undefined), { once: true }),
    );
    const position = await Promise.race([this.getGpsPositionIfPermitted(), aborted]);
    clearTimeout(timer);
    if (position || signal?.aborted) {
      notice?.dismiss();
      return signal?.aborted ? undefined : position;
    }
    this.snackbarService.open(PERMISSION_DIALOG.location.message.noPosition, '', {
      duration: NO_POSITION_DURATION,
    });
    return undefined;
  }

  getCurrentLocationPromise(): Promise<Position> {
    const now = Date.now();
    if (this.location && this.locationTime && now - this.locationTime < MAX_CACHE_AGE) {
      return this.location;
    }

    // Cache a good answer only. The old code stamped the time before the answer
    // came, so one failure was returned again for the whole window.
    this.location = this.requestPosition().then(
      (position) => {
        this.locationTime = Date.now();
        return position;
      },
      (error) => {
        this.location = undefined;
        this.locationTime = undefined;
        throw error;
      },
    );
    return this.location;
  }

  private requestPosition(): Promise<Position> {
    return withLimit(
      Geolocation.getCurrentPosition({
        // Off, the plugin shows Google's Location Accuracy dialog on every request
        // when that setting is off. On, those users get the LocationManager, which
        // gave no position in 15 s at low accuracy and one in 4 s at high.
        enableLocationFallback: true,
        enableHighAccuracy: true,
        maximumAge: MAX_CACHE_AGE,
        timeout: POSITION_LIMIT,
      }),
      POSITION_LIMIT,
    );
  }

  private async ifPermitted(
    get: () => Promise<Position>,
  ): Promise<Position | undefined> {
    try {
      const status = await Geolocation.checkPermissions();
      if (status.location !== 'granted' && status.coarseLocation !== 'granted') {
        return undefined;
      }
      return await get();
    } catch (error) {
      return undefined;
    }
  }
}
