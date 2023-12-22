import { Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';

@Component({
  selector: 'rof-location-services-dialog',
  templateUrl: './location-services-dialog.component.html',
})
export class LocationServicesDialogComponent {
  locationServicesAlert: String;

  constructor(@Inject(MAT_DIALOG_DATA) public data: { message: String }) {
    this.locationServicesAlert = this.data.message;
  }
}
