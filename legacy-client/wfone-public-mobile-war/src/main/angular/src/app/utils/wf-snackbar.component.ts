import {Component, Inject} from "@angular/core";
import {MatSnackBarRef, MAT_SNACK_BAR_DATA} from "@angular/material/snack-bar";

@Component({
  selector: 'wfone-snackbar',
  template: `
      <div class="snack-bar-content">
        <div class="icon-panel">
          <mat-icon >warning</mat-icon>
        </div>
        <div class="message-panel">
          <span>{{data.message}}</span>
        </div>
      </div>

  `
})
export class WFSnackbarComponent {

  constructor(
      public snackBarRef: MatSnackBarRef<WFSnackbarComponent>,
      @Inject(MAT_SNACK_BAR_DATA) public data:any
  ) {}
}
