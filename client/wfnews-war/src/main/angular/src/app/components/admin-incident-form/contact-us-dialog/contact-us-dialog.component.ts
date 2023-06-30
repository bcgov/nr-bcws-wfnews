import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatLegacyDialogRef } from '@angular/material/legacy-dialog';
import { AttachmentResource } from '@wf1/incidents-rest-api/model/attachmentResource';

export class DialogData {
    public attachment: AttachmentResource;
}

@Component({
    selector: 'contact-us-dialog',
    templateUrl: 'contact-us-dialog.component.html',
    styleUrls: ['./contact-us-dialog.component.scss']
})
export class ContactUsDialogComponent {
  public title = ''
  public file: File;

    constructor (
      public dialogRef: MatLegacyDialogRef<ContactUsDialogComponent>,
      @Inject(MAT_DIALOG_DATA) public data: any
      ) {}

      callFireCentre(phoneNumber:string) {
        const parsedPhoneNumber = parseInt(phoneNumber.replace(/-/g, ""));
        window.open(`tel:${parsedPhoneNumber}`, '_system');
      }

      emailFireCentre(recipientEmail:string) {
        const mailtoUrl = `mailto:${recipientEmail}`;
        window.location.href = mailtoUrl;
      }
}
