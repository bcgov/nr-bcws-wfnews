import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { AttachmentResource } from '@wf1/incidents-rest-api/model/attachmentResource';

export class DialogData {
    public attachment: any;
}

@Component({
    selector: 'edit-video-dialog',
    templateUrl: 'edit-video-dialog.component.html',
    styleUrls: ['./edit-video-dialog.component.scss']
})
export class EditVideoDialogComponent {

    constructor(
        public dialogRef: MatDialogRef<EditVideoDialogComponent>,
        @Inject(MAT_DIALOG_DATA) public data: DialogData
    ) {}


}