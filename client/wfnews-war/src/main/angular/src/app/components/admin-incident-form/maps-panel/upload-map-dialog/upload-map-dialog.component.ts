import { Component } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';
import { AttachmentResource } from '@wf1/incidents-rest-api/model/attachmentResource';

export class DialogData {
    public attachment: AttachmentResource;
}

@Component({
    selector: 'upload-map-dialog',
    templateUrl: 'upload-map-dialog.component.html',
    styleUrls: ['./upload-map-dialog.component.scss']
})
export class UploadMapDialogComponent {
  public title = ''
  public file: File;

    constructor (
      public dialogRef: MatDialogRef<UploadMapDialogComponent>
    ) {}

    pdfInputChange (fileInputEvent: Event) {
      this.title = (fileInputEvent.target as any).files[0].name
      this.file = (fileInputEvent.target as any).files[0]
    }

    returnResult () {
      return {
        title: this.title,
        file: this.file
      }
    }
}
