import { Component } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';

@Component({
  selector: 'unsaved-changes-dialog',
  templateUrl: 'unsaved-changes-dialog.component.html',
  styleUrls: ['./unsaved-changes-dialog.component.scss'],
})
export class UnsavedChangesDialog {
  constructor(protected dialogRef: MatDialogRef<UnsavedChangesDialog>) {}

  returnResult(value: boolean) {
    return value;
  }
}
