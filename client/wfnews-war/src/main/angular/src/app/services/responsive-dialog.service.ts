import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import { ComponentType } from '@angular/cdk/portal';
import { Injectable } from '@angular/core';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';

/**
 * Opens a dialog at a fixed size that fills the screen on a phone, and follows a rotation
 * until the dialog closes.
 */
@Injectable({ providedIn: 'root' })
export class ResponsiveDialogService {
  constructor(
    private dialog: MatDialog,
    private breakpointObserver: BreakpointObserver,
  ) {}

  open<T, D = any, R = any>(
    component: ComponentType<T>,
    width: string,
    height: string,
    data?: D,
  ): MatDialogRef<T, R> {
    const dialogRef = this.dialog.open<T, D, R>(component, {
      width,
      height,
      maxWidth: '100vw',
      maxHeight: '100dvh',
      data,
    });

    const sizeSubscription = this.breakpointObserver
      .observe(Breakpoints.XSmall)
      .subscribe((size) => {
        if (size.matches) {
          dialogRef.updateSize('100%', '100%');
        } else {
          dialogRef.updateSize(width, height);
        }
      });

    dialogRef.afterClosed().subscribe(() => sizeSubscription.unsubscribe());
    return dialogRef;
  }
}
