import { Injectable, EventEmitter } from '@angular/core';
import { Subscription } from 'rxjs/internal/Subscription';

@Injectable({
  providedIn: 'root',
})
export class EventEmitterService {
  invokeKeyboardTabFunction = new EventEmitter();
  invokeSideNavAccessLocked = new EventEmitter();
  invokeAndroidBackPressed = new EventEmitter();
  invokeGoBackRoute = new EventEmitter();
  subsVar: Subscription;

  onKeyboardShiftTabPress(name: string) {
    this.invokeKeyboardTabFunction.emit(name);
  }

  sideNavAccessLocked(isLocked: boolean) {
    this.invokeSideNavAccessLocked.emit(isLocked);
  }

  androidBackButtonPressed() {
    this.invokeAndroidBackPressed.emit();
  }

  onGoBackCalled() {
    this.invokeGoBackRoute.emit();
  }
}
