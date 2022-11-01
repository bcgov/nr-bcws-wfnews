import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';

export class DialogData {
    public video: any;
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