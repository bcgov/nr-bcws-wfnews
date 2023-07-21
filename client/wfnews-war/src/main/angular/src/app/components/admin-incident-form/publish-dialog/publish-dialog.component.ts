import { Component } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';
import { AttachmentResource } from '@wf1/incidents-rest-api/model/attachmentResource';

export class DialogData {
    public attachment: AttachmentResource;
}

@Component({
    selector: 'publish-dialog',
    templateUrl: 'publish-dialog.component.html',
    styleUrls: ['./publish-dialog.component.scss']
})
export class PublishDialogComponent {
  public title = ''
  public file: File;

    constructor (
      public dialogRef: MatDialogRef<PublishDialogComponent>
    ) {}

    pdfInputChange (fileInputEvent: Event) {
      this.title = (fileInputEvent.target as any).files[0].name
      this.file = (fileInputEvent.target as any).files[0]
    }

    returnResult () {
      return {
        publish: true
      }
    }
}
