import { Injectable } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { CanDeactivate } from '@angular/router';
import { Observable, of } from 'rxjs';

export interface CheckUnsavedChanges {
  changesSaved: () => boolean | Observable<boolean>;
  confirmDialog: () => boolean | Observable<boolean>;
}

@Injectable()
export class CanDeactivateGuard implements CanDeactivate<CheckUnsavedChanges> {
  constructor(public dialog: MatDialog) {}

  canDeactivate(component: CheckUnsavedChanges): boolean | Observable<boolean> {
    if (!component.changesSaved()) {
      return component.confirmDialog();
    }

    return of(true);
  }
}
