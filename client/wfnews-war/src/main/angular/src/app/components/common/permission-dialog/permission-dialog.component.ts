import { Component, Inject, OnDestroy } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import {
  locationBannerAction,
  PERMISSION_DIALOG,
} from '@app/components/common/permission-banner/permission-banner.constants';
import { CapacitorService } from '@app/services/capacitor-service';
import {
  PermissionKind,
  PermissionService,
  PermissionState,
} from '@app/services/permission.service';
import { Subscription } from 'rxjs';
import { skip } from 'rxjs/operators';

export interface PermissionDialogData {
  kind: PermissionKind;
  state: PermissionState;
  cancelLabel?: string;
  /** Why the screen that opened the dialog needs location. It comes before the text. */
  reason?: string;
}

export type PermissionDialogResult = 'granted' | 'cancel';

// Safari never fires the permission `change` event, so the dialog reads the state.
const RECHECK_INTERVAL = 2 * 1000;

/**
 * The answer to a tap that needs a permission and does not have it. It offers the
 * one action that can repair the state, and closes by itself when that works.
 */
@Component({
  selector: 'wfnews-permission-dialog',
  templateUrl: './permission-dialog.component.html',
  styleUrls: ['./permission-dialog.component.scss'],
})
export class PermissionDialogComponent implements OnDestroy {
  readonly text = PERMISSION_DIALOG;
  state: PermissionState;
  busy = false;
  private permissionSubscription: Subscription;
  private recheckTimer?: ReturnType<typeof setInterval>;
  private rechecking = false;

  constructor(
    private dialogRef: MatDialogRef<
      PermissionDialogComponent,
      PermissionDialogResult
    >,
    @Inject(MAT_DIALOG_DATA) public data: PermissionDialogData,
    private permissionService: PermissionService,
    private capacitorService: CapacitorService,
  ) {
    this.state = data.state;
    // The app reads the state again when the user comes back from the settings.
    if (data.kind === 'location') {
      this.permissionSubscription = this.capacitorService.locationPermission
        .pipe(skip(1))
        .subscribe((state) => {
          if (state === 'granted') {
            this.close('granted');
          }
        });
      if (permissionService.isWeb) {
        this.recheckTimer = setInterval(
          () => this.recheckBrowser(),
          RECHECK_INTERVAL,
        );
      }
    }
  }

  ngOnDestroy(): void {
    this.permissionSubscription?.unsubscribe();
    clearInterval(this.recheckTimer);
  }

  /** Granted is not a position: the device can still have location off, or no fix. */
  private async recheckBrowser(): Promise<void> {
    if (this.busy || this.rechecking) {
      return;
    }
    this.rechecking = true;
    try {
      const permission = await this.permissionService.readBrowserLocation();
      // With no query, a request could raise the browser prompt on every tick.
      if (permission === undefined) {
        return;
      }
      if (permission !== 'granted') {
        this.state = permission;
        return;
      }
      this.state = await this.permissionService.request('location');
    } finally {
      this.rechecking = false;
    }
    if (this.state === 'granted') {
      this.close('granted');
    }
  }

  private get where(): 'app' | 'web' {
    return this.permissionService.isWeb ? 'web' : 'app';
  }

  get title(): string {
    if (this.data.kind === 'compass') {
      return this.text.compass.title.off;
    }
    const title = this.text.location.title;
    switch (this.state) {
      case 'no-position':
        return title.noPosition;
      case 'unsupported':
        return title.unsupported;
      default:
        return title.off;
    }
  }

  get message(): string {
    if (this.data.kind === 'compass') {
      return this.state === 'prompt'
        ? this.text.compass.message.prompt
        : this.text.compass.message.denied;
    }
    const message = this.text.location.message;
    switch (this.state) {
      case 'no-position':
        return message.noPosition;
      case 'unsupported':
        return message.unsupported;
      case 'prompt':
        return this.withReason(message.prompt);
      case 'services-off':
        return this.withReason(message.servicesOff[this.where]);
      default:
        return this.withReason(message.denied[this.where]);
    }
  }

  private withReason(text: string): string {
    return this.data.reason ? `${this.data.reason} ${text}` : text;
  }

  /** Empty when no tap can repair the state, for example a phone with no sensor. */
  get actionLabel(): string | null {
    if (
      this.state === 'granted' ||
      this.state === 'unsupported' ||
      this.state === 'no-position'
    ) {
      return null;
    }
    if (this.state === 'prompt') {
      return this.text[this.data.kind].action.turnOn;
    }
    if (this.permissionService.canOpenSettings(this.data.kind, this.state)) {
      return locationBannerAction(
        this.state,
        this.capacitorService.isIOSPlatform,
      );
    }
    // A browser location change needs no tap: recheckBrowser sees it. The compass
    // tap asks the browser again, the same as the first time.
    return this.data.kind === 'compass' ? this.text.compass.action.turnOn : null;
  }

  /** Nothing can change a device with no location, so the dialog only closes. */
  get cancelLabel(): string {
    if (this.data.cancelLabel) {
      return this.data.cancelLabel;
    }
    return this.state === 'unsupported'
      ? this.text.action.close
      : this.text.action.cancel;
  }

  async act(): Promise<void> {
    this.busy = true;
    try {
      this.state = await this.permissionService.enable(
        this.data.kind,
        this.state,
      );
    } finally {
      this.busy = false;
    }
    if (this.state === 'granted') {
      this.close('granted');
    }
  }

  close(result: PermissionDialogResult): void {
    this.dialogRef.close(result);
  }
}
