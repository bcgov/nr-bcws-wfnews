import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';

@Component({
  selector: 'rof-location-services-dialog',
  templateUrl: './location-services-dialog.component.html',
})
export class LocationServicesDialogComponent {
  locationServicesAlert: string;

  constructor(@Inject(MAT_DIALOG_DATA) public data: { message: string }) {
    this.locationServicesAlert = this.data.message;
  }
}
