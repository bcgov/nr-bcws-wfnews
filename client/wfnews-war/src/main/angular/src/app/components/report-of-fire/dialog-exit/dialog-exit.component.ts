import { Component } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';
import { CapacitorService } from '@app/services/capacitor-service';


@Component({
  selector: 'wfnews-dialog-exit',
  templateUrl: './dialog-exit.component.html',
  styleUrls: ['./dialog-exit.component.scss']
})
export class DialogExitComponent {
  constructor(private dialogRef: MatDialogRef<DialogExitComponent>, private capacitorService: CapacitorService) { }

  closeDialog() {
    this.dialogRef.close({exit: false});
  }

  exitReport() {
    this.dialogRef.close({exit: true});
  }  
}
