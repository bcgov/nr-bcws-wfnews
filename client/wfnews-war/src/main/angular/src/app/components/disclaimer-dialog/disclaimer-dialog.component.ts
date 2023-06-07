import { Component, Inject } from '@angular/core';
import { MAT_LEGACY_DIALOG_DATA as MAT_DIALOG_DATA, MatLegacyDialogRef as MatDialogRef } from '@angular/material/legacy-dialog';

export class DialogData {
    public title: string;
    public message: string;
}

@Component({
    selector: 'disclaimer-dialog',
    templateUrl: 'disclaimer-dialog.component.html',
    styleUrls: ['./disclaimer-dialog.component.scss']
})
export class DisclaimerDialogComponent {
    dontShowAgain = false;

    constructor(
        public dialogRef: MatDialogRef<DisclaimerDialogComponent>,
        @Inject(MAT_DIALOG_DATA) public data: any
    ) {
    }

    cancel() {
        this.dialogRef.close({dontShowAgain: this.dontShowAgain})
    }

}
