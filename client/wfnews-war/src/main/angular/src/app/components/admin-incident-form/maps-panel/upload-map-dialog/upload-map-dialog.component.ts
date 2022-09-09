import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
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

    constructor(
        public dialogRef: MatDialogRef<UploadMapDialogComponent>,
        @Inject(MAT_DIALOG_DATA) public data: DialogData
    ) {}

}
