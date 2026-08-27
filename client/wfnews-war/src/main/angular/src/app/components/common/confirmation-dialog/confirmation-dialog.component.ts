import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';

export interface ConfirmationDialogData {
  title: string;
  text: string;
  /** Both default to Confirm and Cancel. */
  confirmButton?: string;
  cancelButton?: string;
  /** Paints the confirm button red, for an action a user cannot undo. */
  destructive?: boolean;
  /** Overrides the header mark. It defaults to the warning the permission banner shows. */
  icon?: string;
}

/**
 * Every call site opens the dialog with this. maxWidth clears Material's inline 80vw cap,
 * so the width comes from styles/component/_confirmation-dialog.scss and can follow the
 * breakpoint; a config value cannot, because it is read once at open time.
 */
export const confirmationDialogConfig = {
  autoFocus: 'dialog',
  panelClass: 'wfnews-confirmation-dialog',
  maxWidth: 'none',
};

/** The one confirm dialog. It asks a question and returns the answer as { confirm }. */
@Component({
  selector: 'wfnews-confirmation-dialog',
  templateUrl: './confirmation-dialog.component.html',
  styleUrls: ['./confirmation-dialog.component.scss'],
})
export class ConfirmationDialogComponent {
  constructor(
    private dialogRef: MatDialogRef<ConfirmationDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: ConfirmationDialogData,
  ) {}

  get confirmLabel(): string {
    return this.data.confirmButton || 'Confirm';
  }

  get cancelLabel(): string {
    return this.data.cancelButton || 'Cancel';
  }

  /** Red when the user cannot undo the action, grey for every other question. */
  get icon(): string {
    if (this.data.icon) {
      return this.data.icon;
    }
    return this.data.destructive
      ? '/assets/images/svg-icons/red_warning.svg'
      : '/assets/images/svg-icons/custom_warning.svg';
  }

  closeDialog() {
    this.dialogRef.close({ confirm: false });
  }

  confirm() {
    this.dialogRef.close({ confirm: true });
  }
}
