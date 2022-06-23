import { Injectable } from "@angular/core";
import { MatSnackBar, MatSnackBarRef } from "@angular/material/snack-bar";
import { convertToWFErrors } from "../conversion/conversion-error-from-rest";
import { SnackbarErrorComponent } from "../modules/im-external/components/panel-container/panel/snackbar-error.component";
import { SnackbarErrorWithOKComponent } from "../modules/im-external/components/panel-container/panel/snackbar-error-with-ok.component";
import { ErrorDialog412Component } from "../modules/core/error-dialog-412/error-dialog-412.component";
import { MatDialog } from "@angular/material/dialog";
import { WFError } from "../modules/core/models/wf-error";

@Injectable({
    providedIn: 'root'
})
export class UIReportingService {
    errorSnackbar: MatSnackBarRef<SnackbarErrorComponent|SnackbarErrorWithOKComponent>
    errorsShown: WFError[] = []

    constructor(
        protected snackbar: MatSnackBar,
        protected dialog: MatDialog,
    ) { }

    public displaySuccessMessage() {
        this.snackbar.open("Operation Successful", null, { duration: 5000 });
    }

    public displayMessage(message: string) {
        this.snackbar.open(message, null, { duration: 5000 });
    }


    public displayErrorMessage(message: string) {
        this.snackbar.open(message, 'OK', { duration: 0, panelClass: 'snackbar-error' });
    }

    public handleError(errors: any, showOkButton?: boolean, opts?: Error412CallbackOpts) {
        this.handleIncidentErrors( convertToWFErrors(errors), showOkButton, opts)
    }

    public handleIncidentErrors(errors: WFError[], showOkButton?: boolean, opts?: Error412CallbackOpts) {
        if ( !errors || errors.length == 0 ) return

        this.errorsShown = this.errorsShown.concat( errors )

        let config: any = {
            data: { errors: this.errorsShown },
            indefinite: true,
            panelClass: 'snackbar-error'
        }

        if (errors.length > 1 || errors[0].status != 412) {
            if ( showOkButton ) {
                this.errorSnackbar = this.snackbar.openFromComponent( SnackbarErrorWithOKComponent, config )
            }
            else {
                this.errorSnackbar = this.snackbar.openFromComponent( SnackbarErrorComponent, config )
            }

            this.errorSnackbar.afterDismissed().subscribe( () => {
                this.errorSnackbar = null
                this.errorsShown = []
            } )

            return
        }

        errors[0].message = `${ opts?.resourceName || "Resource" } has changed since last retrieve`

        const dialogRef = this.dialog.open(ErrorDialog412Component, {
            data: errors[0]
        } )

        dialogRef.afterClosed().subscribe(result => {
            if ("refresh" === result) {
                if (opts) {
                    opts.reloadCallback();
                }
            } else if ("overwrite" === result) {
                if (opts) {
                    opts.updateEtag(errors[0].responseEtag)
                    opts.overwriteCallback(opts.resource);
                }
            }
        } )
    }

}

export interface Error412CallbackOpts {
    reloadCallback: Function;
    overwriteCallback: Function;
    updateEtag: Function;
    resource: any;
    resourceName: string;
}
