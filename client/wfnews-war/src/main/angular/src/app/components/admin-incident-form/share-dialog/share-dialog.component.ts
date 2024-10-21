import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { defaultSlimIconButtonStyle } from '@app/components/common/icon-button/icon-button.component';
import { AttachmentResource } from '@wf1/incidents-rest-api/model/attachmentResource';

export class DialogData {
  public attachment: AttachmentResource;
}

@Component({
  selector: 'share-dialog',
  templateUrl: 'share-dialog.component.html',
  styleUrls: ['./share-dialog.component.scss'],
})
export class ShareDialogComponent {
  public title = 'Share';
  iconButtonStyling = { ...defaultSlimIconButtonStyle, backgroundColor: '#FFF' };

  constructor(
    public dialogRef: MatDialogRef<ShareDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data,
  ) {}

  copyLink() {
    console.log(this.data.currentUrl);
  }

  email() {

  }
}
