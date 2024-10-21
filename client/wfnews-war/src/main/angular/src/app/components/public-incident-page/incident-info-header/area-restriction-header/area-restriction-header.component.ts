import { Component, Input, ViewEncapsulation } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { ShareDialogComponent } from '@app/components/admin-incident-form/share-dialog/share-dialog.component';
import { ResourcesRoutes, convertToDateYear } from '@app/utils';
import { AppConfigService } from '@wf1/core-ui';

@Component({
  selector: 'wfnews-area-restriction-header',
  templateUrl: './area-restriction-header.component.html',
  styleUrls: ['./area-restriction-header.component.scss'],
  encapsulation: ViewEncapsulation.None // This line disables view encapsulation

})
export class AreaRestrictionHeaderComponent {
  convertToDateYear = convertToDateYear;

  constructor(
    private router: Router,
    private appConfigService: AppConfigService,
    private dialog: MatDialog,

  ) {}


  @Input() areaRestriction: any;

  navToMap() {
    setTimeout(() => {
      this.router.navigate([ResourcesRoutes.ACTIVEWILDFIREMAP], {
        queryParams: {
          longitude: this.areaRestriction.centroid.x,
          latitude: this.areaRestriction.centroid.y,
          areaRestriction: true,
        },
      });
    }, 200);
  }

  openShareWindow() {
    const url = this.appConfigService.getConfig().application.baseUrl.toString() + this.router.url.slice(1);
    this.dialog.open(ShareDialogComponent, {
      panelClass: 'contact-us-dialog',
      width: '500px',
      data: {
        currentUrl: url,
        name: this.areaRestriction.attributes.NAME
      },
    });
  }

}
