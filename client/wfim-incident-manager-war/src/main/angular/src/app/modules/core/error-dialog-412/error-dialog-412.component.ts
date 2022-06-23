import { ChangeDetectionStrategy, Component, Inject } from "@angular/core";
import { MatDialogRef, MAT_DIALOG_DATA } from "@angular/material/dialog";
import { ERROR_TYPE } from "../../../store/validation/validation.state";
import { WFError } from "../models/wf-error";

@Component({
    selector: 'error-dialog-412',
    templateUrl: './error-dialog-412.component.html',
    styleUrls: ['./error-dialog-412.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class ErrorDialog412Component {
    title = "Error";
    selectedAction: string;
    message: string;
    ERROR_TYPE_OBJ = ERROR_TYPE;

    constructor(
        public dialogRef: MatDialogRef<ErrorDialog412Component>,
        @Inject(MAT_DIALOG_DATA) public error: WFError) {
        dialogRef.disableClose = true;
        this.message = error.message;

    }

    ok(): void {
        this.dialogRef.close(this.selectedAction);
    }

    cancel() {
        this.dialogRef.close("cancel");
    }

}
