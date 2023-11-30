import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { CapacitorService } from '@app/services/capacitor-service';


@Component({
  selector: 'saved-confirmation-dialog',
  templateUrl: './confirmation-dialog.component.html',
  styleUrls: ['./confirmation-dialog.component.scss']
})
export class ConfirmatinoDialogComponent {
  constructor(private dialogRef: MatDialogRef<ConfirmatinoDialogComponent>, private capacitorService: CapacitorService, @Inject(MAT_DIALOG_DATA) public data)
  { }

  closeDialog() {
    this.dialogRef.close({confirm: false});
  }

  confirm() {
    this.dialogRef.close({confirm: true});
  }  
}
