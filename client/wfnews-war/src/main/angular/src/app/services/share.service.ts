import { Injectable } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { ShareDialogComponent } from '@app/components/admin-incident-form/share-dialog/share-dialog.component';
import { snowPlowHelper } from '@app/utils';
import { Share } from '@capacitor/share';
import { AppConfigService } from '@wf1/core-ui';

/** Shares the current page: the phone share sheet, or the share dialog on desktop. */
@Injectable({
  providedIn: 'root',
})
export class ShareService {
  snowPlowHelper = snowPlowHelper;

  constructor(
    private appConfigService: AppConfigService,
    private router: Router,
    private dialog: MatDialog,
  ) {}

  shareMobile(shareTitle: string) {
    const url = this.appConfigService.getConfig().application.baseUrl.toString() + this.router.url.slice(1);

    this.snowPlowHelper(url, {
      action: 'share_from_mobile_device',
      text: `${shareTitle}: ${url}`
    });

    const currentUrl = this.appConfigService.getConfig().application.baseUrl.toString() + this.router.url.slice(1);
    // contents of the share is out of scope for wfnews-2403. Enhancment should be available in wfnews-2422
    const imageUrl = this.appConfigService.getConfig().application.baseUrl.toString() + '/assets/images/share-wildfire.png';
    document.querySelector('meta[property="og:title"]')?.setAttribute('content', `${shareTitle}`);

    Share.share({
      title: shareTitle,
      url: currentUrl,
      text: '',
      dialogTitle: 'Share',
    }).then(() => {
      console.log('Sharing successful');
    }).catch(err => {
      console.error('Error sharing:', err);
    });
  }

  openShareWindow(type: string, incidentName: string) {
    const url = this.appConfigService.getConfig().application.baseUrl.toString() + this.router.url.slice(1);

    this.snowPlowHelper(url, {
      action: 'share_from_desktop',
      text: `${type}, ${incidentName}: ${url}`
    });
    this.dialog.open(ShareDialogComponent, {
      panelClass: 'contact-us-dialog',
      width: '500px',
      data: {
        incidentType: type,
        currentUrl: url,
        name: incidentName
      },
    });
  }
}
