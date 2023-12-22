import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';

@Component({
  selector: 'wildfire-notification-dialog',
  templateUrl: './wildfire-notification-dialog.component.html',
  styleUrls: ['./wildfire-notification-dialog.component.scss'],
})
export class WildfireNotificationDialogComponent {
  constructor(
    private dialogRef: MatDialogRef<WildfireNotificationDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data,
  ) {}

  closeDialog() {
    this.dialogRef.close({ fullDetail: false });
  }

  goToDetail() {
    this.dialogRef.close({ fullDetail: true });
  }
}
