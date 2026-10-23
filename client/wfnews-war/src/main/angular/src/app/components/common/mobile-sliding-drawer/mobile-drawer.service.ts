import { Injectable } from '@angular/core';

export interface ManagedDrawer {
  /** The height that shows on the screen now, in px. */
  visibleHeight(): number;
  /** Show the Drawer. With a height, it starts there and does not slide in. */
  present(fromHeight: number | null): void;
  slideOut(): void;
  hideNow(): void;
  /** Tell the owner that another Drawer took this one's place. */
  notifyDismissed(): void;
}

// Only one Drawer shows at a time. Requests collect for one microtask, so the
// order in which Angular checks the Drawers does not change the result.
@Injectable({ providedIn: 'root' })
export class MobileDrawerService {
  private active: ManagedDrawer | null = null;
  private leaving: ManagedDrawer | null = null;
  private opening: ManagedDrawer | null = null;
  private closing = new Set<ManagedDrawer>();
  private destroyedHeight: number | null = null;
  private scheduled = false;

  requestOpen(drawer: ManagedDrawer) {
    this.opening = drawer;
    this.closing.delete(drawer);
    this.schedule();
  }

  requestClose(drawer: ManagedDrawer) {
    if (this.opening === drawer) {
      this.opening = null;
    }
    this.closing.add(drawer);
    this.schedule();
  }

  left(drawer: ManagedDrawer) {
    if (this.leaving === drawer) {
      this.leaving = null;
    }
  }

  destroyed(drawer: ManagedDrawer) {
    if (this.opening === drawer) {
      this.opening = null;
    }
    this.closing.delete(drawer);
    this.left(drawer);
    if (this.active === drawer) {
      // A Drawer that opens in the same tick takes this one's place.
      this.destroyedHeight = drawer.visibleHeight();
      this.active = null;
    }
    this.schedule();
  }

  private schedule() {
    if (!this.scheduled) {
      this.scheduled = true;
      Promise.resolve().then(() => this.commit());
    }
  }

  private commit() {
    this.scheduled = false;
    const next = this.opening;
    const current = this.active;
    this.opening = null;

    if (next && next !== current) {
      let fromHeight = this.destroyedHeight;
      const outgoing = current ?? this.leaving;
      if (outgoing) {
        fromHeight = outgoing.visibleHeight();
      }
      // A Drawer that opens again while it slides out turns round where it is.
      if (outgoing && outgoing !== next) {
        const ownerClosed = this.closing.has(outgoing) || outgoing === this.leaving;
        outgoing.hideNow();
        if (!ownerClosed) {
          outgoing.notifyDismissed();
        }
      }
      this.leaving = null;
      this.active = next;
      next.present(fromHeight);
    } else if (current && this.closing.has(current)) {
      this.active = null;
      this.leaving = current;
      current.slideOut();
    }

    this.closing.clear();
    this.destroyedHeight = null;
  }
}
