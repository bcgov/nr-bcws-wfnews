import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';

@Component({
  selector: 'rof-location-services-dialog',
  templateUrl: './location-services-dialog.component.html',
})
export class LocationServicesDialogComponent {
  locationServicesAlert: string;

  constructor(
    private dialogRef: MatDialogRef<LocationServicesDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { message: string },
  ) {
    this.locationServicesAlert = this.data.message;
  }

  close(result: boolean) {
    this.dialogRef.close(result);
  }
}
