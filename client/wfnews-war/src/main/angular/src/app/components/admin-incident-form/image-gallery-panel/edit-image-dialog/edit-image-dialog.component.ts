import { Component, Inject } from '@angular/core';
import { MAT_LEGACY_DIALOG_DATA as MAT_DIALOG_DATA, MatLegacyDialogRef as MatDialogRef } from '@angular/material/legacy-dialog';
import { AttachmentResource } from '@wf1/incidents-rest-api/model/attachmentResource';

export class DialogData {
    public attachment: AttachmentResource;
}

@Component({
    selector: 'edit-image-dialog',
    templateUrl: 'edit-image-dialog.component.html',
    styleUrls: ['./edit-image-dialog.component.scss']
})
export class EditImageDialogComponent {

    constructor(
        public dialogRef: MatDialogRef<EditImageDialogComponent>,
        @Inject(MAT_DIALOG_DATA) public data: DialogData
    ) {}

}
