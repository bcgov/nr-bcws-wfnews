import { Component, Inject } from '@angular/core';
import { MAT_LEGACY_DIALOG_DATA as MAT_DIALOG_DATA, MatLegacyDialogRef as MatDialogRef } from '@angular/material/legacy-dialog';
import { AttachmentResource } from '@wf1/incidents-rest-api/model/attachmentResource';

export class DialogData {
    public attachment: AttachmentResource;
}

@Component({
    selector: 'edit-map-dialog',
    templateUrl: 'edit-map-dialog.component.html',
    styleUrls: ['./edit-map-dialog.component.scss']
})
export class EditMapDialogComponent {

    constructor(
        public dialogRef: MatDialogRef<EditMapDialogComponent>,
        @Inject(MAT_DIALOG_DATA) public data: DialogData
    ) {}

}
