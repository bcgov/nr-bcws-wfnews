import { Injectable } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import {
  PermissionKind,
  PermissionService,
  PermissionState,
} from '@app/services/permission.service';
import {
  PermissionDialogComponent,
  PermissionDialogData,
  PermissionDialogResult,
} from './permission-dialog.component';

export type PermissionOptions = Omit<PermissionDialogData, 'kind' | 'state'>;

@Injectable({ providedIn: 'root' })
export class PermissionDialogService {
  constructor(
    private dialog: MatDialog,
    private permissionService: PermissionService,
  ) {}

  /**
   * Call from a tap. Asks when asking can work, and opens the dialog only when the
   * answer is still not granted.
   */
  async ensure(
    kind: PermissionKind,
    options: PermissionOptions = {},
  ): Promise<PermissionDialogResult> {
    let state = await this.permissionService.check(kind);
    // A browser can grant the site and still have no position, so it must ask.
    const mustAsk = kind === 'location' && this.permissionService.isWeb;
    if (state === 'prompt' || (mustAsk && state === 'granted')) {
      state = await this.permissionService.request(kind);
    }
    return state === 'granted' ? 'granted' : this.open(kind, state, options);
  }

  open(
    kind: PermissionKind,
    state: PermissionState,
    options: PermissionOptions = {},
  ): Promise<PermissionDialogResult> {
    const ref = this.dialog.open<
      PermissionDialogComponent,
      PermissionDialogData,
      PermissionDialogResult
    >(PermissionDialogComponent, {
      autoFocus: false,
      width: '80vw',
      maxWidth: '400px',
      data: { kind, state, ...options },
    });
    return ref
      .afterClosed()
      .toPromise()
      .then((result) => result ?? 'cancel');
  }
}
