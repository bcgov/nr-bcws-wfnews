import { Injectable } from '@angular/core';

/** Taps on the version label that open the diagnostics. */
export const TAPS_TO_UNLOCK = 10;

/** A tap after this gap starts the count again, so stray taps do not add up. */
export const TAP_GAP_MS = 2000;

/**
 * Holds whether the diagnostics screen is open in this session.
 *
 * The state is not kept on the device on purpose. The screen is for a support
 * call, so it must go away when the app does. Ten taps is not a security
 * control: it only keeps the screen out of the way of an ordinary user.
 */
@Injectable({
  providedIn: 'root',
})
export class DebugAccessService {
  private open = false;
  private taps = 0;
  private lastTap = 0;

  get unlocked(): boolean {
    return this.open;
  }

  /**
   * Counts one tap. It gives the taps that are left, so the screen can say how
   * close the user is, and 0 when the screen may open.
   */
  tap(): number {
    const now = Date.now();
    this.taps = now - this.lastTap > TAP_GAP_MS ? 1 : this.taps + 1;
    this.lastTap = now;

    const left = TAPS_TO_UNLOCK - this.taps;
    if (left <= 0) {
      this.open = true;
      this.taps = 0;
      return 0;
    }
    return left;
  }

  lock(): void {
    this.open = false;
    this.taps = 0;
  }
}
