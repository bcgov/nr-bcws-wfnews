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
  isLinkCopied = false; 
  iconButtonStyling = { ...defaultSlimIconButtonStyle, backgroundColor: '#FFF' };

  constructor(
    public dialogRef: MatDialogRef<ShareDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data,
  ) {}

  copyLink() {
    navigator.clipboard.writeText(this.data.currentUrl).then(() => {
      console.log('URL copied to clipboard: ', this.data.currentUrl);
      this.showLinkCopiedMesage();  // Show the "Link Copied" message
    }).catch(err => {
      console.error('Could not copy URL: ', err);
    });
  }

  email() {
    const subject = `${this.data.name}`;
    const body = `${this.data.currentUrl}`;
    // Construct the mailto link
    const mailtoLink = `mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    // Open the default email client with the constructed mailto link
    window.location.href = mailtoLink;
  }

  showLinkCopiedMesage() {
    this.isLinkCopied = true;
    setTimeout(() => {
      this.isLinkCopied = false;  // Hide the message after 5 seconds
    }, 5000);
  }
}
