import { Component } from '@angular/core';
import { IncidentContainer } from './incident-container.component';
import {
  Location,
  LocationStrategy,
  PathLocationStrategy,
} from '@angular/common';
import { Observable } from 'rxjs';
import { CheckUnsavedChanges } from '../../components/common/guards/unsaved-changes.guard';
import { UnsavedChangesDialog } from '../../components/common/unsaved-changes-dialog/unsaved-changes-dialog.component';
import { MatDialog } from '@angular/material/dialog';
import { RootState } from '../../store';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ApplicationStateService } from '../../services/application-state.service';
import { Router } from '@angular/router';
import { Store } from '@ngrx/store';

@Component({
  selector: 'wf-incident-container-desktop',
  template: ` <wf-admin-incident-desktop
    [adminIncident]="adminIncident$ | async"
    [adminIncidentCause]="adminIncidentCause$ | async"
    (changesSavedEvent)="updateChangesSaved($event)"
  ></wf-admin-incident-desktop>`,
  providers: [
    Location,
    { provide: LocationStrategy, useClass: PathLocationStrategy },
  ],
})
export class IncidentContainerDesktop
  extends IncidentContainer
  implements CheckUnsavedChanges {
  constructor(
    public dialog: MatDialog,
    store: Store<RootState>,
    router: Router,
    snackBar: MatSnackBar,
    applicationStateService: ApplicationStateService,
  ) {
    super(store, router, snackBar, applicationStateService);
  }

  isFormClean = true;

  updateChangesSaved(changesSaved: boolean) {
    this.isFormClean = changesSaved;
  }

  changesSaved: () => boolean | Observable<boolean> = () => this.isFormClean;
  confirmDialog: () => boolean | Observable<boolean> = () => this.dialog
      .open(UnsavedChangesDialog, {
        width: '450px',
      })
      .afterClosed();
}
