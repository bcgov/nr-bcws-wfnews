import { Component } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';
import { AttachmentResource } from '@wf1/incidents-rest-api/model/attachmentResource';

export class DialogData {
    public attachment: AttachmentResource;
}

@Component({
    selector: 'upload-video-dialog',
    templateUrl: 'upload-video-dialog.component.html',
    styleUrls: ['./upload-video-dialog.component.scss']
})
export class UploadVideoDialogComponent {
  public title = ''
  public url = '';

    constructor (
      public dialogRef: MatDialogRef<UploadVideoDialogComponent>
    ) {}

    returnResult () {
      return {
        title: this.title,
        url: this.url
      }
    }
}