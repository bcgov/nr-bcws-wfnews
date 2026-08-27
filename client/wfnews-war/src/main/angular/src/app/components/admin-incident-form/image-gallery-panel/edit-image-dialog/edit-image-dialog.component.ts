import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { AttachmentResource } from '@wf1/incidents-rest-api/model/attachmentResource';

export class DialogData {
  public attachment: AttachmentResource;
}

@Component({
  selector: 'edit-image-dialog',
  templateUrl: 'edit-image-dialog.component.html',
  styleUrls: ['./edit-image-dialog.component.scss'],
})
export class EditImageDialogComponent {
  constructor(
    public dialogRef: MatDialogRef<EditImageDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: DialogData,
  ) {}

  // The Button cannot carry [mat-dialog-close], so the dialog closes itself.
  save() {
    this.dialogRef.close(true);
  }

  cancel() {
    this.dialogRef.close(false);
  }
}
