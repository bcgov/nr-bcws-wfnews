import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { DISCLAIMER_TEXT } from '@app/constants';
import { AppConfigService } from '@wf1/core-ui';

export class DialogData {
  public title: string;
  public message: string;
}

@Component({
  selector: 'disclaimer-dialog',
  templateUrl: 'disclaimer-dialog.component.html',
  styleUrls: ['./disclaimer-dialog.component.scss'],
})
export class DisclaimerDialogComponent {
  dontShowAgain = false;

  disclaimerText = DISCLAIMER_TEXT.getBcwsGeneralDisclaimer(
    this.appConfigService.getConfig().externalAppConfig,
  );

  constructor(
    public dialogRef: MatDialogRef<DisclaimerDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private appConfigService: AppConfigService,
  ) {}

  cancel() {
    this.dialogRef.close({ dontShowAgain: this.dontShowAgain });
  }
}
