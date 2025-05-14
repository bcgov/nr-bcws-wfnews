import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { DISCLAIMER_TEXT } from '@app/constants';

export class DialogData {
  public title: string;
  public message: string;
}

@Component({
  selector: 'disclaimer-dialog',
  templateUrl: 'disclaimer-dialog.component.html',
  styleUrls: ['./disclaimer-dialog.component.scss'],
})
export class DisclaimerDialogComponent {
  dontShowAgain = false;

  disclaimerText = DISCLAIMER_TEXT.BCWS_GENERAL_DISCLAIMER;

  constructor(
    public dialogRef: MatDialogRef<DisclaimerDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
  ) {}

  cancel() {
    this.dialogRef.close({ dontShowAgain: this.dontShowAgain });
  }
}
