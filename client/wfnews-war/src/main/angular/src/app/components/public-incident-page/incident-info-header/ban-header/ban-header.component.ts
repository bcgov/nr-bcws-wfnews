import { Component, Input, ViewEncapsulation } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { ShareDialogComponent } from '@app/components/admin-incident-form/share-dialog/share-dialog.component';
import { ResourcesRoutes, convertToDateYear } from '@app/utils';
import { AppConfigService } from '@wf1/core-ui';

@Component({
  selector: 'wfnews-ban-header',
  templateUrl: './ban-header.component.html',
  styleUrls: ['./ban-header.component.scss'],
  encapsulation: ViewEncapsulation.None // This line disables view encapsulation
})
export class BanHeaderComponent {
  convertToDateYear = convertToDateYear;

  constructor(
    private router: Router,
    private appConfigService: AppConfigService,
    private dialog: MatDialog,
  ) {}


  @Input() ban: any;

  navToMap() {
    setTimeout(() => {
      this.router.navigate([ResourcesRoutes.ACTIVEWILDFIREMAP], {
        queryParams: {
          longitude: this.ban.centroid.x,
          latitude: this.ban.centroid.y,
          bansProhibitions: true,
        },
      });
    }, 200);
  }
  replaceCategoryDescription(description: string): string {
    if (description.includes("Category 1")) {
      return description.replace("Category 1", "Category 1 (Campfires)");
    }
    return description;
  }

  openShareWindow() {
    const url = this.appConfigService.getConfig().application.baseUrl.toString() + this.router.url.slice(1);
    this.dialog.open(ShareDialogComponent, {
      panelClass: 'contact-us-dialog',
      width: '500px',
      data: {
        incidentType: 'Fire Ban',
        currentUrl: url,
        name: `Fire Ban on ${this.replaceCategoryDescription(this.ban.attributes.ACCESS_PROHIBITION_DESCRIPTION)} Open Fires`
      },
    });
  }

}
