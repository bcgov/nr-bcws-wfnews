import { Directive, HostListener, Injectable, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { select, Store } from '@ngrx/store';
import { RootState } from '../../store';
import { ApplicationStateService } from '../../services/application-state.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Observable, Subscription } from 'rxjs';
import { selectFormStatesUnsaved } from '../../store/application/application.selector';

@Directive()
@Injectable()
export class BaseContainer implements OnDestroy {
  unsavedForms$: Observable<boolean>;
  hasUnsavedForms = false;
  unsavedFormsSub: Subscription;
  displayLabel = '';

  constructor(
    protected store: Store<RootState>,
    protected router: Router,
    public snackBar: MatSnackBar,
    protected applicationStateService: ApplicationStateService,
  ) {
    this.unsavedForms$ = this.store.pipe(
      select(selectFormStatesUnsaved(this.getAssociatedComponentIds())),
    );
    if (this.unsavedForms$) {
      this.unsavedFormsSub = this.unsavedForms$.subscribe((value) => {
        this.hasUnsavedForms = value;
      });
    }
  }

  ngOnDestroy() {
    if (this.unsavedFormsSub) {
      this.unsavedFormsSub.unsubscribe();
    }
  }

  getAssociatedComponentIds(): string[] {
    return [];
  }

  public getHasUnsavedForms(): boolean {
    return this.hasUnsavedForms;
  }

  public getDisplayLabel(): string {
    return this.displayLabel;
  }

  @HostListener('window:beforeunload', ['$event'])
  onBeforeUnload(event) {
    if (this.hasUnsavedForms) {
      event.preventDefault();
      event.returnValue = true; //force a browser confirmation before closing the tab/window
    }
  }
}
