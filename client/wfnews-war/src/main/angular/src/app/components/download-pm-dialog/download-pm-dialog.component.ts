import { Component, Inject } from '@angular/core';
import { MAT_LEGACY_DIALOG_DATA as MAT_DIALOG_DATA, MatLegacyDialogRef as MatDialogRef } from '@angular/material/legacy-dialog';

export class DialogData {
    public title: string;
    public message: string;
}

@Component({
    selector: 'download-pm-dialog',
    templateUrl: 'download-pm-dialog.component.html',
    styleUrls: ['./download-pm-dialog.component.scss']
})
export class DownloadPMDialogComponent {
    dontShowAgain = false;

    constructor(
        public dialogRef: MatDialogRef<DownloadPMDialogComponent>,
        @Inject(MAT_DIALOG_DATA) public data: any
    ) {
    }

    cancel() {
        this.dialogRef.close({dontShowAgain: this.dontShowAgain})
    }

    download() {
        window.open(this.data.downloadLink, '_blank');
        this.dialogRef.close({dontShowAgain: this.dontShowAgain})
    }

}
