import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { isMobileView } from '@app/utils';
import { AttachmentResource } from '@wf1/incidents-rest-api/model/attachmentResource';

export class DialogData {
  public attachment: AttachmentResource;
}

@Component({
  selector: 'contact-us-dialog',
  templateUrl: 'contact-us-dialog.component.html',
  styleUrls: ['./contact-us-dialog.component.scss'],
})
export class ContactUsDialogComponent {
  public title = '';
  public file: File;
  isMobileView = isMobileView;


  constructor(
    public dialogRef: MatDialogRef<ContactUsDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data,
  ) {}
}
