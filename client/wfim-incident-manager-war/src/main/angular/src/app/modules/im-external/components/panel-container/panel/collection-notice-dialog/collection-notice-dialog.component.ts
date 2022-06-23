import { Component, Inject } from "@angular/core";
import { FormBuilder } from "@angular/forms";
import { MatDialogRef, MAT_DIALOG_DATA } from "@angular/material/dialog";
import { ApplicationStateService } from "../../../../../../services/application-state.service";

@Component({
    selector: 'collection-notice-dialog',
    templateUrl: './collection-notice-dialog.component.html',
    styleUrls: ['./collection-notice-dialog.component.scss'],
})
export class CollectionNoticeDialogComponent {
    titleLabel = "BC Wildfire Service - Collection Notice";
    dontShowAgain = false;

    constructor(
        public dialogRef: MatDialogRef<CollectionNoticeDialogComponent>,
        protected applicationStateService: ApplicationStateService,

        protected fb: FormBuilder,
        @Inject(MAT_DIALOG_DATA) public data: any
    ) {
        dialogRef.disableClose = true;
    }

    ok(): void {
        this.dialogRef.close({dontShowAgain: this.dontShowAgain});
    }

    cancel() {
        this.dialogRef.close("cancel");
    }

}
